import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import {
  clerkMiddleware,
  requireAuth,
  getAuth,
  createClerkClient,
} from "@clerk/express";
import { prisma } from "./prisma.js";
import { InvitationStatus } from "../generated/prisma/enums.js";
import { GoogleGenAI } from "@google/genai";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
});

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Health check (before Clerk middleware so it always works)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use(
  clerkMiddleware({
    clerkClient,
  })
);

// ---------------------------------------------------------------------------
// Middleware: sync Clerk user to local DB on every authenticated request
// ---------------------------------------------------------------------------
async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const clerkId = auth.userId;

    let localUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!localUser) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        "";

      // Use upsert to handle race conditions where email already exists
      localUser = await prisma.user.upsert({
        where: { email },
        update: {
          clerkId,
          firstName: clerkUser.firstName ?? null,
          lastName: clerkUser.lastName ?? null,
          imageUrl: clerkUser.imageUrl ?? null,
        },
        create: {
          clerkId,
          email,
          firstName: clerkUser.firstName ?? null,
          lastName: clerkUser.lastName ?? null,
          imageUrl: clerkUser.imageUrl ?? null,
        },
      });

      // Link any pending invitations sent to this email
      await prisma.invitation.updateMany({
        where: { inviteeEmail: email, userId: null },
        data: { userId: localUser.id },
      });
    }

    // Attach local user to request for convenience
    (req as Record<string, unknown>).localUser = localUser;
    next();
  } catch (err) {
    console.error("syncUser error:", err);
    res.status(500).json({ error: "Failed to sync user" });
  }
}

// ---------------------------------------------------------------------------
// Events CRUD
// ---------------------------------------------------------------------------
app.get(
  "/api/events",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };

      const ownedEvents = await prisma.event.findMany({
        where: { ownerId: user.id },
        include: {
          owner: true,
          invitations: { include: { user: true } },
        },
        orderBy: { startTime: "asc" },
      });

      const invitedEvents = await prisma.event.findMany({
        where: {
          invitations: { some: { userId: user.id } },
          ownerId: { not: user.id },
        },
        include: {
          owner: true,
          invitations: { include: { user: true } },
        },
        orderBy: { startTime: "asc" },
      });

      const invitations = await prisma.invitation.findMany({
        where: { userId: user.id },
      });
      const statusMap = new Map(invitations.map((i) => [i.eventId, i.status]));

      const owned = ownedEvents.map((e) => ({
        ...e,
        isOwner: true,
        myStatus: "attending" as const,
      }));
      const invited = invitedEvents.map((e) => ({
        ...e,
        isOwner: false,
        myStatus: statusMap.get(e.id) ?? ("upcoming" as const),
      }));

      res.json([...owned, ...invited]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  }
);

app.post(
  "/api/events",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const { title, description, location, startTime, endTime } = req.body as {
        title: string;
        description?: string;
        location?: string;
        startTime: string;
        endTime?: string;
      };

      if (!title?.trim() || !startTime) {
        res.status(400).json({ error: "title and startTime are required" });
        return;
      }

      const event = await prisma.event.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          location: location?.trim() || null,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          ownerId: user.id,
        },
        include: { owner: true, invitations: { include: { user: true } } },
      });

      res.status(201).json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

app.get(
  "/api/events/:id",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const event = await prisma.event.findUnique({
        where: { id: req.params.id },
        include: { owner: true, invitations: { include: { user: true } } },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const isOwner = event.ownerId === user.id;
      const inv = event.invitations.find((i) => i.userId === user.id);
      if (!isOwner && !inv) {
        res.status(403).json({ error: "Not authorized" });
        return;
      }

      res.json({
        ...event,
        isOwner,
        myStatus: isOwner ? "attending" : inv?.status ?? "upcoming",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  }
);

app.patch(
  "/api/events/:id",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const event = await prisma.event.findUnique({
        where: { id: req.params.id },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      if (event.ownerId !== user.id) {
        res.status(403).json({ error: "Only the owner can edit this event" });
        return;
      }

      const { title, description, location, startTime, endTime } =
        req.body as Record<string, unknown>;

      const updated = await prisma.event.update({
        where: { id: req.params.id },
        data: {
          ...(title != null && { title: (title as string).trim() }),
          ...(description !== undefined && {
            description: description ? (description as string).trim() : null,
          }),
          ...(location !== undefined && {
            location: location ? (location as string).trim() : null,
          }),
          ...(startTime != null && {
            startTime: new Date(startTime as string),
          }),
          ...(endTime !== undefined && {
            endTime: endTime ? new Date(endTime as string) : null,
          }),
        },
        include: { owner: true, invitations: { include: { user: true } } },
      });

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

app.delete(
  "/api/events/:id",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const event = await prisma.event.findUnique({
        where: { id: req.params.id },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      if (event.ownerId !== user.id) {
        res.status(403).json({ error: "Only the owner can delete this event" });
        return;
      }

      await prisma.event.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
);

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------
app.post(
  "/api/events/:id/invitations",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const event = await prisma.event.findUnique({
        where: { id: req.params.id },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      if (event.ownerId !== user.id) {
        res.status(403).json({ error: "Only the owner can invite people" });
        return;
      }

      const { email } = req.body as { email: string };
      if (!email?.trim()) {
        res.status(400).json({ error: "email is required" });
        return;
      }

      const normalEmail = email.trim().toLowerCase();

      // Check if invitee already has an account
      const existingUser = await prisma.user.findUnique({
        where: { email: normalEmail },
      });

      const invitation = await prisma.invitation.create({
        data: {
          eventId: req.params.id,
          inviteeEmail: normalEmail,
          userId: existingUser?.id ?? null,
          status: InvitationStatus.upcoming,
        },
        include: { user: true, event: true },
      });

      res.status(201).json(invitation);
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code
          : null;
      if (code === "P2002") {
        res.status(409).json({ error: "This person is already invited" });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Failed to create invitation" });
    }
  }
);

app.patch(
  "/api/events/:id/status",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
        email: string;
      };
      const { status } = req.body as { status: string };
      const validStatuses = ["upcoming", "attending", "maybe", "declined"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: "Invalid status" });
        return;
      }

      const invitation = await prisma.invitation.findFirst({
        where: { eventId: req.params.id, userId: user.id },
      });

      if (invitation) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: status as InvitationStatus },
        });
      } else {
        // Self-RSVP: owner or new user
        await prisma.invitation.create({
          data: {
            eventId: req.params.id,
            inviteeEmail: user.email,
            userId: user.id,
            status: status as InvitationStatus,
          },
        });
      }

      res.json({ status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

app.delete(
  "/api/events/:eventId/invitations/:invId",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const event = await prisma.event.findUnique({
        where: { id: req.params.eventId },
      });
      if (!event || event.ownerId !== user.id) {
        res.status(403).json({ error: "Not authorized" });
        return;
      }
      await prisma.invitation.delete({ where: { id: req.params.invId } });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove invitation" });
    }
  }
);

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
app.get(
  "/api/search",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const { q, from, to, location } = req.query as {
        q?: string;
        from?: string;
        to?: string;
        location?: string;
      };

      const conditions: object[] = [];
      if (q?.trim()) {
        conditions.push({
          OR: [
            { title: { contains: q.trim() } },
            { description: { contains: q.trim() } },
          ],
        });
      }
      if (from) conditions.push({ startTime: { gte: new Date(from) } });
      if (to) conditions.push({ startTime: { lte: new Date(to) } });
      if (location?.trim())
        conditions.push({ location: { contains: location.trim() } });

      const events = await prisma.event.findMany({
        where: {
          AND: [
            {
              OR: [
                { ownerId: user.id },
                { invitations: { some: { userId: user.id } } },
              ],
            },
            ...conditions,
          ],
        },
        include: { owner: true, invitations: { include: { user: true } } },
        orderBy: { startTime: "asc" },
      });

      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Search failed" });
    }
  }
);

// ---------------------------------------------------------------------------
// User search (for invite autocomplete)
// ---------------------------------------------------------------------------
app.get(
  "/api/users/search",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.query as { email?: string };
      if (!email?.trim() || email.trim().length < 2) {
        res.json([]);
        return;
      }
      const users = await prisma.user.findMany({
        where: { email: { contains: email.trim().toLowerCase() } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
        take: 10,
      });
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "User search failed" });
    }
  }
);

// ---------------------------------------------------------------------------
// AI Assistant
// ---------------------------------------------------------------------------
const AI_SYSTEM_PROMPT = `You are an AI assistant for the EventSync event scheduler app. You help users manage their events.

CAPABILITIES:
1. create_event — Create a new event. Required: title, startTime (ISO 8601). Optional: description, location, endTime.
2. update_event — Update an existing event. Required: eventId. Optional: title, description, location, startTime, endTime.
3. delete_event — Delete an event. Required: eventId.
4. set_status — Set RSVP status. Required: eventId, status (upcoming | attending | maybe | declined).
5. reply — Just respond with text (no action).

RULES:
- Always respond with a single JSON object.
- For actions: include "action" plus the required/optional fields.
- For plain replies: use { "action": "reply", "message": "your text" }.
- Infer dates relative to today. Today is ${
  new Date().toISOString().split("T")[0]
}.
- If the user is ambiguous, pick the most likely interpretation and confirm in your reply message.
- Always include a friendly "message" field describing what you did.`;

type AiAction =
  | {
      action: "create_event";
      title: string;
      startTime: string;
      description?: string;
      location?: string;
      endTime?: string;
      message?: string;
    }
  | {
      action: "update_event";
      eventId: string;
      title?: string;
      description?: string;
      location?: string;
      startTime?: string;
      endTime?: string;
      message?: string;
    }
  | { action: "delete_event"; eventId: string; message?: string }
  | {
      action: "set_status";
      eventId: string;
      status: string;
      message?: string;
    }
  | { action: "reply"; message: string };

app.post(
  "/api/ai",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const user = (req as Record<string, unknown>).localUser as {
        id: string;
      };
      const { message, events: eventsCtx } = req.body as {
        message: string;
        events?: Array<{
          id: string;
          title: string;
          startTime: string;
          location?: string;
        }>;
      };

      if (!message?.trim()) {
        res.status(400).json({ error: "message is required" });
        return;
      }

      const apiKey = process.env.GOOGLE_GENAI_API_KEY;
      if (!apiKey || apiKey === "REPLACE_ME") {
        res.status(503).json({ error: "AI is not configured yet" });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const eventsList = Array.isArray(eventsCtx) ? eventsCtx : [];
      const context = eventsList.length
        ? `User's current events:\n${eventsList
            .map(
              (e) =>
                `- [${e.id}] "${e.title}" at ${e.startTime}${
                  e.location ? ` (${e.location})` : ""
                }`
            )
            .join("\n")}`
        : "User has no events yet.";

      const prompt = `${AI_SYSTEM_PROMPT}\n\n${context}\n\nUser says: "${message}"\n\nRespond with JSON only:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.text?.trim() ?? "";
      let parsed: AiAction;
      try {
        const cleaned = text.replace(/^```json?\s*|\s*```$/g, "").trim();
        parsed = JSON.parse(cleaned) as AiAction;
      } catch {
        res.json({
          reply:
            text ||
            "Sorry, I had trouble understanding that. Try something like 'Create a meeting tomorrow at 2pm'.",
          actions: [],
        });
        return;
      }

      const actions: Array<Record<string, unknown>> = [];

      if (
        parsed.action === "create_event" &&
        parsed.title &&
        parsed.startTime
      ) {
        const event = await prisma.event.create({
          data: {
            title: parsed.title,
            description: parsed.description ?? null,
            location: parsed.location ?? null,
            startTime: new Date(parsed.startTime),
            endTime: parsed.endTime ? new Date(parsed.endTime) : null,
            ownerId: user.id,
          },
          include: { owner: true, invitations: { include: { user: true } } },
        });
        actions.push({ type: "created", event });
      } else if (parsed.action === "update_event" && parsed.eventId) {
        const ev = await prisma.event.findFirst({
          where: { id: parsed.eventId, ownerId: user.id },
        });
        if (ev) {
          const updated = await prisma.event.update({
            where: { id: parsed.eventId },
            data: {
              ...(parsed.title && { title: parsed.title }),
              ...(parsed.description !== undefined && {
                description: parsed.description || null,
              }),
              ...(parsed.location !== undefined && {
                location: parsed.location || null,
              }),
              ...(parsed.startTime && {
                startTime: new Date(parsed.startTime),
              }),
              ...(parsed.endTime !== undefined && {
                endTime: parsed.endTime ? new Date(parsed.endTime) : null,
              }),
            },
            include: {
              owner: true,
              invitations: { include: { user: true } },
            },
          });
          actions.push({ type: "updated", event: updated });
        }
      } else if (parsed.action === "delete_event" && parsed.eventId) {
        const ev = await prisma.event.findFirst({
          where: { id: parsed.eventId, ownerId: user.id },
        });
        if (ev) {
          await prisma.event.delete({ where: { id: parsed.eventId } });
          actions.push({ type: "deleted", eventId: parsed.eventId });
        }
      } else if (parsed.action === "set_status" && parsed.eventId) {
        const valid = ["upcoming", "attending", "maybe", "declined"];
        if (valid.includes(parsed.status)) {
          const inv = await prisma.invitation.findFirst({
            where: { eventId: parsed.eventId, userId: user.id },
          });
          if (inv) {
            await prisma.invitation.update({
              where: { id: inv.id },
              data: { status: parsed.status as InvitationStatus },
            });
          }
          actions.push({ type: "status_updated", status: parsed.status });
        }
      }

      res.json({
        reply: parsed.message ?? "Done!",
        actions,
      });
    } catch (err) {
      console.error("AI error:", err);
      res.status(500).json({ error: "AI request failed" });
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

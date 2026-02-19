const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return null as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface InvitationData {
  id: string;
  eventId: string;
  inviteeEmail: string;
  userId: string | null;
  status: "upcoming" | "attending" | "maybe" | "declined";
  user: UserProfile | null;
  createdAt: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  ownerId: string;
  owner: UserProfile;
  invitations: InvitationData[];
  isOwner: boolean;
  myStatus: "upcoming" | "attending" | "maybe" | "declined";
  createdAt: string;
  updatedAt: string;
}

export interface AiResponse {
  reply: string;
  actions: Array<{
    type: string;
    event?: EventData;
    eventId?: string;
    status?: string;
  }>;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------
export const api = {
  getEvents(token: string) {
    return request<EventData[]>("/api/events", {}, token);
  },

  getEvent(id: string, token: string) {
    return request<EventData>(`/api/events/${id}`, {}, token);
  },

  createEvent(
    data: {
      title: string;
      description?: string;
      location?: string;
      startTime: string;
      endTime?: string;
    },
    token: string
  ) {
    return request<EventData>(
      "/api/events",
      { method: "POST", body: JSON.stringify(data) },
      token
    );
  },

  updateEvent(
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      location: string | null;
      startTime: string;
      endTime: string | null;
    }>,
    token: string
  ) {
    return request<EventData>(
      `/api/events/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token
    );
  },

  deleteEvent(id: string, token: string) {
    return request<null>(`/api/events/${id}`, { method: "DELETE" }, token);
  },

  duplicateEvent(id: string, token: string) {
    return request<EventData>(
      `/api/events/${id}/duplicate`,
      { method: "POST" },
      token
    );
  },

  async exportEvent(id: string, token: string) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(`${API_URL}/api/events/${id}/export`, {
      headers,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match?.[1] ?? "event.ics";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  inviteToEvent(eventId: string, email: string, token: string) {
    return request<InvitationData>(
      `/api/events/${eventId}/invitations`,
      { method: "POST", body: JSON.stringify({ email }) },
      token
    );
  },

  setEventStatus(
    eventId: string,
    status: "upcoming" | "attending" | "maybe" | "declined",
    token: string
  ) {
    return request<{ status: string }>(
      `/api/events/${eventId}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token
    );
  },

  removeInvitation(eventId: string, invitationId: string, token: string) {
    return request<null>(
      `/api/events/${eventId}/invitations/${invitationId}`,
      { method: "DELETE" },
      token
    );
  },

  searchEvents(
    params: { q?: string; from?: string; to?: string; location?: string },
    token: string
  ) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.location) qs.set("location", params.location);
    return request<EventData[]>(`/api/search?${qs.toString()}`, {}, token);
  },

  searchUsers(email: string, token: string) {
    return request<UserProfile[]>(
      `/api/users/search?email=${encodeURIComponent(email)}`,
      {},
      token
    );
  },

  askAi(
    message: string,
    events: Array<{
      id: string;
      title: string;
      startTime: string;
      location?: string | null;
    }>,
    token: string
  ) {
    return request<AiResponse>(
      "/api/ai",
      { method: "POST", body: JSON.stringify({ message, events }) },
      token
    );
  },
};

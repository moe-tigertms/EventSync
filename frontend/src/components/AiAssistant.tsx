import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import type { EventData } from "../lib/api";
import { useToast } from "./Toast";
import { cn, isFullyPast } from "../lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiAssistantProps {
  events: EventData[];
  onActionPerformed: () => void;
}

export function AiAssistant({ events, onActionPerformed }: AiAssistantProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Hi! I\'m your AI scheduling assistant. Try:\n\n- "Create a team meeting tomorrow at 3pm"\n- "Move the standup to 10am"\n- "Cancel the Friday lunch"\n- "Mark me as attending the party"',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) return;

      const eventsCtx = events
        .filter((e) => !isFullyPast(e.startTime, e.endTime))
        .map((e) => ({
          id: e.id,
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          location: e.location,
          isOwner: e.isOwner,
        }));

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const chatHistory = messages.slice(1);
      const result = await api.askAi(msg, eventsCtx, token, timezone, chatHistory);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);

      if (result.actions.length > 0) {
        const action = result.actions[0];
        if (action.type === "created") {
          const invited = (action as Record<string, unknown>).invited as string[] | undefined;
          toast(
            invited?.length
              ? `Event created & ${invited.length} invite(s) sent`
              : "Event created by AI",
            "success",
          );
        } else if (action.type === "invited")
          toast(`Invitation sent to ${(action as unknown as Record<string, string>).email}`, "success");
        else if (action.type === "updated")
          toast("Event updated by AI", "success");
        else if (action.type === "deleted")
          toast("Event deleted by AI", "info");
        else if (action.type === "status_updated")
          toast("RSVP updated by AI", "success");
        onActionPerformed();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 transition-smooth flex items-center justify-center group"
        >
          <Sparkles className="w-6 h-6 group-hover:animate-spin" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/30">
          <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-[10px] text-white/70">
                  Powered by Gemini &middot; Esc to close
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary-500 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me to create or manage events..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className={cn(
                  "p-2.5 rounded-xl text-white bg-gradient-to-r from-primary-500 to-purple-500 transition-smooth",
                  loading || !input.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-primary-600 hover:to-purple-600"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

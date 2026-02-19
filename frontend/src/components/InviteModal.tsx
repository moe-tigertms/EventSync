import { useState, useEffect, useCallback } from "react";
import { X, Send, UserPlus, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import type { UserProfile, InvitationData } from "../lib/api";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { useEscape } from "../lib/useKeyboard";
import { cn } from "../lib/utils";

interface InviteModalProps {
  eventId: string;
  invitations: InvitationData[];
  onClose: () => void;
  onUpdate: () => void;
}

export function InviteModal({
  eventId,
  invitations,
  onClose,
  onUpdate,
}: InviteModalProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEscape(onClose, !loading);

  const searchUsers = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const results = await api.searchUsers(query, token);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    },
    [getToken]
  );

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(email), 300);
    return () => clearTimeout(timeout);
  }, [email, searchUsers]);

  const handleInvite = async (inviteEmail?: string) => {
    const targetEmail = inviteEmail ?? email;
    if (!targetEmail.trim()) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.inviteToEvent(eventId, targetEmail.trim(), token);
      toast(`Invited ${targetEmail}`, "success");
      setEmail("");
      setSuggestions([]);
      onUpdate();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to invite", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (invId: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      await api.removeInvitation(eventId, invId, token);
      toast("Invitation removed", "info");
      onUpdate();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold gradient-text flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite People
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="relative mb-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              placeholder="Enter email address..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => handleInvite()}
              disabled={loading || !email.trim()}
              className={cn(
                "px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-primary-500 to-purple-500 transition-smooth",
                loading || !email.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-primary-600 hover:to-purple-600"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-12 mt-1 glass rounded-xl shadow-xl border border-gray-100 py-1 z-10 max-h-48 overflow-y-auto">
              {suggestions.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setEmail(u.email);
                    setSuggestions([]);
                    handleInvite(u.email);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-50 transition-colors text-left"
                >
                  <Avatar
                    imageUrl={u.imageUrl}
                    firstName={u.firstName}
                    lastName={u.lastName}
                    email={u.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Invited ({invitations.length})
          </h3>
          {invitations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No one invited yet
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      imageUrl={inv.user?.imageUrl}
                      firstName={inv.user?.firstName}
                      lastName={inv.user?.lastName}
                      email={inv.inviteeEmail}
                      size="sm"
                      className="ring-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {inv.user
                          ? `${inv.user.firstName ?? ""} ${inv.user.lastName ?? ""}`.trim() ||
                            inv.inviteeEmail
                          : inv.inviteeEmail}
                      </p>
                      {inv.user && (
                        <p className="text-xs text-gray-500">
                          {inv.inviteeEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    <button
                      onClick={() => handleRemove(inv.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  UserPlus,
  Crown,
  CalendarDays,
  AlignLeft,
  Loader2,
  Check,
} from "lucide-react";
import { api } from "../lib/api";
import type { EventData } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { EventForm } from "../components/EventForm";
import { InviteModal } from "../components/InviteModal";
import { cn, formatDate, formatTime, getInitials } from "../lib/utils";

const statusOptions = [
  {
    value: "attending",
    label: "Attending",
    color: "from-emerald-500 to-green-500",
  },
  { value: "maybe", label: "Maybe", color: "from-amber-500 to-yellow-500" },
  { value: "declined", label: "Declined", color: "from-red-500 to-pink-500" },
] as const;

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.getEvent(id, token);
      setEvent(data);
    } catch (err) {
      console.error("Failed to fetch event:", err);
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleUpdate = async (data: {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
  }) => {
    if (!id) return;
    const token = await getToken();
    if (!token) return;
    await api.updateEvent(id, data, token);
    fetchEvent();
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this event?")) return;
    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.deleteEvent(id, token);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete:", err);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (
    status: "attending" | "maybe" | "declined"
  ) => {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.setEventStatus(id, status, token);
      fetchEvent();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Event not found
        </h2>
        <Link to="/" className="text-primary-500 hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </Link>

      {/* Main card */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Gradient banner */}
        <div className="h-32 bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex flex-col items-center justify-center text-white font-bold shadow-lg">
                <span className="text-xs uppercase">
                  {new Date(event.startTime).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
                <span className="text-2xl leading-none">
                  {new Date(event.startTime).getDate()}
                </span>
              </div>
            </div>
            {event.isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 rounded-lg bg-white/20 backdrop-blur hover:bg-red-500/80 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={event.myStatus} size="md" />
                {event.isOwner && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Crown className="w-3 h-3" />
                    Organizer
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
              <CalendarDays className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(event.startTime)}
                </p>
                <p className="text-xs text-gray-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTime(event.startTime)}
                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                </p>
              </div>
            </div>
            {event.location && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.location}
                  </p>
                  <p className="text-xs text-gray-500">Location</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <AlignLeft className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Owner info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50">
            {event.owner.imageUrl ? (
              <img
                src={event.owner.imageUrl}
                alt=""
                className="w-10 h-10 rounded-full ring-2 ring-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold ring-2 ring-white">
                {getInitials(event.owner.firstName, event.owner.lastName)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {event.owner.firstName} {event.owner.lastName}
              </p>
              <p className="text-xs text-gray-500">Organizer</p>
            </div>
          </div>

          {/* RSVP buttons (for non-owners) */}
          {!event.isOwner && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Your Response
              </h3>
              <div className="flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={updatingStatus}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-medium transition-smooth",
                      event.myStatus === opt.value
                        ? `bg-gradient-to-r ${opt.color} text-white shadow-md`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {event.myStatus === opt.value && (
                      <Check className="w-3.5 h-3.5 inline mr-1" />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invitations section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Guests ({event.invitations.length})
              </h3>
              {event.isOwner && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite
                </button>
              )}
            </div>

            {event.invitations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No guests invited yet
              </p>
            ) : (
              <div className="space-y-2">
                {event.invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      {inv.user?.imageUrl ? (
                        <img
                          src={inv.user.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                          {inv.user
                            ? getInitials(inv.user.firstName, inv.user.lastName)
                            : inv.inviteeEmail.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inv.user
                            ? `${inv.user.firstName ?? ""} ${
                                inv.user.lastName ?? ""
                              }`.trim() || inv.inviteeEmail
                            : inv.inviteeEmail}
                        </p>
                        {inv.user && (
                          <p className="text-xs text-gray-500">
                            {inv.inviteeEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <EventForm
          event={event}
          onSubmit={handleUpdate}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          eventId={event.id}
          invitations={event.invitations}
          onClose={() => setShowInvite(false)}
          onUpdate={fetchEvent}
        />
      )}
    </div>
  );
}

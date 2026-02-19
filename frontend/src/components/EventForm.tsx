import { useState } from "react";
import { X, Calendar, MapPin, AlignLeft, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { useEscape } from "../lib/useKeyboard";
import type { EventData } from "../lib/api";

interface EventFormProps {
  event?: EventData | null;
  onSubmit: (data: {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function EventForm({ event, onSubmit, onClose }: EventFormProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startTime, setStartTime] = useState(
    event?.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : ""
  );
  const [endTime, setEndTime] = useState(
    event?.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEscape(onClose, !loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime) {
      setError("Title and start time are required");
      return;
    }
    if (endTime && new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg glass rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 text-primary-500" />
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Team standup, Birthday party..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-smooth text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-primary-500" />
                Start *
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-smooth text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                End
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-smooth text-sm"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 text-primary-500" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Office, Zoom link, Park..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-smooth text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <AlignLeft className="w-4 h-4 text-primary-500" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this event about?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-smooth text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25 transition-smooth",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

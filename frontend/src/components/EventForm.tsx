import { useState, useRef, useEffect } from "react";
import { X, Calendar, MapPin, AlignLeft, Clock, AlertCircle } from "lucide-react";
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

const LOCATION_SUGGESTIONS = [
  "Office",
  "Conference Room A",
  "Conference Room B",
  "Meeting Room 1",
  "Meeting Room 2",
  "Cafeteria",
  "Online — Zoom",
  "Online — Google Meet",
  "Online — Microsoft Teams",
  "Client Site",
  "Coworking Space",
  "Hotel Lobby",
  "Restaurant",
  "Park",
];

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

interface FieldErrors {
  title?: string;
  startTime?: string;
  endTime?: string;
}

export function EventForm({ event, onSubmit, onClose }: EventFormProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startTime, setStartTime] = useState(
    event?.startTime ? toLocalDatetime(event.startTime) : "",
  );
  const [endTime, setEndTime] = useState(
    event?.endTime ? toLocalDatetime(event.endTime) : "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEscape(onClose, !loading);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(location.toLowerCase()),
  );

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "Title is required";
    else if (title.trim().length < 2) errs.title = "Title must be at least 2 characters";
    if (!startTime) errs.startTime = "Start time is required";
    else if (new Date(startTime) < new Date(new Date().getTime() - 60_000) && !event)
      errs.startTime = "Start time cannot be in the past";
    if (endTime && startTime && new Date(endTime) <= new Date(startTime))
      errs.endTime = "End time must be after start time";
    return errs;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors(validate());
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    setTouched({ title: true, startTime: true, endTime: true });
    if (Object.keys(errs).length > 0) return;

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

  const inputClass = (field?: string) =>
    cn(
      "w-full px-4 py-2.5 rounded-xl border outline-none transition-smooth text-sm",
      field && touched[field] && fieldErrors[field as keyof FieldErrors]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30"
        : "border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100",
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ marginBottom: "0" }}
    >
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 text-primary-500" />
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) setFieldErrors(validate());
              }}
              onBlur={() => handleBlur("title")}
              placeholder="Team standup, Birthday party..."
              className={inputClass("title")}
              autoFocus
            />
            {touched.title && fieldErrors.title && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-primary-500" />
                Start <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (touched.startTime) setFieldErrors(validate());
                }}
                onBlur={() => handleBlur("startTime")}
                className={inputClass("startTime")}
              />
              {touched.startTime && fieldErrors.startTime && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.startTime}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                End
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (touched.endTime) setFieldErrors(validate());
                }}
                onBlur={() => handleBlur("endTime")}
                min={startTime}
                className={inputClass("endTime")}
              />
              {touched.endTime && fieldErrors.endTime && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Location with suggestions */}
          <div ref={locationRef} className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 text-primary-500" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder="Office, Zoom link, Park..."
              className={inputClass()}
              autoComplete="off"
            />
            {showLocationSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setLocation(s);
                      setShowLocationSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
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

          {/* Global error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
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
                loading && "opacity-50 cursor-not-allowed",
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

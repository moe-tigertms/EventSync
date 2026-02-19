import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  Plus,
  Calendar,
  Inbox,
  ArrowUpDown,
  Sun,
  History,
  Bell,
} from "lucide-react";
import { api } from "../lib/api";
import type { EventData } from "../lib/api";
import { EventCard } from "../components/EventCard";
import { EventForm } from "../components/EventForm";
import { SearchBar } from "../components/SearchBar";
import { AiAssistant } from "../components/AiAssistant";
import { StatsBar } from "../components/StatsBar";
import { EventGridSkeleton } from "../components/EventCardSkeleton";
import { useToast } from "../components/Toast";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { cn, isToday, isUpcoming, isFullyPast } from "../lib/utils";

type Tab = "mine" | "invited" | "past";
type SortKey = "date-asc" | "date-desc" | "title" | "created";

const sortLabels: Record<SortKey, string> = {
  "date-asc": "Date (earliest)",
  "date-desc": "Date (latest)",
  title: "Title A-Z",
  created: "Recently created",
};

function sortEvents(events: EventData[], sort: SortKey): EventData[] {
  const sorted = [...events];
  switch (sort) {
    case "date-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    case "date-desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    case "title":
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );
    case "created":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function Dashboard() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("mine");
  const [isSearching, setIsSearching] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date-asc");
  const [showSort, setShowSort] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useDocumentTitle("Dashboard");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.getEvents(token);
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = async (params: {
    q?: string;
    from?: string;
    to?: string;
    location?: string;
  }) => {
    const hasParams = Object.values(params).some(Boolean);
    if (!hasParams) {
      setIsSearching(false);
      fetchEvents();
      return;
    }
    setIsSearching(true);
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.searchEvents(params, token);
      setEvents(data);
    } catch (err) {
      console.error("Search failed:", err);
      toast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
  }) => {
    const token = await getToken();
    if (!token) return;
    await api.createEvent(data, token);
    toast("Event created successfully", "success");
    fetchEvents();
  };

  const pastEvents = events.filter((e) => isFullyPast(e.startTime, e.endTime));
  const active = events.filter((e) => !isFullyPast(e.startTime, e.endTime));
  const myEvents = active.filter(
    (e) => e.isOwner || e.myStatus === "attending" || e.myStatus === "maybe"
  );
  const invitedEvents = active.filter(
    (e) => !e.isOwner && e.myStatus !== "attending" && e.myStatus !== "maybe"
  );
  const tabEvents =
    activeTab === "mine"
      ? myEvents
      : activeTab === "invited"
      ? invitedEvents
      : pastEvents;
  const displayEvents = sortEvents(
    tabEvents,
    activeTab === "past" && sortKey === "date-asc" ? "date-desc" : sortKey
  );

  const todayEvents = events.filter(
    (e) => isToday(e.startTime) && isUpcoming(e.startTime)
  );

  const pendingInvites = events.filter(
    (e) => !e.isOwner && e.myStatus === "upcoming" && isUpcoming(e.startTime)
  );

  return (
    <div className="space-y-6">
      {/* Pending invitations notification */}
      {!loading && pendingInvites.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 flex-shrink-0">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {pendingInvites.length === 1
                ? "You have a pending invitation"
                : `You have ${pendingInvites.length} pending invitations`}
            </p>
            <p className="text-xs text-amber-600 truncate">
              {pendingInvites
                .slice(0, 3)
                .map((e) => e.title)
                .join(", ")}
              {pendingInvites.length > 3 &&
                ` and ${pendingInvites.length - 3} more`}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("invited")}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            View
          </button>
        </div>
      )}

      {/* Hero section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSearching ? "Search Results" : "Your Events"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isSearching
              ? `Found ${events.length} event${events.length !== 1 ? "s" : ""}`
              : "Manage and track all your scheduled events"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Stats */}
      {!isSearching && !loading && <StatsBar events={events} />}

      {/* Today's events highlight */}
      {!isSearching && !loading && todayEvents.length > 0 && (
        <div className="glass rounded-xl p-4 border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-800">
              Happening Today
            </h2>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              {todayEvents.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todayEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <SearchBar onSearch={handleSearch} searchInputRef={searchRef} />

      {/* Tabs + Sort */}
      {!isSearching && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 w-fit">
            <button
              onClick={() => setActiveTab("mine")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth",
                activeTab === "mine"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Calendar className="w-4 h-4" />
              My Events
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold">
                {myEvents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("invited")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth",
                activeTab === "invited"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Inbox className="w-4 h-4" />
              Invited
              <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">
                {invitedEvents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth",
                activeTab === "past"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <History className="w-4 h-4" />
              Past
              <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
                {pastEvents.length}
              </span>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-smooth border",
                showSort
                  ? "border-primary-300 bg-primary-50 text-primary-600"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortLabels[sortKey]}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 glass rounded-xl shadow-xl border border-gray-100 py-1 z-20 min-w-[180px]">
                {(Object.entries(sortLabels) as [SortKey, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortKey(key);
                        setShowSort(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors",
                        sortKey === key
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event grid */}
      {loading ? (
        <EventGridSkeleton />
      ) : displayEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            {isSearching
              ? "No events found"
              : activeTab === "mine"
              ? "No events yet"
              : activeTab === "invited"
              ? "No invitations yet"
              : "No past events"}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {isSearching
              ? "Try different search terms or adjust your filters"
              : activeTab === "mine"
              ? "Create your first event to get started!"
              : activeTab === "invited"
              ? "You'll see events here when someone invites you"
              : "Your completed events will appear here"}
          </p>
          {!isSearching && activeTab === "mine" && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {showForm && (
        <EventForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}

      <AiAssistant events={events} onActionPerformed={fetchEvents} />
    </div>
  );
}

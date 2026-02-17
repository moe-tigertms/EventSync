import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Plus, Calendar, Inbox, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import type { EventData } from "../lib/api";
import { EventCard } from "../components/EventCard";
import { EventForm } from "../components/EventForm";
import { SearchBar } from "../components/SearchBar";
import { AiAssistant } from "../components/AiAssistant";
import { cn } from "../lib/utils";

type Tab = "mine" | "invited";

export function Dashboard() {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("mine");
  const [isSearching, setIsSearching] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.getEvents(token);
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

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
    fetchEvents();
  };

  const myEvents = events.filter((e) => e.isOwner);
  const invitedEvents = events.filter((e) => !e.isOwner);
  const displayEvents = activeTab === "mine" ? myEvents : invitedEvents;

  return (
    <div className="space-y-6">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25 transition-smooth"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Tabs */}
      {!isSearching && (
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
        </div>
      )}

      {/* Event grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
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
              : "No invitations yet"}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {isSearching
              ? "Try different search terms"
              : activeTab === "mine"
              ? "Create your first event to get started!"
              : "You'll see events here when someone invites you"}
          </p>
          {!isSearching && activeTab === "mine" && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25 transition-smooth"
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

      {/* Create event modal */}
      {showForm && (
        <EventForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}

      {/* AI Assistant */}
      <AiAssistant events={events} onActionPerformed={fetchEvents} />
    </div>
  );
}

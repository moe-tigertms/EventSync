import { Link } from "react-router-dom";
import { MapPin, Clock, Users, Crown } from "lucide-react";
import {
  cn,
  formatDate,
  formatTime,
  isUpcoming,
  getInitials,
} from "../lib/utils";
import type { EventData } from "../lib/api";
import { StatusBadge } from "./StatusBadge";

interface EventCardProps {
  event: EventData;
}

export function EventCard({ event }: EventCardProps) {
  const upcoming = isUpcoming(event.startTime);
  const attendeeCount = event.invitations.filter(
    (i) => i.status === "attending"
  ).length;

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        "group block rounded-2xl p-5 transition-smooth glass hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-0.5",
        !upcoming && "opacity-75"
      )}
    >
      {/* Top row: date badge + status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 text-white flex flex-col items-center justify-center text-xs font-bold shadow-md">
            <span className="text-[10px] uppercase leading-none">
              {new Date(event.startTime).toLocaleDateString("en-US", {
                month: "short",
              })}
            </span>
            <span className="text-lg leading-none">
              {new Date(event.startTime).getDate()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {event.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatTime(event.startTime)}
              {event.endTime && ` - ${formatTime(event.endTime)}`}
            </div>
          </div>
        </div>
        <StatusBadge status={event.myStatus} />
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {event.description}
        </p>
      )}

      {/* Bottom row: location, attendees, owner */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary-400" />
              <span className="truncate max-w-[120px]">{event.location}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-primary-400" />
            {attendeeCount + (event.isOwner ? 1 : 0)} going
          </span>
        </div>

        {/* Owner avatar */}
        <div className="flex items-center gap-1.5">
          {event.isOwner && <Crown className="w-3 h-3 text-amber-500" />}
          {event.owner.imageUrl ? (
            <img
              src={event.owner.imageUrl}
              alt={event.owner.firstName ?? "Owner"}
              className="w-6 h-6 rounded-full ring-2 ring-white"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
              {getInitials(event.owner.firstName, event.owner.lastName)}
            </div>
          )}
          <span className="text-gray-400 truncate max-w-[80px]">
            {event.isOwner ? "You" : event.owner.firstName ?? event.owner.email}
          </span>
        </div>
      </div>
    </Link>
  );
}

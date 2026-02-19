import { Link } from "react-router-dom";
import { MapPin, Clock, Users, Crown } from "lucide-react";
import { cn, formatTime, isUpcoming, relativeTime } from "../lib/utils";
import type { EventData } from "../lib/api";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "./Avatar";

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
        "group block rounded-2xl p-5 transition-smooth glass hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-0.5 relative",
        !upcoming && "opacity-60"
      )}
    >
      {!upcoming && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-gray-200/80 text-gray-500 text-[10px] font-semibold uppercase tracking-wide">
          Past
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl text-white flex flex-col items-center justify-center text-xs font-bold shadow-md",
              upcoming
                ? "bg-gradient-to-br from-primary-500 to-purple-500"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            )}
          >
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
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
              <span className="text-gray-300">|</span>
              <span className={cn(upcoming ? "text-primary-500" : "text-gray-400")}>
                {relativeTime(event.startTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={event.myStatus} />
        {event.isOwner && (
          <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            <Crown className="w-2.5 h-2.5" />
            Organizer
          </span>
        )}
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {event.description}
        </p>
      )}

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

        <div className="flex items-center gap-1.5">
          <Avatar
            imageUrl={event.owner.imageUrl}
            firstName={event.owner.firstName}
            lastName={event.owner.lastName}
            email={event.owner.email}
            size="xs"
          />
          <span className="text-gray-400 truncate max-w-[80px]">
            {event.isOwner ? "You" : event.owner.firstName ?? event.owner.email}
          </span>
        </div>
      </div>
    </Link>
  );
}

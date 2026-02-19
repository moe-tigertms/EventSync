import { Calendar, Users, Clock, CheckCircle2 } from "lucide-react";
import type { EventData } from "../lib/api";
import { isUpcoming, isPast } from "../lib/utils";

interface StatsBarProps {
  events: EventData[];
}

export function StatsBar({ events }: StatsBarProps) {
  const myEvents = events.filter((e) => e.isOwner);
  const upcomingCount = events.filter((e) => isUpcoming(e.startTime)).length;
  const pastCount = events.filter((e) => isPast(e.startTime)).length;
  const totalAttending = events.reduce(
    (sum, e) =>
      sum + e.invitations.filter((i) => i.status === "attending").length,
    0
  );

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "from-primary-500 to-indigo-500",
      bg: "bg-primary-50",
      text: "text-primary-700",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: "Completed",
      value: pastCount,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Organized",
      value: myEvents.length,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
  ];

  if (events.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass rounded-xl p-4 flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            <s.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

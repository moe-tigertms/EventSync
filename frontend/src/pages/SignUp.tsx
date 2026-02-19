import { SignUp } from "@clerk/clerk-react";
import { Bot, Users, Search, Sparkles } from "lucide-react";
import { AuthLayout, CLERK_APPEARANCE } from "../components/AuthLayout";

const stats = [
  { value: "AI", label: "Powered Assistant" },
  { value: "RSVP", label: "Live Tracking" },
  { value: "Smart", label: "Invitations" },
  { value: "Fast", label: "Event Search" },
];

const highlights = [
  { icon: Bot, text: "Create events with AI in plain English" },
  { icon: Users, text: "Invite people and track responses" },
  { icon: Search, text: "Search by date, location, or title" },
  { icon: Sparkles, text: "Beautiful, modern interface" },
];

export function SignUpPage() {
  return (
    <AuthLayout
      gradient="bg-gradient-to-br from-purple-600 via-primary-600 to-blue-500"
      headline={
        <>
          Get started
          <br />
          <span className="text-white/80">in seconds.</span>
        </>
      }
      subtitle="Join EventSync and experience the future of event management with AI-powered scheduling."
      sideContent={
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm text-center"
              >
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {highlights.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <h.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-white/80">{h.text}</p>
              </div>
            ))}
          </div>
        </>
      }
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Start scheduling smarter today
          </p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          appearance={CLERK_APPEARANCE}
        />
      </div>
    </AuthLayout>
  );
}

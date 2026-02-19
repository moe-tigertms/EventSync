import { SignIn } from "@clerk/clerk-react";
import { Bot, Users, Search, Sparkles } from "lucide-react";
import { AuthLayout, CLERK_APPEARANCE } from "../components/AuthLayout";

const features = [
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Create events with natural language",
  },
  {
    icon: Users,
    title: "Smart Invitations",
    desc: "Invite & track RSVPs in real-time",
  },
  {
    icon: Search,
    title: "Powerful Search",
    desc: "Find events by date, location, or keyword",
  },
  {
    icon: Sparkles,
    title: "Status Tracking",
    desc: "Upcoming, attending, maybe, or declined",
  },
];

export function SignInPage() {
  return (
    <AuthLayout
      gradient="bg-gradient-to-br from-primary-600 via-purple-600 to-accent-500"
      headline={
        <>
          Schedule smarter,
          <br />
          <span className="text-white/80">not harder.</span>
        </>
      }
      subtitle="The AI-powered event scheduler that helps you organize, invite, and manage events effortlessly."
      sideContent={
        <div className="space-y-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-white/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to manage your events
          </p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={CLERK_APPEARANCE}
        />
      </div>
    </AuthLayout>
  );
}

import { SignIn } from "@clerk/clerk-react";
import { Calendar, Sparkles, Users, Search, Bot } from "lucide-react";

export function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-purple-600 to-accent-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 rounded-full bg-white/10" />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-60" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EventSync</h1>
              <p className="text-xs text-white/60 font-medium tracking-wider uppercase">
                Smart Scheduling
              </p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Schedule smarter,
            <br />
            <span className="text-white/80">not harder.</span>
          </h2>
          <p className="text-lg text-white/70 mb-12 max-w-md">
            The AI-powered event scheduler that helps you organize, invite, and
            manage events effortlessly.
          </p>

          {/* Feature cards */}
          <div className="space-y-4">
            {[
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
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {feature.title}
                  </p>
                  <p className="text-xs text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Sign In form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
        {/* Mobile logo (hidden on desktop) */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">EventSync</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              Smart Scheduling
            </p>
          </div>
        </div>

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
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "w-full shadow-none bg-transparent p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "rounded-xl border-gray-200 hover:bg-gray-50 transition-all cursor-pointer",
                formButtonPrimary:
                  "bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 rounded-xl shadow-lg shadow-primary-500/25 cursor-pointer",
                formFieldInput:
                  "rounded-xl border-gray-200 focus:border-primary-400 focus:ring-primary-100",
                footerActionLink:
                  "text-primary-600 hover:text-primary-700 font-semibold",
                identityPreviewEditButton: "text-primary-600 cursor-pointer",
                formFieldAction: "text-primary-600 cursor-pointer",
              },
            }}
          />
        </div>

        <p className="mt-12 text-xs text-gray-400">
          EventSync &mdash; AI-powered event scheduling
        </p>
      </div>
    </div>
  );
}

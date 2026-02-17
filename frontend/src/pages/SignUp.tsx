import { SignUp } from "@clerk/clerk-react";
import { Calendar, Sparkles, Users, Search, Bot } from "lucide-react";

export function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-primary-600 to-blue-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-1/4 w-48 h-48 rounded-full bg-white/10" />

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
            Get started
            <br />
            <span className="text-white/80">in seconds.</span>
          </h2>
          <p className="text-lg text-white/70 mb-12 max-w-md">
            Join EventSync and experience the future of event management with
            AI-powered scheduling.
          </p>

          {/* Stats / social proof */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { value: "AI", label: "Powered Assistant" },
              { value: "RSVP", label: "Live Tracking" },
              { value: "Smart", label: "Invitations" },
              { value: "Fast", label: "Event Search" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm text-center"
              >
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: Bot, text: "Create events with AI in plain English" },
              { icon: Users, text: "Invite people and track responses" },
              { icon: Search, text: "Search by date, location, or title" },
              { icon: Sparkles, text: "Beautiful, modern interface" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-white/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Sign Up form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
        {/* Mobile logo (hidden on desktop) */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-primary-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
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
                  "bg-gradient-to-r from-purple-500 to-primary-500 hover:from-purple-600 hover:to-primary-600 rounded-xl shadow-lg shadow-purple-500/25 cursor-pointer",
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

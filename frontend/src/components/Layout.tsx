import { Outlet, Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Calendar, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-smooth">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">EventSync</h1>
                <p className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wider uppercase">
                  Smart Scheduling
                </p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-smooth",
                  location.pathname === "/"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Events
                </span>
              </Link>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-purple-50 text-primary-600 text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI Powered
                </div>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-primary-200",
                    },
                  }}
                />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        <p>EventSync &mdash; AI-powered event scheduling</p>
      </footer>
    </div>
  );
}

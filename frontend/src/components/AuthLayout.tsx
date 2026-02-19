import { type ReactNode } from "react";
import { Calendar } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  gradient: string;
  headline: ReactNode;
  subtitle: string;
  sideContent: ReactNode;
}

const DOT_PATTERN =
  "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')]";

export function AuthLayout({
  children,
  gradient,
  headline,
  subtitle,
  sideContent,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div
        className={`hidden lg:flex lg:w-1/2 ${gradient} relative overflow-hidden`}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 rounded-full bg-white/10" />
        <div className={`absolute inset-0 ${DOT_PATTERN} opacity-60`} />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
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

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            {headline}
          </h2>
          <p className="text-lg text-white/70 mb-12 max-w-md">{subtitle}</p>

          {sideContent}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
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

        {children}

        <p className="mt-12 text-xs text-gray-400">
          EventSync &mdash; AI-powered event scheduling
        </p>
      </div>
    </div>
  );
}

export const CLERK_APPEARANCE = {
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
    footerActionLink: "text-primary-600 hover:text-primary-700 font-semibold",
    identityPreviewEditButton: "text-primary-600 cursor-pointer",
    formFieldAction: "text-primary-600 cursor-pointer",
  },
} as const;

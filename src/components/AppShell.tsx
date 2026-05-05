import { useEffect, useState } from "react";
import { LANGUAGES, type LangCode, getStoredLang, setStoredLang } from "@/lib/languages";
import { useOnline } from "@/hooks/use-online";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangCode>("en-US");
  const online = useOnline();
  const location = useLocation();

  useEffect(() => {
    setLang(getStoredLang());
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as LangCode;
    setLang(v);
    setStoredLang(v);
    // Trigger any listeners
    window.dispatchEvent(new CustomEvent("agrisense:lang", { detail: v }));
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo />
            <div className="leading-tight">
              <p className="font-display font-bold text-base sm:text-lg text-foreground">AgriSense AI</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">Field Advisor</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ConnectivityBadge online={online} />
            <label className="sr-only" htmlFor="lang">Language</label>
            <select
              id="lang"
              value={lang}
              onChange={onChange}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <BottomNav currentPath={location.pathname} />
    </div>
  );
}

function ConnectivityBadge({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        online
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/40 bg-warning/15 text-warning-foreground",
      )}
      title={online ? "Online" : "Offline"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-success" : "bg-warning")} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

function BottomNav({ currentPath }: { currentPath: string }) {
  const items = [
    { to: "/" as const, label: "Home", icon: HomeIcon },
    { to: "/diagnose" as const, label: "Diagnose", icon: CameraIcon },
    { to: "/ask" as const, label: "Ask", icon: MicIcon },
    { to: "/knowledge" as const, label: "Learn", icon: BookIcon },
  ];
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? currentPath === "/" : currentPath.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)]",
        className,
      )}
      style={{ background: "var(--gradient-primary)" }}
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" />
        <path d="M5 9c0 5 3 9 7 11 4-2 7-6 7-11" />
        <path d="M9 12c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
      </svg>
    </span>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 12 4l9 8" /><path d="M5 10v10h14V10" />
    </svg>
  );
}
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h3l2-3h8l2 3h3v13H3z" /><circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" />
    </svg>
  );
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><path d="M4 16a4 4 0 0 1 4-4h12" />
    </svg>
  );
}

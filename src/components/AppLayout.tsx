import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Clock, BookOpen, Users, LogOut, Moon, Sun } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/history", label: "Histórico", icon: Clock },
  { to: "/occurrences", label: "Ocorrências", icon: BookOpen },
  { to: "/residents", label: "Cadastros", icon: Users },
];

const PAGE_BG: Record<string, string> = {
  dashboard: "bg-background",
  history: "bg-background",
  occurrences: "bg-background",
  residents: "bg-background",
};

interface Props {
  children: ReactNode;
  pageId?: string;
}

const AppLayout = ({ children, pageId }: Props) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const resolvedPageId =
    pageId ||
    (location.pathname === "/dashboard"
      ? "dashboard"
      : location.pathname === "/history"
      ? "history"
      : location.pathname === "/occurrences"
      ? "occurrences"
      : location.pathname === "/residents"
      ? "residents"
      : "dashboard");

  const pageBg = PAGE_BG[resolvedPageId] || PAGE_BG.dashboard;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      {/* Top nav bar — glass effect, larger & more imposing */}
      <header className="sticky top-0 z-40 glass no-print border-b border-border/30">
        <div className="mx-auto flex flex-col max-w-5xl px-4">
          {/* Top row: user actions */}
          <div className="flex h-10 sm:h-12 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </Button>
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline ml-1">
                {user?.email || "Portaria"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </Button>
          </div>

          {/* Navigation row — full width on mobile */}
          <nav className="flex items-center justify-center pb-3 sm:pb-3">
            <div className="flex items-center w-full sm:w-auto rounded-2xl bg-secondary/80 backdrop-blur-sm p-1.5 gap-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                const isDashboard = to === "/dashboard";
                return (
                  <Link key={to} to={to} className="flex-1 sm:flex-none">
                    <button
                      className={`flex items-center justify-center gap-1.5 w-full rounded-xl px-2 sm:px-4 py-2.5 sm:py-2 text-[13px] sm:text-[13px] font-semibold transition-all duration-200 overflow-hidden ${
                        isActive
                          ? isDashboard
                            ? "bg-primary text-primary-foreground shadow-md btn-glow"
                            : "bg-card text-foreground shadow-sm"
                          : isDashboard
                            ? "text-primary font-bold hover:bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] sm:h-4 sm:w-4 shrink-0" />
                      <span className="text-[11px] sm:text-[13px] truncate">{label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;

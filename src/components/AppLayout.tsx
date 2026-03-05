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
  history: "bg-[hsl(220_14%_90%)] dark:bg-background",
  occurrences: "bg-[hsl(200_12%_91%)] dark:bg-background",
  residents: "bg-[hsl(210_10%_91%)] dark:bg-background",
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
      {/* Top nav bar */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border no-print">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
              {user?.email || "Portaria"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex items-center rounded-2xl bg-secondary p-1.5 gap-1 shadow-sm">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              const isDashboard = to === "/dashboard";
              return (
                <Link key={to} to={to}>
                  <button
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      isActive
                        ? isDashboard
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card text-foreground shadow-sm"
                        : isDashboard
                          ? "text-primary font-extrabold hover:bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;

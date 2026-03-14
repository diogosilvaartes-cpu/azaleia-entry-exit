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
      {/* Top nav bar — glass effect */}
      <header className="sticky top-0 z-40 glass no-print">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline ml-1">
              {user?.email || "Portaria"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex items-center rounded-2xl bg-secondary/80 backdrop-blur-sm p-1 gap-0.5">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              const isDashboard = to === "/dashboard";
              return (
                <Link key={to} to={to}>
                  <button
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                      isActive
                        ? isDashboard
                          ? "bg-primary text-primary-foreground shadow-md btn-glow"
                          : "bg-card text-foreground shadow-sm"
                        : isDashboard
                          ? "text-primary font-bold hover:bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
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

import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PlusCircle, History, LogOut, Users, BookOpen } from "lucide-react";
import logoFlor from "@/assets/logo_azaleia_flor.png";

const navItems = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/new", label: "Nova Entrada", icon: PlusCircle },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/occurrences", label: "Ocorrências", icon: BookOpen },
  { to: "/residents", label: "Cadastros", icon: Users },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Subtle leaf texture overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url(${logoFlor})`,
          backgroundSize: '120px',
          backgroundRepeat: 'repeat',
        }}
      />
      <header className="sticky top-0 z-40 border-b-2 border-primary/20 bg-card/95 backdrop-blur-sm no-print shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={logoFlor} alt="Azaléia" className="h-8 w-8" />
            <span className="hidden font-semibold text-foreground sm:inline">
              Residencial Azaleia
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant={location.pathname === to ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground lg:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;

import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight, LogIn, LogOut as LogOutIcon, ChevronRight, User } from "lucide-react";
import { useActiveEntries, useTodayStats, useRegisterExit } from "@/hooks/useAccessLogs";
import { useToast } from "@/hooks/use-toast";
import PlateBadge from "@/components/PlateBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const Dashboard = () => {
  const { data: stats } = useTodayStats();
  const { data: active, isLoading: activeLoading } = useActiveEntries();
  const registerExit = useRegisterExit();
  const { toast } = useToast();

  const handleExit = async (id: string) => {
    try {
      await registerExit.mutateAsync(id);
      toast({ title: "Saída registrada com sucesso" });
    } catch {
      toast({ title: "Erro ao registrar saída", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Residencial Azaleia</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Two big action buttons */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <Link to="/new" className="block">
          <button className="w-full h-28 rounded-[20px] bg-[hsl(211,100%,50%)] text-white flex items-center justify-center gap-3 text-xl font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] hover:brightness-110">
            <PlusCircle className="h-7 w-7" />
            Nova Entrada
          </button>
        </Link>
        <Link to="/exit" className="block">
          <button className="w-full h-28 rounded-[20px] bg-[hsl(145,65%,42%)] text-white flex items-center justify-center gap-3 text-xl font-semibold shadow-lg shadow-success/20 transition-transform active:scale-[0.98] hover:brightness-110">
            <ArrowUpRight className="h-7 w-7" />
            Nova Saída
          </button>
        </Link>
      </div>

      {/* Active Entries */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Ativos Agora {active?.length ? `(${active.length})` : ""}
        </h2>

        {activeLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : !active?.length ? (
          <div className="apple-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma entrada ativa no momento.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((log) => (
              <AlertDialog key={log.id}>
                <AlertDialogTrigger asChild>
                  <button className="apple-card p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer">
                    <div className="flex-1 min-w-0">
                      {log.plate ? (
                        <PlateBadge plate={log.plate} size="sm" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-semibold text-lg">Visitante</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 truncate">
                        {log.destination} • {log.driver_name}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
                    <AlertDialogDescription>
                      Registrar saída de <strong>{log.driver_name}</strong>
                      {log.plate ? ` (${log.plate})` : ""}?
                      <br />
                      <span className="text-xs">Entrada: {formatTime(log.entry_time)}</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleExit(log.id)}>
                      Confirmar Saída
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
          </div>
        )}
      </div>

      {/* Stats at bottom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="apple-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entradas Hoje</p>
            <p className="text-2xl font-bold">{stats?.entries ?? 0}</p>
          </div>
        </div>
        <div className="apple-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
            <LogOutIcon className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saídas Hoje</p>
            <p className="text-2xl font-bold">{stats?.exits ?? 0}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

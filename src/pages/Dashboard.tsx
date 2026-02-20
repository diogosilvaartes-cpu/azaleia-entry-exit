import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, LogIn, LogOut as LogOutIcon, Users, Clock } from "lucide-react";
import { useActiveEntries, useTodayStats, useRegisterExit } from "@/hooks/useAccessLogs";
import { useToast } from "@/hooks/use-toast";
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
  const { data: stats, isLoading: statsLoading } = useTodayStats();
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

  const statCards = [
    {
      label: "Entradas Hoje",
      value: stats?.entries ?? 0,
      icon: LogIn,
      color: "text-primary",
    },
    {
      label: "Saídas Hoje",
      value: stats?.exits ?? 0,
      icon: LogOutIcon,
      color: "text-success",
    },
    {
      label: "Ativos Agora",
      value: stats?.active ?? 0,
      icon: Users,
      color: "text-warning",
    },
  ];

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link to="/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Entrada
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? "–" : s.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-warning" />
            Ativos Agora
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !active?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma entrada ativa no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {active.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{log.driver_name}</span>
                      {log.plate && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.plate}
                        </Badge>
                      )}
                      <Badge variant="secondary">{log.destination}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entrada: {formatTime(log.entry_time)} · Liberado por: {log.authorized_by}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 border-success text-success hover:bg-success hover:text-success-foreground"
                      >
                        <LogOutIcon className="h-3.5 w-3.5" />
                        Dar Saída
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
                        <AlertDialogDescription>
                          Registrar saída de <strong>{log.driver_name}</strong>
                          {log.plate ? ` (${log.plate})` : ""}?
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Dashboard;

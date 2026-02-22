import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, LogIn, LogOut as LogOutIcon, Users, Clock } from "lucide-react";
import { useActiveEntries, useTodayStats, useRegisterExit } from "@/hooks/useAccessLogs";
import { useToast } from "@/hooks/use-toast";
import ShiftNotesWidget from "@/components/ShiftNotesWidget";
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


  return (
    <AppLayout>
      <div className="mb-6">
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

      {/* Action Buttons + Active Now */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Link to="/new" className="block">
          <Card className="h-full cursor-pointer border-2 border-primary/40 bg-primary/5 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
              <div className="rounded-xl bg-primary p-4 text-primary-foreground shadow-md">
                <PlusCircle className="h-7 w-7" />
              </div>
              <span className="text-lg font-bold text-primary">Nova Entrada</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/exit" className="block">
          <Card className="h-full cursor-pointer border-2 border-accent/40 bg-accent/5 transition-all hover:border-accent hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/10 animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
              <div className="rounded-xl bg-accent p-4 text-accent-foreground shadow-md">
                <LogOutIcon className="h-7 w-7" />
              </div>
              <span className="text-lg font-bold text-accent">Nova Saída</span>
            </CardContent>
          </Card>
        </Link>
        <Card className="border-2 border-warning/40 bg-warning/5 animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
            <div className="rounded-xl bg-warning p-4 text-warning-foreground shadow-md">
              <Users className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold text-warning">
              {statsLoading ? "–" : stats?.active ?? 0}
            </span>
            <span className="text-sm font-medium text-muted-foreground">Ativos Agora</span>
          </CardContent>
        </Card>
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
                        <Badge className="bg-accent text-accent-foreground font-mono text-sm font-bold tracking-wider shadow-sm">
                          {log.plate}
                        </Badge>
                      )}
                      <Badge variant="secondary">{log.destination}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entrada: {formatTime(log.entry_time)}{log.authorized_by ? ` · Liberado por: ${log.authorized_by}` : ""}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
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
      {/* Shift Notes */}
      <div className="mt-6">
        <ShiftNotesWidget />
      </div>

      {/* Stats summary at the bottom */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="animate-fade-in border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entradas Hoje</p>
              <p className="text-3xl font-bold text-primary">
                {statsLoading ? "–" : stats?.entries ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in border-l-4 border-l-accent">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-accent p-3 text-accent-foreground shadow-sm">
              <LogOutIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saídas Hoje</p>
              <p className="text-3xl font-bold text-accent">
                {statsLoading ? "–" : stats?.exits ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

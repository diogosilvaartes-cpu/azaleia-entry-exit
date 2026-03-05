import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { PlusCircle, ArrowUpRight, LogOut as LogOutIcon, User, Pencil } from "lucide-react";
import { useActiveEntries, useRegisterExit, useHistoryLogs } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import PlateBadge from "@/components/PlateBadge";
import AccessLogSheet from "@/components/AccessLogSheet";
import DoormanTag from "@/components/DoormanTag";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AccessLog } from "@/lib/types";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const Dashboard = () => {
  const { data: active, isLoading: activeLoading } = useActiveEntries();
  const { data: residents } = useResidents();
  const registerExit = useRegisterExit();
  const { toast } = useToast();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayLogs } = useHistoryLogs({ dateFrom: today.toISOString() });

  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [exitTarget, setExitTarget] = useState<AccessLog | null>(null);

  const handleExit = async (id: string) => {
    try {
      await registerExit.mutateAsync(id);
      toast({ title: "Saída registrada com sucesso" });
      setExitTarget(null);
    } catch {
      toast({ title: "Erro ao registrar saída", variant: "destructive" });
    }
  };

  const findResident = (name: string, plate: string | null) =>
    residents?.find(r =>
      r.name.toLowerCase() === name.toLowerCase() ||
      (plate && r.plate && r.plate.toLowerCase() === plate.toLowerCase())
    );

  const activeVisitors = useMemo(() => {
    if (!active || !residents) return active || [];
    const residentNames = new Set(residents.map(r => r.name.toLowerCase()));
    const residentPlates = new Set(
      residents.filter(r => r.plate).map(r => r.plate!.toLowerCase())
    );
    return active.filter(log => {
      const isResident = residentNames.has(log.driver_name.toLowerCase()) ||
        (log.plate && residentPlates.has(log.plate.toLowerCase()));
      return !isResident;
    });
  }, [active, residents]);

  const openSheet = (log: AccessLog) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  return (
    <AppLayout pageId="dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Residencial Azaleia</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </p>
      </div>

      {/* Two big action buttons */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <Link to="/new" className="block">
          <button className="w-full h-28 rounded-[20px] bg-primary text-primary-foreground flex items-center justify-center gap-3 text-xl font-extrabold shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] hover:brightness-110">
            <PlusCircle className="h-7 w-7" />
            Nova Entrada
          </button>
        </Link>
        <Link to="/exit" className="block">
          <button className="w-full h-28 rounded-[20px] bg-success text-success-foreground flex items-center justify-center gap-3 text-xl font-extrabold shadow-lg shadow-success/25 transition-transform active:scale-[0.98] hover:brightness-110">
            <ArrowUpRight className="h-7 w-7" />
            Nova Saída
          </button>
        </Link>
      </div>

      {/* Active Visitors Only */}
      <div className="mb-8">
        <h2 className="text-lg font-extrabold text-foreground mb-3 tracking-tight">
          Visitantes Ativos {activeVisitors.length ? `(${activeVisitors.length})` : ""}
        </h2>

        {activeLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Carregando...</p>
        ) : !activeVisitors.length ? (
          <div className="apple-card p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Nenhum visitante ativo no momento.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeVisitors.map((log) => {
              const resident = findResident(log.driver_name, log.plate);
              return (
                <div key={log.id} className="apple-card p-4 flex items-center gap-4 transition-all hover:shadow-md">
                  <button onClick={() => openSheet(log)} className="shrink-0">
                    {resident?.photo_url ? (
                      <img src={resident.photo_url} alt={log.driver_name} className="h-14 w-14 rounded-full object-cover border-2 border-primary/30 shadow" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                    )}
                  </button>

                  <button onClick={() => openSheet(log)} className="flex-1 min-w-0 text-left">
                    <p className="text-3xl font-black text-foreground leading-none">{log.destination}</p>
                    <p className="text-base font-bold text-foreground/80 mt-1 uppercase truncate">{log.driver_name}</p>
                    {log.plate && (
                      <div className="mt-1.5">
                        <PlateBadge plate={log.plate} size="sm" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-semibold text-muted-foreground">{formatTime(log.entry_time)}</p>
                      <DoormanTag userId={log.created_by} />
                    </div>
                  </button>

                  <div className="shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => setExitTarget(log)}
                      className="h-11 w-11 rounded-xl bg-success/15 flex items-center justify-center hover:bg-success/25 transition-colors"
                      title="Dar saída"
                    >
                      <LogOutIcon className="h-5 w-5 text-success" />
                    </button>
                    <button
                      onClick={() => openSheet(log)}
                      className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's History */}
      <div>
        <h2 className="text-lg font-extrabold text-foreground mb-3 tracking-tight">
          Histórico de Hoje {todayLogs?.length ? `(${todayLogs.length})` : ""}
        </h2>

        {!todayLogs?.length ? (
          <div className="apple-card p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Nenhum registro hoje.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="w-full rounded-xl bg-card border border-border px-4 py-2.5 transition-all hover:bg-accent/50"
              >
                {/* Desktop: single row */}
                <div className="hidden sm:flex items-center gap-3">
                  <button onClick={() => openSheet(log)} className="flex-1 min-w-0 flex items-center gap-3 text-left">
                    <span className="text-sm font-extrabold text-foreground w-12 shrink-0">
                      {formatTime(log.entry_time)}
                    </span>
                    <span className="text-lg font-black text-foreground w-12 shrink-0">{log.destination}</span>
                    <span className="text-sm font-bold text-foreground/80 uppercase truncate flex-1">{log.driver_name}</span>
                    {log.plate && <PlateBadge plate={log.plate} size="sm" />}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      log.exit_time
                        ? "bg-muted text-muted-foreground"
                        : "bg-warning/20 text-warning"
                    }`}>
                      {log.exit_time ? `↑${new Date(log.exit_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "ATIVO"}
                    </span>
                    <DoormanTag userId={log.created_by} />
                  </button>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {!log.exit_time && (
                      <button onClick={() => setExitTarget(log)} className="h-8 w-8 rounded-lg bg-success/15 flex items-center justify-center hover:bg-success/25 transition-colors" title="Dar saída">
                        <LogOutIcon className="h-4 w-4 text-success" />
                      </button>
                    )}
                    <button onClick={() => openSheet(log)} className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" title="Editar">
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Mobile: stacked layout */}
                <button onClick={() => openSheet(log)} className="sm:hidden w-full text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">{formatTime(log.entry_time)}</span>
                      <span className="text-lg font-black text-foreground">{log.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.exit_time
                          ? "bg-muted text-muted-foreground"
                          : "bg-warning/20 text-warning"
                      }`}>
                        {log.exit_time ? `↑${new Date(log.exit_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "ATIVO"}
                      </span>
                      {!log.exit_time && (
                        <button onClick={(e) => { e.stopPropagation(); setExitTarget(log); }} className="h-7 w-7 rounded-lg bg-success/15 flex items-center justify-center" title="Dar saída">
                          <LogOutIcon className="h-3.5 w-3.5 text-success" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-foreground/80 uppercase truncate">{log.driver_name}</span>
                    {log.plate && <PlateBadge plate={log.plate} size="sm" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <DoormanTag userId={log.created_by} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <AccessLogSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        residentPhoto={selectedLog ? findResident(selectedLog.driver_name, selectedLog.plate)?.photo_url : null}
        carPhoto={selectedLog ? findResident(selectedLog.driver_name, selectedLog.plate)?.car_photo_url : null}
      />

      {/* Exit confirmation dialog */}
      <AlertDialog open={!!exitTarget} onOpenChange={(open) => !open && setExitTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold">Confirmar saída</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Registrar saída de <strong className="text-foreground">{exitTarget?.driver_name}</strong>
              {exitTarget?.plate ? ` (${exitTarget.plate})` : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => exitTarget && handleExit(exitTarget.id)}
              className="bg-success hover:bg-success/90 font-extrabold"
            >
              CONFIRMAR SAÍDA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Dashboard;

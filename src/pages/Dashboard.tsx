import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { PlusCircle, ArrowUpRight, LogIn, LogOut as LogOutIcon, User } from "lucide-react";
import { useActiveEntries, useTodayStats, useRegisterExit } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import PlateBadge from "@/components/PlateBadge";
import AccessLogSheet from "@/components/AccessLogSheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AccessLog } from "@/lib/types";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const Dashboard = () => {
  const { data: stats } = useTodayStats();
  const { data: active, isLoading: activeLoading } = useActiveEntries();
  const { data: residents } = useResidents();
  const registerExit = useRegisterExit();
  const { toast } = useToast();

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

  const openSheet = (log: AccessLog) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  return (
    <AppLayout>
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

      {/* Active Entries */}
      <div className="mb-8">
        <h2 className="text-lg font-extrabold text-foreground mb-3 tracking-tight">
          Ativos Agora {active?.length ? `(${active.length})` : ""}
        </h2>

        {activeLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Carregando...</p>
        ) : !active?.length ? (
          <div className="apple-card p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Nenhuma entrada ativa no momento.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((log) => {
              const resident = findResident(log.driver_name, log.plate);
              return (
                <div key={log.id} className="apple-card p-4 flex items-center gap-4 transition-all hover:shadow-md">
                  {/* Photo */}
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
                    {/* Destination HUGE */}
                    <p className="text-3xl font-black text-foreground leading-none">{log.destination}</p>
                    <p className="text-base font-bold text-foreground/80 mt-1 uppercase truncate">{log.driver_name}</p>
                    {log.plate && (
                      <div className="mt-1.5">
                        <PlateBadge plate={log.plate} size="sm" />
                      </div>
                    )}
                    <p className="text-xs font-semibold text-muted-foreground mt-1">{formatTime(log.entry_time)}</p>
                  </button>

                  {/* Quick exit button */}
                  <button
                    onClick={() => setExitTarget(log)}
                    className="shrink-0 h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center hover:bg-success/25 transition-colors"
                  >
                    <LogOutIcon className="h-5 w-5 text-success" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats at bottom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="apple-card p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Entradas Hoje</p>
            <p className="text-3xl font-black text-foreground">{stats?.entries ?? 0}</p>
          </div>
        </div>
        <div className="apple-card p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center">
            <LogOutIcon className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saídas Hoje</p>
            <p className="text-3xl font-black text-foreground">{stats?.exits ?? 0}</p>
          </div>
        </div>
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

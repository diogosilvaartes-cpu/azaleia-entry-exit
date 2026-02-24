import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, User, ChevronRight } from "lucide-react";
import { useActiveEntries, useRegisterExit } from "@/hooks/useAccessLogs";
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

const NewExit = () => {
  const navigate = useNavigate();
  const { data: active, isLoading } = useActiveEntries();
  const registerExit = useRegisterExit();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!active) return [];
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter(
      (log) =>
        log.driver_name.toLowerCase().includes(q) ||
        (log.plate && log.plate.toLowerCase().includes(q)) ||
        log.destination.toLowerCase().includes(q)
    );
  }, [active, search]);

  const handleExit = async (id: string) => {
    try {
      await registerExit.mutateAsync(id);
      toast({ title: "Saída registrada com sucesso!" });
      if (filtered.length <= 1) navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar saída", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium flex items-center gap-1 hover:opacity-70">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1 text-center pr-16">NOVA SAÍDA</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-2xl bg-card border-0 shadow-sm"
          />
        </div>

        {/* Active entries list */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
        ) : !filtered.length ? (
          <div className="apple-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? "Nenhuma entrada encontrada." : "Nenhuma entrada ativa."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) => (
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
                          <span className="font-semibold text-lg">{log.driver_name}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {log.destination} • {log.driver_name} • {formatTime(log.entry_time)}
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
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleExit(log.id)}
                      className="bg-success hover:bg-success/90"
                    >
                      CONFIRMAR SAÍDA
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NewExit;

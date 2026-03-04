import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, User, ChevronRight, LogOut } from "lucide-react";
import { useActiveEntries, useRegisterExit, useCreateStandaloneExit } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import PlateBadge from "@/components/PlateBadge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const NewExit = () => {
  const navigate = useNavigate();
  const { data: active, isLoading } = useActiveEntries();
  const { data: residents } = useResidents();
  const registerExit = useRegisterExit();
  const createStandaloneExit = useCreateStandaloneExit();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"moradores" | "visitantes">("moradores");

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

  const filteredResidents = useMemo(() => {
    const list = (residents || []).filter(r => r.type === "morador");
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.plate && r.plate.toLowerCase().includes(q)) ||
      (r.unit && r.unit.toLowerCase().includes(q))
    );
  }, [residents, search]);

  const filteredVisitors = useMemo(() => {
    const list = (residents || []).filter(r => r.type !== "morador");
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.plate && r.plate.toLowerCase().includes(q)) ||
      (r.unit && r.unit.toLowerCase().includes(q))
    );
  }, [residents, search]);

  const handleExit = async (id: string) => {
    try {
      await registerExit.mutateAsync(id);
      toast({ title: "Saída registrada com sucesso!" });
      if (filtered.length <= 1) navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar saída", variant: "destructive" });
    }
  };

  const handleStandaloneExit = async (resident: typeof filteredResidents[0]) => {
    try {
      await createStandaloneExit.mutateAsync({
        driver_name: resident.name,
        plate: resident.plate || undefined,
        destination: resident.unit || "Residência",
        car_model: resident.car_model || undefined,
        car_color: resident.car_color || undefined,
      });
      toast({ title: `Saída registrada: ${resident.name}` });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar saída", variant: "destructive" });
    }
  };

  // Find matching resident for photos
  const findResident = (name: string, plate: string | null) =>
    residents?.find(r =>
      r.name.toLowerCase() === name.toLowerCase() ||
      (plate && r.plate && r.plate.toLowerCase() === plate.toLowerCase())
    );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-primary text-sm font-bold flex items-center gap-1 hover:opacity-70">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-xl font-extrabold text-foreground flex-1 text-center pr-16 tracking-tight">NOVA SAÍDA</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, placa ou casa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-card border-border shadow-sm text-base font-semibold"
          />
        </div>

        {/* Active entries list */}
        {(active?.length ?? 0) > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-extrabold text-foreground mb-3 tracking-tight">
              ATIVOS AGORA ({filtered.length})
            </h2>
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : !filtered.length ? (
              <div className="apple-card p-6 text-center">
                <p className="text-sm font-semibold text-muted-foreground">Nenhuma entrada ativa encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((log) => {
                  const resident = findResident(log.driver_name, log.plate);
                  return (
                    <AlertDialog key={log.id}>
                      <AlertDialogTrigger asChild>
                        <button className="apple-card p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer">
                          {/* Photo */}
                          <div className="shrink-0">
                            {resident?.photo_url ? (
                              <img src={resident.photo_url} alt={log.driver_name} className="h-14 w-14 rounded-full object-cover border-2 border-primary/30 shadow" />
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                                <User className="h-7 w-7 text-primary" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Destination large */}
                            <p className="text-3xl font-black text-foreground leading-none">{log.destination}</p>
                            <p className="text-base font-bold text-foreground/80 mt-1 uppercase">{log.driver_name}</p>
                            {log.plate && (
                              <div className="mt-1.5">
                                <PlateBadge plate={log.plate} size="sm" />
                              </div>
                            )}
                            <p className="text-xs font-semibold text-muted-foreground mt-1">
                              Entrada: {formatTime(log.entry_time)}
                            </p>
                          </div>
                          <ChevronRight className="h-6 w-6 text-muted-foreground shrink-0" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-extrabold">Confirmar saída</AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            Registrar saída de <strong className="text-foreground">{log.driver_name}</strong>
                            {log.plate ? ` (${log.plate})` : ""}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleExit(log.id)}
                            className="bg-success hover:bg-success/90 font-extrabold text-base"
                          >
                            CONFIRMAR SAÍDA
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("moradores")}
            className={`flex-1 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all ${
              tab === "moradores"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            Moradores ({filteredResidents.length})
          </button>
          <button
            onClick={() => setTab("visitantes")}
            className={`flex-1 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all ${
              tab === "visitantes"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            Visitantes ({filteredVisitors.length})
          </button>
        </div>

        {/* MORADORES */}
        {tab === "moradores" && (
          <div className="space-y-3">
            {filteredResidents.length === 0 ? (
              <div className="apple-card p-6 text-center">
                <p className="text-muted-foreground font-semibold">Nenhum morador encontrado.</p>
              </div>
            ) : (
              filteredResidents.map((r) => (
                <AlertDialog key={r.id}>
                  <AlertDialogTrigger asChild>
                    <button className="apple-card p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer">
                      {r.unit && (
                        <div className="shrink-0 text-center min-w-[65px]">
                          <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">CASA</p>
                          <p className="text-4xl font-black text-foreground leading-none">{r.unit}</p>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-lg text-foreground uppercase truncate">{r.name}</p>
                        {r.plate && (
                          <div className="mt-1"><PlateBadge plate={r.plate} size="sm" /></div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {r.photo_url ? (
                          <img src={r.photo_url} alt={r.name} className="h-14 w-14 rounded-full object-cover border-2 border-accent/30 shadow" />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-accent/15 flex items-center justify-center">
                            <User className="h-7 w-7 text-accent" />
                          </div>
                        )}
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-extrabold">Registrar saída avulsa</AlertDialogTitle>
                      <AlertDialogDescription className="text-base">
                        Registrar saída de <strong className="text-foreground">{r.name}</strong>{r.plate ? ` (${r.plate})` : ""}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStandaloneExit(r)} className="bg-success hover:bg-success/90 font-extrabold text-base">
                        CONFIRMAR SAÍDA
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))
            )}
          </div>
        )}

        {/* VISITANTES */}
        {tab === "visitantes" && (
          <div className="space-y-3">
            {filteredVisitors.length === 0 ? (
              <div className="apple-card p-6 text-center">
                <p className="text-muted-foreground font-semibold">Nenhum visitante encontrado.</p>
              </div>
            ) : (
              filteredVisitors.map((r) => (
                <AlertDialog key={r.id}>
                  <AlertDialogTrigger asChild>
                    <button className="apple-card p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-lg text-foreground uppercase truncate">{r.name}</p>
                        {r.plate && (
                          <div className="mt-1"><PlateBadge plate={r.plate} size="sm" /></div>
                        )}
                        {r.unit && (
                          <p className="text-xs font-semibold text-muted-foreground mt-1">Casa {r.unit}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {r.photo_url ? (
                          <img src={r.photo_url} alt={r.name} className="h-14 w-14 rounded-full object-cover border-2 border-accent/30 shadow" />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-accent/15 flex items-center justify-center">
                            <User className="h-7 w-7 text-accent" />
                          </div>
                        )}
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-extrabold">Registrar saída avulsa</AlertDialogTitle>
                      <AlertDialogDescription className="text-base">
                        Registrar saída de <strong className="text-foreground">{r.name}</strong>{r.plate ? ` (${r.plate})` : ""}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStandaloneExit(r)} className="bg-success hover:bg-success/90 font-extrabold text-base">
                        CONFIRMAR SAÍDA
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NewExit;

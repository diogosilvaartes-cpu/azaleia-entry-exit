import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, ArrowLeft, Search, Check, Save } from "lucide-react";
import { useActiveEntries, useRegisterExit, useCreateStandaloneExit } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import AutocompleteInput from "@/components/AutocompleteInput";
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
  const { data: residents } = useResidents();
  const registerExit = useRegisterExit();
  const standaloneExit = useCreateStandaloneExit();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");

  // Standalone exit form
  const [form, setForm] = useState({
    driver_name: "",
    plate: "",
    car_model: "",
    car_color: "",
    destination: "",
    authorized_by: "",
    notes: "",
  });

  const residentNames = useMemo(
    () => (residents || []).map((r) => r.name),
    [residents]
  );

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const fillFromResident = (name: string) => {
    const resident = residents?.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    if (resident) {
      setForm((prev) => ({
        ...prev,
        driver_name: resident.name,
        plate: resident.plate || prev.plate,
        car_model: resident.car_model || prev.car_model,
        car_color: resident.car_color || prev.car_color,
        destination: resident.unit || prev.destination,
      }));
    }
  };

  const filtered = useMemo(() => {
    if (!active) return [];
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter(
      (log) =>
        log.driver_name.toLowerCase().includes(q) ||
        (log.plate && log.plate.toLowerCase().includes(q)) ||
        log.destination.toLowerCase().includes(q) ||
        log.authorized_by.toLowerCase().includes(q)
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

  const handleStandaloneExit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await standaloneExit.mutateAsync({
        driver_name: form.driver_name,
        plate: form.plate || undefined,
        car_model: form.car_model || undefined,
        car_color: form.car_color || undefined,
        destination: form.destination,
        authorized_by: form.authorized_by || undefined,
        notes: form.notes || undefined,
      });
      toast({ title: "Saída avulsa registrada com sucesso!" });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar saída", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Registrar Saída</h1>
        <p className="text-sm text-muted-foreground">
          Selecione uma entrada ativa ou registre uma saída avulsa
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="max-w-3xl">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Entradas Ativas</TabsTrigger>
          <TabsTrigger value="standalone">Saída Avulsa (sem entrada)</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Entradas Ativas</CardTitle>
              <div className="mt-2">
                <Label htmlFor="search" className="sr-only">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome, placa, destino..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : !filtered.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {search ? "Nenhuma entrada encontrada para esta busca." : "Nenhuma entrada ativa no momento."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filtered.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">{log.driver_name}</span>
                          {log.plate && (
                            <Badge className="bg-accent/15 text-accent border-accent/30 font-mono text-sm font-bold tracking-wider">
                              {log.plate}
                            </Badge>
                          )}
                          <Badge variant="secondary">{log.destination}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Entrada: {formatTime(log.entry_time)} · Liberado por: {log.authorized_by}
                          {(log as any).car_model && ` · ${(log as any).car_model}`}
                          {(log as any).car_color && ` ${(log as any).car_color}`}
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
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
        </TabsContent>

        <TabsContent value="standalone">
          <Card className="animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Saída Avulsa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Registre uma saída sem entrada prévia no sistema
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStandaloneExit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="exit_driver_name">Nome *</Label>
                    <AutocompleteInput
                      id="exit_driver_name"
                      placeholder="Nome completo"
                      value={form.driver_name}
                      onChange={(v) => {
                        update("driver_name", v);
                        fillFromResident(v);
                      }}
                      suggestions={residentNames}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exit_plate">Placa</Label>
                    <Input
                      id="exit_plate"
                      placeholder="ABC-1D23"
                      value={form.plate}
                      onChange={(e) => update("plate", e.target.value.toUpperCase())}
                      maxLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exit_car_model">Modelo</Label>
                    <Input
                      id="exit_car_model"
                      placeholder="Ex: Civic, Onix..."
                      value={form.car_model}
                      onChange={(e) => update("car_model", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exit_car_color">Cor</Label>
                    <Input
                      id="exit_car_color"
                      placeholder="Ex: Prata, Preto..."
                      value={form.car_color}
                      onChange={(e) => update("car_color", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exit_destination">Destino/Origem *</Label>
                    <Input
                      id="exit_destination"
                      placeholder="De onde está saindo"
                      value={form.destination}
                      onChange={(e) => update("destination", e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="exit_authorized_by">Liberado por</Label>
                    <Input
                      id="exit_authorized_by"
                      placeholder="Nome de quem autorizou"
                      value={form.authorized_by}
                      onChange={(e) => update("authorized_by", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exit_notes">Observações</Label>
                  <Textarea
                    id="exit_notes"
                    placeholder="Observações opcionais..."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={standaloneExit.isPending} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
                    <Save className="h-4 w-4" />
                    {standaloneExit.isPending ? "Salvando..." : "Registrar Saída Avulsa"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default NewExit;

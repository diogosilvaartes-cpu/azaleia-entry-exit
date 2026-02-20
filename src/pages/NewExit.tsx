import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, ArrowLeft, Search, Check } from "lucide-react";
import { useActiveEntries, useRegisterExit } from "@/hooks/useAccessLogs";
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

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Registrar Saída</h1>
        <p className="text-sm text-muted-foreground">
          Selecione a entrada ativa para registrar a saída
        </p>
      </div>

      <Card className="max-w-3xl animate-fade-in">
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
    </AppLayout>
  );
};

export default NewExit;

import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Printer, Search } from "lucide-react";
import { useHistoryLogs } from "@/hooks/useAccessLogs";
import type { AccessLog } from "@/lib/types";

const fmt = (iso: string | null, type: "date" | "time") => {
  if (!iso) return "–";
  const d = new Date(iso);
  return type === "date"
    ? d.toLocaleDateString("pt-BR")
    : d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const exportCSV = (data: AccessLog[]) => {
  const header =
    "Data,Entrada,Placa,Motorista,Identidade,Destino,Liberado Por,Saída,Status\n";
  const rows = data
    .map(
      (l) =>
        `${fmt(l.entry_time, "date")},${fmt(l.entry_time, "time")},${l.plate || ""},${l.driver_name},${l.identity_number || ""},${l.destination},${l.authorized_by || ""},${l.exit_time ? fmt(l.exit_time, "time") : ""},${l.exit_time ? "Finalizado" : "Ativo"}`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_azaleia_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const HistoryPage = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useHistoryLogs({});

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (l) =>
        l.driver_name.toLowerCase().includes(q) ||
        (l.plate && l.plate.toLowerCase().includes(q)) ||
        l.destination.toLowerCase().includes(q) ||
        (l.authorized_by && l.authorized_by.toLowerCase().includes(q)) ||
        (l.identity_number && l.identity_number.toLowerCase().includes(q)) ||
        (l.car_model && l.car_model.toLowerCase().includes(q))
    );
  }, [data, search]);

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => filtered.length && exportCSV(filtered)}
            disabled={!filtered.length}
          >
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Single search */}
      <div className="mb-6 no-print">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, placa, destino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h2 className="text-lg font-bold">Residencial Azaleia – Relatório de Acesso</h2>
        <p className="text-sm">Gerado em: {new Date().toLocaleString("pt-BR")}</p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : isError ? (
            <p className="p-8 text-center text-sm text-destructive">
              Erro ao carregar dados.
            </p>
          ) : !filtered.length ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead className="hidden md:table-cell">Liberado por</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{fmt(log.entry_time, "date")}</TableCell>
                      <TableCell className="text-xs">{fmt(log.entry_time, "time")}</TableCell>
                      <TableCell>
                        {log.plate ? (
                          <Badge className="bg-primary text-primary-foreground font-mono text-sm font-bold tracking-wider">
                            {log.plate}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{log.driver_name}</TableCell>
                      <TableCell className="text-xs">{log.destination}</TableCell>
                      <TableCell className="hidden text-xs md:table-cell">
                        {log.authorized_by || "–"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.exit_time ? fmt(log.exit_time, "time") : "–"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.exit_time ? "secondary" : "default"}
                          className={
                            log.exit_time
                              ? ""
                              : "bg-warning text-warning-foreground"
                          }
                        >
                          {log.exit_time ? "Finalizado" : "Ativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default HistoryPage;

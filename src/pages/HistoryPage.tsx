import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Printer, Filter, Search } from "lucide-react";
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
        `${fmt(l.entry_time, "date")},${fmt(l.entry_time, "time")},${l.plate || ""},${l.driver_name},${l.identity_number || ""},${l.destination},${l.authorized_by},${l.exit_time ? fmt(l.exit_time, "time") : ""},${l.exit_time ? "Finalizado" : "Ativo"}`
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [plate, setPlate] = useState("");
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<"active" | "finished" | "">("");

  const { data, isLoading, isError } = useHistoryLogs({
    dateFrom,
    dateTo,
    plate,
    name,
    destination,
    status,
  });

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => data && exportCSV(data)}
            disabled={!data?.length}
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

      {/* Filters */}
      <Card className="mb-6 no-print">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1">
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Placa</Label>
              <Input
                placeholder="Buscar placa"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input
                placeholder="Buscar nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Destino</Label>
              <Input
                placeholder="Buscar destino"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
          ) : !data?.length ? (
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
                    <TableHead className="hidden lg:table-cell">Identidade</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead className="hidden md:table-cell">Liberado por</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{fmt(log.entry_time, "date")}</TableCell>
                      <TableCell className="text-xs">{fmt(log.entry_time, "time")}</TableCell>
                      <TableCell className="font-mono text-xs">{log.plate || "–"}</TableCell>
                      <TableCell className="font-medium text-sm">{log.driver_name}</TableCell>
                      <TableCell className="hidden text-xs lg:table-cell">
                        {log.identity_number || "–"}
                      </TableCell>
                      <TableCell className="text-xs">{log.destination}</TableCell>
                      <TableCell className="hidden text-xs md:table-cell">
                        {log.authorized_by}
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

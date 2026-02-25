import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Printer, Search } from "lucide-react";
import { useHistoryLogs } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import PlateBadge from "@/components/PlateBadge";
import AccessLogSheet from "@/components/AccessLogSheet";
import DoormanTag from "@/components/DoormanTag";
import type { AccessLog } from "@/lib/types";

const fmt = (iso: string | null, type: "date" | "time") => {
  if (!iso) return "–";
  const d = new Date(iso);
  return type === "date"
    ? d.toLocaleDateString("pt-BR")
    : d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const exportCSV = (data: AccessLog[]) => {
  const header = "Data,Entrada,Placa,Motorista,Destino,Liberado Por,Saída,Status\n";
  const rows = data
    .map((l) =>
      `${fmt(l.entry_time, "date")},${fmt(l.entry_time, "time")},${l.plate || ""},${l.driver_name},${l.destination},${l.authorized_by || ""},${l.exit_time ? fmt(l.exit_time, "time") : ""},${l.exit_time ? "Finalizado" : "Ativo"}`
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
  const { data: residents } = useResidents();
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (l) =>
        l.driver_name.toLowerCase().includes(q) ||
        (l.plate && l.plate.toLowerCase().includes(q)) ||
        l.destination.toLowerCase().includes(q) ||
        (l.authorized_by && l.authorized_by.toLowerCase().includes(q))
    );
  }, [data, search]);

  const findResident = (name: string, plate: string | null) =>
    residents?.find(r =>
      r.name.toLowerCase() === name.toLowerCase() ||
      (plate && r.plate && r.plate.toLowerCase() === plate.toLowerCase())
    );

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Histórico</h1>
        <div className="flex gap-2 no-print">
          <Button variant="ghost" size="sm" onClick={() => filtered.length && exportCSV(filtered)} disabled={!filtered.length} className="text-muted-foreground">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-muted-foreground">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 no-print">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, placa, destino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 rounded-2xl bg-card border-border shadow-sm text-base font-semibold"
        />
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h2 className="text-lg font-bold">Residencial Azaleia – Relatório de Acesso</h2>
        <p className="text-sm">Gerado em: {new Date().toLocaleString("pt-BR")}</p>
      </div>

      {/* Table header */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="hidden sm:grid grid-cols-[80px_60px_100px_1fr_80px_100px_60px_auto] gap-2 px-4 py-2 text-xs font-extrabold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
          <span>Data</span>
          <span>Hora</span>
          <span>Placa</span>
          <span>Nome</span>
          <span>Destino</span>
          <span>Liberado</span>
          <span>Saída</span>
          <span>Status</span>
        </div>
      )}

      {/* Rows */}
      {isLoading ? (
        <p className="text-center text-sm font-semibold text-muted-foreground py-8">Carregando...</p>
      ) : isError ? (
        <p className="text-center text-sm font-bold text-destructive py-8">Erro ao carregar dados.</p>
      ) : !filtered.length ? (
        <div className="apple-card p-12 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-muted-foreground">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((log) => (
            <button
              key={log.id}
              onClick={() => { setSelectedLog(log); setSheetOpen(true); }}
              className="w-full text-left rounded-xl bg-card border border-border px-4 py-3 flex flex-col sm:grid sm:grid-cols-[80px_60px_100px_1fr_80px_100px_60px_auto] sm:items-center gap-1 sm:gap-2 transition-all hover:bg-accent/50 active:scale-[0.995] cursor-pointer"
            >
              {/* Data */}
              <span className="text-xs font-bold text-muted-foreground">
                {fmt(log.entry_time, "date")}
              </span>
              {/* Hora */}
              <span className="text-sm font-extrabold text-foreground">
                {fmt(log.entry_time, "time")}
              </span>
              {/* Placa */}
              <span>
                {log.plate ? <PlateBadge plate={log.plate} size="sm" /> : <span className="text-xs text-muted-foreground">–</span>}
              </span>
              {/* Nome */}
              <span className="text-sm font-bold text-foreground truncate uppercase">{log.driver_name}</span>
              {/* Destino */}
              <span className="text-lg font-black text-foreground">{log.destination}</span>
              {/* Liberado por */}
              <span className="text-xs font-semibold text-muted-foreground truncate">{log.authorized_by || "–"}</span>
              {/* Saída */}
              <span className="text-sm font-bold text-foreground">
                {log.exit_time ? fmt(log.exit_time, "time") : "–"}
              </span>
              {/* Status + Doorman */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  log.exit_time
                    ? "bg-muted text-muted-foreground"
                    : "bg-warning/20 text-warning"
                }`}>
                  {log.exit_time ? "OK" : "ATIVO"}
                </span>
                <DoormanTag userId={log.created_by} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <AccessLogSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        residentPhoto={selectedLog ? findResident(selectedLog.driver_name, selectedLog.plate)?.photo_url : null}
        carPhoto={selectedLog ? findResident(selectedLog.driver_name, selectedLog.plate)?.car_photo_url : null}
      />
    </AppLayout>
  );
};

export default HistoryPage;

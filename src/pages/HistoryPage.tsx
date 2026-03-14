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

const fmtGroupDate = (iso: string) => {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${weekday}, ${day} ${month}`;
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

  const grouped = useMemo(() => {
    const map = new Map<string, AccessLog[]>();
    for (const log of filtered) {
      const dateKey = new Date(log.entry_time).toDateString();
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(log);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const findResident = (name: string, plate: string | null) =>
    residents?.find(r =>
      r.name.toLowerCase() === name.toLowerCase() ||
      (plate && r.plate && r.plate.toLowerCase() === plate.toLowerCase())
    );

  return (
    <AppLayout pageId="history">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Histórico</h1>
        <div className="flex gap-1.5 no-print">
          <Button variant="ghost" size="sm" onClick={() => filtered.length && exportCSV(filtered)} disabled={!filtered.length} className="text-muted-foreground rounded-xl h-9 w-9 p-0">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-muted-foreground rounded-xl h-9 w-9 p-0">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 no-print">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, placa, destino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-2xl bg-card border-border/60 text-base font-medium"
          style={{ boxShadow: '0 1px 3px 0 hsl(var(--foreground) / 0.04)' }}
        />
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h2 className="text-lg font-bold">Residencial Azaleia – Relatório de Acesso</h2>
        <p className="text-sm">Gerado em: {new Date().toLocaleString("pt-BR")}</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-center text-sm font-medium text-muted-foreground py-8">Carregando...</p>
      ) : isError ? (
        <p className="text-center text-sm font-semibold text-destructive py-8">Erro ao carregar dados.</p>
      ) : !filtered.length ? (
        <div className="apple-card p-12 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, logs]) => (
            <div key={dateKey}>
              <div className="sticky top-14 z-10 glass py-2 mb-1 -mx-4 px-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {fmtGroupDate(logs[0].entry_time)}
                </span>
              </div>

              {/* Desktop table */}
              <table className="hidden md:table w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="text-left px-3 py-1.5 w-[56px]">Hora</th>
                    <th className="text-left px-3 py-1.5 w-[120px]">Placa</th>
                    <th className="text-left px-3 py-1.5">Nome</th>
                    <th className="text-left px-3 py-1.5 w-[70px]">Destino</th>
                    <th className="text-left px-3 py-1.5 w-[100px]">Liberado</th>
                    <th className="text-left px-3 py-1.5 w-[56px]">Saída</th>
                    <th className="text-left px-3 py-1.5 w-[100px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => { setSelectedLog(log); setSheetOpen(true); }}
                      className="bg-card border border-border/60 rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.998]"
                    >
                      <td className="px-3 py-3 text-sm font-bold text-foreground rounded-l-xl">
                        {fmt(log.entry_time, "time")}
                      </td>
                      <td className="px-3 py-3">
                        {log.plate ? <PlateBadge plate={log.plate} size="sm" /> : <span className="text-xs text-muted-foreground">–</span>}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-foreground truncate uppercase max-w-0">{log.driver_name}</td>
                      <td className="px-3 py-3 text-sm font-extrabold text-foreground">{log.destination}</td>
                      <td className="px-3 py-3 text-xs font-medium text-muted-foreground truncate max-w-0">{log.authorized_by || "–"}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-foreground">
                        {log.exit_time ? fmt(log.exit_time, "time") : "–"}
                      </td>
                      <td className="px-3 py-3 rounded-r-xl">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            log.exit_time
                              ? "bg-muted text-muted-foreground"
                              : "bg-warning/15 text-warning"
                          }`}>
                            {log.exit_time ? "OK" : "ATIVO"}
                          </span>
                          <DoormanTag userId={log.created_by} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile rows */}
              <div className="md:hidden space-y-1.5">
                {logs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => { setSelectedLog(log); setSheetOpen(true); }}
                    className="w-full text-left rounded-xl bg-card border border-border/60 px-4 py-3 transition-all hover:shadow-md active:scale-[0.998] cursor-pointer"
                    style={{ boxShadow: '0 1px 3px 0 hsl(var(--foreground) / 0.03)' }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{fmt(log.entry_time, "time")}</span>
                          <span className="text-lg font-extrabold text-foreground">{log.destination}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          log.exit_time
                            ? "bg-muted text-muted-foreground"
                            : "bg-warning/15 text-warning"
                        }`}>
                          {log.exit_time ? `↑${fmt(log.exit_time, "time")}` : "ATIVO"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground/70 uppercase truncate">{log.driver_name}</span>
                        {log.plate && <PlateBadge plate={log.plate} size="sm" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {log.authorized_by && (
                          <span className="text-xs text-muted-foreground font-medium">lib: {log.authorized_by}</span>
                        )}
                        <DoormanTag userId={log.created_by} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

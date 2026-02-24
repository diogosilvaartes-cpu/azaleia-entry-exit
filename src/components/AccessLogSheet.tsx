import { User, Car, Clock, MapPin, Shield, FileText } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import PlateBadge from "@/components/PlateBadge";
import type { AccessLog } from "@/lib/types";

const fmt = (iso: string | null, type: "date" | "time") => {
  if (!iso) return "–";
  const d = new Date(iso);
  return type === "date"
    ? d.toLocaleDateString("pt-BR")
    : d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

interface Props {
  log: AccessLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentPhoto?: string | null;
  carPhoto?: string | null;
}

const AccessLogSheet = ({ log, open, onOpenChange, residentPhoto, carPhoto }: Props) => {
  if (!log) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-card border-t-0">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-2xl font-extrabold tracking-tight text-center">
            FICHA DE REGISTRO
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-6">
          {/* Photos */}
          <div className="flex justify-center gap-4">
            <div className="text-center">
              {residentPhoto ? (
                <img src={residentPhoto} alt="Morador" className="h-24 w-24 rounded-2xl object-cover border-2 border-primary/30 shadow-md" />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <User className="h-10 w-10 text-primary/50" />
                </div>
              )}
              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Pessoa</p>
            </div>
            {(carPhoto || log.plate) && (
              <div className="text-center">
                {carPhoto ? (
                  <img src={carPhoto} alt="Veículo" className="h-24 w-24 rounded-2xl object-cover border-2 border-accent/30 shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center border-2 border-accent/20">
                    <Car className="h-10 w-10 text-accent/50" />
                  </div>
                )}
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Veículo</p>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="text-center">
            <p className="text-2xl font-extrabold text-foreground uppercase">{log.driver_name}</p>
            <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
              log.exit_time
                ? "bg-muted text-muted-foreground"
                : "bg-warning/20 text-warning font-extrabold"
            }`}>
              {log.exit_time ? "FINALIZADO" : "ATIVO"}
            </span>
          </div>

          {/* Plate */}
          {log.plate && (
            <div className="flex justify-center">
              <PlateBadge plate={log.plate} size="lg" />
            </div>
          )}

          {/* Destination large */}
          <div className="bg-secondary/80 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Destino</p>
            <p className="text-4xl font-black text-foreground leading-tight">{log.destination}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Entrada</p>
              </div>
              <p className="text-lg font-bold text-foreground">{fmt(log.entry_time, "time")}</p>
              <p className="text-xs text-muted-foreground">{fmt(log.entry_time, "date")}</p>
            </div>
            <div className="bg-secondary/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Saída</p>
              </div>
              <p className="text-lg font-bold text-foreground">{log.exit_time ? fmt(log.exit_time, "time") : "—"}</p>
              <p className="text-xs text-muted-foreground">{log.exit_time ? fmt(log.exit_time, "date") : ""}</p>
            </div>
          </div>

          {/* Extra info */}
          {(log.car_model || log.car_color) && (
            <div className="bg-secondary/60 rounded-xl p-3 flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-semibold text-foreground">
                {[log.car_model, log.car_color].filter(Boolean).join(" • ")}
              </p>
            </div>
          )}

          {log.authorized_by && (
            <div className="bg-secondary/60 rounded-xl p-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-semibold text-foreground">Liberado por: {log.authorized_by}</p>
            </div>
          )}

          {log.notes && (
            <div className="bg-secondary/60 rounded-xl p-3 flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{log.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccessLogSheet;

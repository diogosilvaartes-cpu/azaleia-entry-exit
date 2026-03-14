import { User, Car, Phone, MapPin, FileText, Home } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import PlateBadge from "@/components/PlateBadge";
import type { Resident } from "@/lib/types";

interface Props {
  resident: Resident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResidentSheet = ({ resident, open, onOpenChange }: Props) => {
  if (!resident) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-card border-t-0 shadow-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg font-bold tracking-tight text-center uppercase text-muted-foreground">
            Ficha do Cadastro
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-6">
          {/* Photos */}
          <div className="flex justify-center gap-4">
            <div className="text-center">
              {resident.photo_url ? (
                <img src={resident.photo_url} alt={resident.name} className="h-24 w-24 rounded-2xl object-cover border-2 border-primary/20 shadow-md" />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-primary/8 flex items-center justify-center border border-primary/15">
                  <User className="h-10 w-10 text-primary/40" />
                </div>
              )}
              <p className="text-[10px] font-semibold text-muted-foreground mt-1.5 uppercase tracking-wider">Pessoa</p>
            </div>
            {(resident.car_photo_url || resident.plate) && (
              <div className="text-center">
                {resident.car_photo_url ? (
                  <img src={resident.car_photo_url} alt="Veículo" className="h-24 w-24 rounded-2xl object-cover border-2 border-accent/20 shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-accent/8 flex items-center justify-center border border-accent/15">
                    <Car className="h-10 w-10 text-accent/40" />
                  </div>
                )}
                <p className="text-[10px] font-semibold text-muted-foreground mt-1.5 uppercase tracking-wider">Veículo</p>
              </div>
            )}
          </div>

          {/* Name + type */}
          <div className="text-center">
            <p className="text-2xl font-extrabold text-foreground uppercase tracking-tight">{resident.name}</p>
            <span className={`inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              resident.type === "morador"
                ? "bg-primary/10 text-primary"
                : "bg-accent/10 text-accent"
            }`}>
              {resident.type === "morador" ? "MORADOR" : "VISITANTE"}
            </span>
          </div>

          {/* Plate */}
          {resident.plate && (
            <div className="flex justify-center">
              <PlateBadge plate={resident.plate} size="lg" />
            </div>
          )}

          {/* Unit large */}
          {resident.unit && (
            <div className="bg-secondary/60 rounded-2xl p-4 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Casa / Unidade</p>
              <p className="text-4xl font-extrabold text-foreground leading-tight tracking-tight">{resident.unit}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {resident.phone && (
              <div className="bg-secondary/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Telefone</p>
                </div>
                <p className="text-base font-semibold text-foreground">{resident.phone}</p>
              </div>
            )}
            {(resident.car_model || resident.car_color) && (
              <div className="bg-secondary/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Car className="h-3.5 w-3.5 text-accent" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Veículo</p>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {[resident.car_model, resident.car_color].filter(Boolean).join(" • ")}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {resident.notes && (
            <div className="bg-secondary/40 rounded-xl p-3 flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-foreground font-medium">{resident.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResidentSheet;

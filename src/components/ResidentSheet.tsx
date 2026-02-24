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
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-card border-t-0">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-2xl font-extrabold tracking-tight text-center">
            FICHA DO CADASTRO
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-6">
          {/* Photos */}
          <div className="flex justify-center gap-4">
            <div className="text-center">
              {resident.photo_url ? (
                <img src={resident.photo_url} alt={resident.name} className="h-24 w-24 rounded-2xl object-cover border-2 border-primary/30 shadow-md" />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <User className="h-10 w-10 text-primary/50" />
                </div>
              )}
              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Pessoa</p>
            </div>
            {(resident.car_photo_url || resident.plate) && (
              <div className="text-center">
                {resident.car_photo_url ? (
                  <img src={resident.car_photo_url} alt="Veículo" className="h-24 w-24 rounded-2xl object-cover border-2 border-accent/30 shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center border-2 border-accent/20">
                    <Car className="h-10 w-10 text-accent/50" />
                  </div>
                )}
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Veículo</p>
              </div>
            )}
          </div>

          {/* Name + type */}
          <div className="text-center">
            <p className="text-2xl font-extrabold text-foreground uppercase">{resident.name}</p>
            <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
              resident.type === "morador"
                ? "bg-primary/15 text-primary"
                : "bg-accent/15 text-accent"
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
            <div className="bg-secondary/80 rounded-2xl p-4 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Casa / Unidade</p>
              <p className="text-4xl font-black text-foreground leading-tight">{resident.unit}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {resident.phone && (
              <div className="bg-secondary/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Telefone</p>
                </div>
                <p className="text-base font-bold text-foreground">{resident.phone}</p>
              </div>
            )}
            {(resident.car_model || resident.car_color) && (
              <div className="bg-secondary/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Car className="h-3.5 w-3.5 text-accent" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Veículo</p>
                </div>
                <p className="text-base font-bold text-foreground">
                  {[resident.car_model, resident.car_color].filter(Boolean).join(" • ")}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {resident.notes && (
            <div className="bg-secondary/60 rounded-xl p-3 flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{resident.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResidentSheet;

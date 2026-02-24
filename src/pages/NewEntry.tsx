import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useCreateEntry } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import AutocompleteInput from "@/components/AutocompleteInput";
import PlateBadge from "@/components/PlateBadge";

const STORAGE_KEY_DEST = "azaleia_destinations";
const STORAGE_KEY_AUTH = "azaleia_authorized";

const getStored = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const addStored = (key: string, value: string) => {
  const arr = getStored(key).filter((v) => v.toLowerCase() !== value.toLowerCase());
  arr.unshift(value);
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 30)));
};

const NewEntry = () => {
  const navigate = useNavigate();
  const createEntry = useCreateEntry();
  const { data: residents } = useResidents();
  const { toast } = useToast();

  const [form, setForm] = useState({
    plate: "", driver_name: "", identity_number: "",
    destination: "", authorized_by: "", notes: "",
    car_model: "", car_color: "",
  });
  const [destinations, setDestinations] = useState<string[]>([]);
  const [authorizers, setAuthorizers] = useState<string[]>([]);

  useEffect(() => {
    setDestinations(getStored(STORAGE_KEY_DEST));
    setAuthorizers(getStored(STORAGE_KEY_AUTH));
  }, []);

  const residentNames = useMemo(() => (residents || []).map((r) => r.name), [residents]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const fillFromResident = (name: string) => {
    const resident = residents?.find((r) => r.name.toLowerCase() === name.toLowerCase());
    if (resident) {
      setForm((prev) => ({
        ...prev, driver_name: resident.name,
        plate: resident.plate || prev.plate,
        car_model: resident.car_model || prev.car_model,
        car_color: resident.car_color || prev.car_color,
        destination: resident.unit || prev.destination,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEntry.mutateAsync({
        plate: form.plate || undefined, driver_name: form.driver_name,
        identity_number: form.identity_number || undefined,
        destination: form.destination, authorized_by: form.authorized_by || undefined,
        notes: form.notes || undefined, car_model: form.car_model || undefined,
        car_color: form.car_color || undefined,
      });
      if (form.destination) addStored(STORAGE_KEY_DEST, form.destination);
      if (form.authorized_by) addStored(STORAGE_KEY_AUTH, form.authorized_by);
      toast({ title: "Entrada registrada com sucesso!" });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar entrada", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium flex items-center gap-1 hover:opacity-70">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1 text-center pr-16">NOVA ENTRADA</h1>
        </div>

        <div className="apple-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nome</Label>
              <AutocompleteInput
                id="driver_name"
                placeholder="Sugestão da lista de moradores..."
                value={form.driver_name}
                onChange={(v) => { update("driver_name", v); fillFromResident(v); }}
                suggestions={residentNames}
                required
              />
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Destino (Casa)</Label>
              <AutocompleteInput
                id="destination"
                placeholder="Bloco, apto, área comum..."
                value={form.destination}
                onChange={(v) => update("destination", v)}
                suggestions={destinations}
                required
              />
            </div>

            {/* PLATE - highlighted */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wide">Placa do Veículo</Label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {form.plate ? (
                    <PlateBadge plate={form.plate} size="lg" />
                  ) : (
                    <div className="plate-badge-lg text-muted-foreground/30">
                      <span className="text-[0.5em] leading-none">🇧🇷</span>
                      ABC 1D23
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Placa"
                    value={form.plate}
                    onChange={(e) => update("plate", e.target.value.toUpperCase())}
                    maxLength={8}
                    className="font-mono text-lg"
                  />
                  <Input
                    placeholder="Modelo (opcional)"
                    value={form.car_model}
                    onChange={(e) => update("car_model", e.target.value)}
                  />
                  <Input
                    placeholder="Cor (opcional)"
                    value={form.car_color}
                    onChange={(e) => update("car_color", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Authorized by */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Liberado por</Label>
              <AutocompleteInput
                id="authorized_by"
                placeholder="Nome de quem autorizou"
                value={form.authorized_by}
                onChange={(v) => update("authorized_by", v)}
                suggestions={authorizers}
              />
            </div>

            {/* Notes - collapsible feel */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Observações</Label>
              <Textarea
                placeholder="Observações opcionais..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createEntry.isPending}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold transition-transform active:scale-[0.98] hover:brightness-110 disabled:opacity-50"
            >
              {createEntry.isPending ? "SALVANDO..." : "REGISTRAR ENTRADA"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewEntry;

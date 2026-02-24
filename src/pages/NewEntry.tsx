import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UserPlus, Search, User } from "lucide-react";
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

  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [residentSearch, setResidentSearch] = useState("");

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

  // Filter residents for the list
  const filteredResidents = useMemo(() => {
    const list = (residents || []).filter(r => r.type === "morador");
    if (!residentSearch) return list;
    const q = residentSearch.toLowerCase();
    return list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.plate && r.plate.toLowerCase().includes(q)) ||
      (r.unit && r.unit.toLowerCase().includes(q))
    );
  }, [residents, residentSearch]);

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

  // Quick entry for a resident (1-click)
  const quickResidentEntry = async (resident: typeof filteredResidents[0]) => {
    try {
      await createEntry.mutateAsync({
        driver_name: resident.name,
        plate: resident.plate || undefined,
        destination: resident.unit || "Residência",
        car_model: resident.car_model || undefined,
        car_color: resident.car_color || undefined,
      });
      toast({ title: `Entrada registrada: ${resident.name}` });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar entrada", variant: "destructive" });
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
          <h1 className="text-xl font-extrabold text-foreground flex-1 text-center pr-16 tracking-tight">NOVA ENTRADA</h1>
        </div>

        {/* VISITANTE button */}
        <button
          onClick={() => setShowVisitorForm(!showVisitorForm)}
          className={`w-full h-20 rounded-2xl flex items-center justify-center gap-3 text-2xl font-bold tracking-wide transition-all active:scale-[0.98] mb-6 ${
            showVisitorForm
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-muted text-foreground border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
          }`}
        >
          <UserPlus className="h-7 w-7" />
          VISITANTE
        </button>

        {/* Visitor form - collapsible */}
        {showVisitorForm && (
          <div className="apple-card p-6 mb-6 animate-fade-in border-l-4 border-l-primary">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground">Nome *</Label>
                <AutocompleteInput
                  id="driver_name"
                  placeholder="Nome do visitante..."
                  value={form.driver_name}
                  onChange={(v) => { update("driver_name", v); fillFromResident(v); }}
                  suggestions={residentNames}
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground">Destino (Casa) *</Label>
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
                <Label className="text-sm font-extrabold uppercase tracking-wide text-foreground">Placa do Veículo</Label>
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
                      className="font-mono text-lg font-bold"
                    />
                    <Input placeholder="Modelo (opcional)" value={form.car_model} onChange={(e) => update("car_model", e.target.value)} />
                    <Input placeholder="Cor (opcional)" value={form.car_color} onChange={(e) => update("car_color", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Authorized by */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground">Liberado por</Label>
                <AutocompleteInput
                  id="authorized_by"
                  placeholder="Nome de quem autorizou"
                  value={form.authorized_by}
                  onChange={(v) => update("authorized_by", v)}
                  suggestions={authorizers}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Observações</Label>
                <Textarea placeholder="Observações opcionais..." value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createEntry.isPending}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold transition-transform active:scale-[0.98] hover:brightness-110 disabled:opacity-50 shadow-lg"
              >
                {createEntry.isPending ? "SALVANDO..." : "REGISTRAR ENTRADA"}
              </button>
            </form>
          </div>
        )}

        {/* MORADORES section */}
        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">MORADORES</h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar morador, placa ou casa..."
              value={residentSearch}
              onChange={(e) => setResidentSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-card border-0 shadow-sm text-base font-medium"
            />
          </div>

          {/* Residents list */}
          <div className="space-y-3">
            {filteredResidents.length === 0 ? (
              <div className="apple-card p-8 text-center">
                <p className="text-muted-foreground">Nenhum morador encontrado.</p>
              </div>
            ) : (
              filteredResidents.map((r) => (
                <button
                  key={r.id}
                  onClick={() => quickResidentEntry(r)}
                  disabled={createEntry.isPending}
                  className="apple-card p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {/* Unit */}
                  {r.unit && (
                    <div className="shrink-0 text-center min-w-[60px]">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CASA</p>
                      <p className="text-3xl font-extrabold text-foreground leading-none">{r.unit}</p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-foreground uppercase truncate">{r.name}</p>
                    {r.plate && (
                      <div className="mt-1">
                        <PlateBadge plate={r.plate} size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="shrink-0">
                    {r.photo_url ? (
                      <img src={r.photo_url} alt={r.name} className="h-14 w-14 rounded-full object-cover border-2 border-primary/20" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewEntry;

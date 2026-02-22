import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft, UserPlus } from "lucide-react";
import { useCreateEntry } from "@/hooks/useAccessLogs";
import { useResidents } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import AutocompleteInput from "@/components/AutocompleteInput";
import type { Resident } from "@/lib/types";

const STORAGE_KEY_DEST = "azaleia_destinations";
const STORAGE_KEY_AUTH = "azaleia_authorized";

const getStored = (key: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const addStored = (key: string, value: string) => {
  const arr = getStored(key);
  const filtered = arr.filter((v) => v.toLowerCase() !== value.toLowerCase());
  filtered.unshift(value);
  localStorage.setItem(key, JSON.stringify(filtered.slice(0, 30)));
};

const NewEntry = () => {
  const navigate = useNavigate();
  const createEntry = useCreateEntry();
  const { data: residents } = useResidents();
  const { toast } = useToast();

  const [form, setForm] = useState({
    plate: "",
    driver_name: "",
    identity_number: "",
    destination: "",
    authorized_by: "",
    notes: "",
    car_model: "",
    car_color: "",
  });
  const [destinations, setDestinations] = useState<string[]>([]);
  const [authorizers, setAuthorizers] = useState<string[]>([]);

  useEffect(() => {
    setDestinations(getStored(STORAGE_KEY_DEST));
    setAuthorizers(getStored(STORAGE_KEY_AUTH));
  }, []);

  const residentNames = useMemo(
    () => (residents || []).map((r) => r.name),
    [residents]
  );

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const fillFromResident = (name: string) => {
    const resident = residents?.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    if (resident) {
      setForm((prev) => ({
        ...prev,
        driver_name: resident.name,
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
        plate: form.plate || undefined,
        driver_name: form.driver_name,
        identity_number: form.identity_number || undefined,
        destination: form.destination,
        authorized_by: form.authorized_by,
        notes: form.notes || undefined,
        car_model: form.car_model || undefined,
        car_color: form.car_color || undefined,
      });
      addStored(STORAGE_KEY_DEST, form.destination);
      addStored(STORAGE_KEY_AUTH, form.authorized_by);
      toast({ title: "Entrada registrada com sucesso!" });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro ao registrar entrada", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nova Entrada</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleString("pt-BR")}
        </p>
      </div>

      <Card className="max-w-2xl animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Dados do Visitante / Morador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="driver_name">Nome *</Label>
                <AutocompleteInput
                  id="driver_name"
                  placeholder="Nome completo"
                  value={form.driver_name}
                  onChange={(v) => {
                    update("driver_name", v);
                    fillFromResident(v);
                  }}
                  suggestions={residentNames}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Selecione da lista de moradores para preencher automaticamente
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate">Placa do Veículo</Label>
                <Input
                  id="plate"
                  placeholder="ABC-1D23"
                  value={form.plate}
                  onChange={(e) => update("plate", e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="car_model">Modelo do Veículo</Label>
                <Input
                  id="car_model"
                  placeholder="Ex: Civic, Onix, HB20..."
                  value={form.car_model}
                  onChange={(e) => update("car_model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="car_color">Cor do Veículo</Label>
                <Input
                  id="car_color"
                  placeholder="Ex: Prata, Preto, Branco..."
                  value={form.car_color}
                  onChange={(e) => update("car_color", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identity_number">Nº Identidade</Label>
                <Input
                  id="identity_number"
                  placeholder="RG ou CPF"
                  value={form.identity_number}
                  onChange={(e) => update("identity_number", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destino *</Label>
                <AutocompleteInput
                  id="destination"
                  placeholder="Bloco, apto, área comum..."
                  value={form.destination}
                  onChange={(v) => update("destination", v)}
                  suggestions={destinations}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorized_by">Liberado por *</Label>
                <AutocompleteInput
                  id="authorized_by"
                  placeholder="Nome de quem autorizou"
                  value={form.authorized_by}
                  onChange={(v) => update("authorized_by", v)}
                  suggestions={authorizers}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações opcionais..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={createEntry.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {createEntry.isPending ? "Salvando..." : "Registrar Entrada"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default NewEntry;

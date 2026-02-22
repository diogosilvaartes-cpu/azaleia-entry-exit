import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, Save, X, Search, Users, UserCheck } from "lucide-react";
import { useResidents, useCreateResident, useUpdateResident, useDeleteResident } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Resident, ResidentInsert } from "@/lib/types";

const emptyForm: ResidentInsert = {
  name: "",
  unit: "",
  phone: "",
  type: "morador",
  car_model: "",
  car_color: "",
  plate: "",
  notes: "",
};

const ResidentsPage = () => {
  const { data: residents, isLoading } = useResidents();
  const createResident = useCreateResident();
  const updateResident = useUpdateResident();
  const deleteResident = useDeleteResident();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResidentInsert>(emptyForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"" | "morador" | "visitante">("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const filtered = (residents || []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.plate && r.plate.toLowerCase().includes(q)) ||
      (r.unit && r.unit.toLowerCase().includes(q));
    const matchType = !filterType || r.type === filterType;
    return matchSearch && matchType;
  });

  const startEdit = (r: Resident) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      unit: r.unit || "",
      phone: r.phone || "",
      type: r.type,
      car_model: r.car_model || "",
      car_color: r.car_color || "",
      plate: r.plate || "",
      notes: r.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateResident.mutateAsync({ id: editingId, ...form } as any);
        toast({ title: "Cadastro atualizado!" });
      } else {
        await createResident.mutateAsync(form);
        toast({ title: "Cadastro criado!" });
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResident.mutateAsync(id);
      toast({ title: "Cadastro removido!" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moradores e Visitantes</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro de pessoas para preenchimento automático
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
            <Plus className="h-4 w-4" /> Novo Cadastro
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6 max-w-2xl animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {editingId ? "Editar Cadastro" : "Novo Cadastro"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                  >
                    <option value="morador">Morador</option>
                    <option value="visitante">Visitante</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade (Bloco/Apto)</Label>
                  <Input
                    value={form.unit}
                    onChange={(e) => update("unit", e.target.value)}
                    placeholder="Ex: Bloco A, Apto 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Placa</Label>
                  <Input
                    value={form.plate}
                    onChange={(e) => update("plate", e.target.value.toUpperCase())}
                    placeholder="ABC-1D23"
                    maxLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo do Veículo</Label>
                  <Input
                    value={form.car_model}
                    onChange={(e) => update("car_model", e.target.value)}
                    placeholder="Ex: Civic, Onix..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor do Veículo</Label>
                  <Input
                    value={form.car_color}
                    onChange={(e) => update("car_color", e.target.value)}
                    placeholder="Ex: Prata, Preto..."
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={cancelForm}>
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Lista de Cadastros</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filterType === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("")}
              >
                Todos
              </Button>
              <Button
                variant={filterType === "morador" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("morador")}
                className="gap-1"
              >
                <Users className="h-3.5 w-3.5" /> Moradores
              </Button>
              <Button
                variant={filterType === "visitante" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("visitante")}
                className="gap-1"
              >
                <UserCheck className="h-3.5 w-3.5" /> Visitantes
              </Button>
            </div>
          </div>
          <div className="mt-2 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, placa, unidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !filtered.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search || filterType ? "Nenhum resultado encontrado." : "Nenhum cadastro ainda. Clique em 'Novo Cadastro'."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{r.name}</span>
                      <Badge variant={r.type === "morador" ? "default" : "secondary"}>
                        {r.type === "morador" ? "Morador" : "Visitante"}
                      </Badge>
                      {r.unit && <Badge variant="outline">{r.unit}</Badge>}
                      {r.plate && (
                        <Badge className="bg-accent/15 text-accent border-accent/30 font-mono text-sm font-bold tracking-wider">
                          {r.plate}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[r.car_model, r.car_color].filter(Boolean).join(" · ")}
                      {r.phone && ` · Tel: ${r.phone}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(r)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir cadastro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remover <strong>{r.name}</strong> da lista?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(r.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ResidentsPage;

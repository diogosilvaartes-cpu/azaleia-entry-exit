import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Save, X, Search, User } from "lucide-react";
import { useResidents, useCreateResident, useUpdateResident, useDeleteResident } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import PlateBadge from "@/components/PlateBadge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Resident, ResidentInsert } from "@/lib/types";

const emptyForm: ResidentInsert = {
  name: "", unit: "", phone: "", type: "morador",
  car_model: "", car_color: "", plate: "", notes: "",
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
    const matchSearch = !q || r.name.toLowerCase().includes(q) ||
      (r.plate && r.plate.toLowerCase().includes(q)) ||
      (r.unit && r.unit.toLowerCase().includes(q));
    return matchSearch && (!filterType || r.type === filterType);
  });

  const startEdit = (r: Resident) => {
    setEditingId(r.id);
    setForm({
      name: r.name, unit: r.unit || "", phone: r.phone || "",
      type: r.type, car_model: r.car_model || "", car_color: r.car_color || "",
      plate: r.plate || "", notes: r.notes || "",
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
      setForm(emptyForm); setEditingId(null); setShowForm(false);
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteResident.mutateAsync(id); toast({ title: "Cadastro removido!" }); }
    catch { toast({ title: "Erro ao remover", variant: "destructive" }); }
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Lista de Moradores e Visitantes</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-full px-5">
            <Plus className="h-4 w-4" /> Novo Cadastro
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="apple-card p-6 mb-6 max-w-2xl animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Editar Cadastro" : "Novo Cadastro"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nome completo" required />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => update("type", e.target.value)}>
                  <option value="morador">Morador</option>
                  <option value="visitante">Visitante</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Unidade</Label>
                <Input value={form.unit} onChange={(e) => update("unit", e.target.value)} placeholder="Casa, Bloco..." />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-1.5">
                <Label>Placa</Label>
                <Input value={form.plate} onChange={(e) => update("plate", e.target.value.toUpperCase())} placeholder="ABC-1D23" maxLength={8} />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input value={form.car_model} onChange={(e) => update("car_model", e.target.value)} placeholder="Ex: Civic, Onix..." />
              </div>
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <Input value={form.car_color} onChange={(e) => update("car_color", e.target.value)} placeholder="Ex: Prata, Preto..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={cancelForm}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
              <Button type="submit" className="gap-2 rounded-full px-6"><Save className="h-4 w-4" /> {editingId ? "Atualizar" : "Cadastrar"}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou placa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-2xl bg-card border-0 shadow-sm"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4">
        {(["", "morador", "visitante"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
              filterType === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "" ? "Todos" : t === "morador" ? "Moradores" : "Visitantes"}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
      ) : !filtered.length ? (
        <div className="apple-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search || filterType ? "Nenhum resultado." : "Nenhum cadastro ainda."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="apple-card p-4 flex items-center gap-4 animate-fade-in">
              {/* Avatar placeholder */}
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground uppercase">{r.name}</span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {r.type === "morador" ? "Morador" : "Visitante"}
                  </span>
                </div>
                {r.plate && (
                  <div className="mt-1">
                    <PlateBadge plate={r.plate} size="sm" />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-0.5">{r.unit || ""}</p>
              </div>

              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(r)} className="h-9 w-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="h-9 w-9 rounded-full hover:bg-destructive/10 flex items-center justify-center text-destructive/60 hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir cadastro</AlertDialogTitle>
                      <AlertDialogDescription>Remover <strong>{r.name}</strong>?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(r.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ResidentsPage;

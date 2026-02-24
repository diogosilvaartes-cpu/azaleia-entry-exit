import { useState, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Save, X, Search, User, Camera, Car } from "lucide-react";
import { useResidents, useCreateResident, useUpdateResident, useDeleteResident } from "@/hooks/useResidents";
import { useToast } from "@/hooks/use-toast";
import PlateBadge from "@/components/PlateBadge";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Resident, ResidentInsert } from "@/lib/types";

const emptyForm: ResidentInsert & { photo_url?: string; car_photo_url?: string } = {
  name: "", unit: "", phone: "", type: "morador",
  car_model: "", car_color: "", plate: "", notes: "",
  photo_url: "", car_photo_url: "",
};

const ResidentsPage = () => {
  const { data: residents, isLoading } = useResidents();
  const createResident = useCreateResident();
  const updateResident = useUpdateResident();
  const deleteResident = useDeleteResident();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"" | "morador" | "visitante">("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCarPhoto, setUploadingCarPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const carPhotoInputRef = useRef<HTMLInputElement>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const filtered = (residents || []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) ||
      (r.plate && r.plate.toLowerCase().includes(q)) ||
      (r.unit && r.unit.toLowerCase().includes(q));
    return matchSearch && (!filterType || r.type === filterType);
  });

  const uploadPhoto = async (file: File, type: "photo" | "car") => {
    const setter = type === "photo" ? setUploadingPhoto : setUploadingCarPhoto;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${type}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("resident-photos").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("resident-photos").getPublicUrl(path);
      const field = type === "photo" ? "photo_url" : "car_photo_url";
      setForm((prev) => ({ ...prev, [field]: urlData.publicUrl }));
      toast({ title: "Foto enviada!" });
    } catch {
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const startEdit = (r: Resident) => {
    setEditingId(r.id);
    setForm({
      name: r.name, unit: r.unit || "", phone: r.phone || "",
      type: r.type, car_model: r.car_model || "", car_color: r.car_color || "",
      plate: r.plate || "", notes: r.notes || "",
      photo_url: r.photo_url || "", car_photo_url: r.car_photo_url || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        photo_url: form.photo_url || undefined,
        car_photo_url: form.car_photo_url || undefined,
      };
      if (editingId) {
        await updateResident.mutateAsync({ id: editingId, ...payload } as any);
        toast({ title: "Cadastro atualizado!" });
      } else {
        await createResident.mutateAsync(payload);
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
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Cadastros</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-full px-5 font-bold">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="apple-card p-6 mb-6 max-w-2xl animate-fade-in">
          <h2 className="text-lg font-bold mb-4">{editingId ? "Editar Cadastro" : "Novo Cadastro"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo uploads */}
            <div className="flex gap-4 mb-2">
              {/* Person photo */}
              <div className="text-center">
                <Label className="text-xs font-bold text-muted-foreground mb-1 block">Foto Morador</Label>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="h-28 w-28 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/10 transition-all overflow-hidden"
                >
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="Foto" className="h-full w-full object-cover" />
                  ) : uploadingPhoto ? (
                    <span className="text-xs text-muted-foreground">Enviando...</span>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-primary/60" />
                      <span className="text-[10px] text-primary/60 font-medium">Adicionar</span>
                    </>
                  )}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "photo")} />
              </div>
              {/* Car photo */}
              <div className="text-center">
                <Label className="text-xs font-bold text-muted-foreground mb-1 block">Foto Veículo</Label>
                <button
                  type="button"
                  onClick={() => carPhotoInputRef.current?.click()}
                  disabled={uploadingCarPhoto}
                  className="h-28 w-28 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 flex flex-col items-center justify-center gap-1 hover:border-accent hover:bg-accent/10 transition-all overflow-hidden"
                >
                  {form.car_photo_url ? (
                    <img src={form.car_photo_url} alt="Veículo" className="h-full w-full object-cover" />
                  ) : uploadingCarPhoto ? (
                    <span className="text-xs text-muted-foreground">Enviando...</span>
                  ) : (
                    <>
                      <Car className="h-6 w-6 text-accent/60" />
                      <span className="text-[10px] text-accent/60 font-medium">Adicionar</span>
                    </>
                  )}
                </button>
                <input ref={carPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "car")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-bold">Nome *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nome completo" required className="font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">Tipo</Label>
                <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium" value={form.type} onChange={(e) => update("type", e.target.value)}>
                  <option value="morador">Morador</option>
                  <option value="visitante">Visitante</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">Unidade</Label>
                <Input value={form.unit} onChange={(e) => update("unit", e.target.value)} placeholder="Casa, Bloco..." className="font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">Telefone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(11) 99999-9999" className="font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">Placa</Label>
                <Input value={form.plate} onChange={(e) => update("plate", e.target.value.toUpperCase())} placeholder="ABC-1D23" maxLength={8} className="font-mono font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">Modelo</Label>
                <Input value={form.car_model} onChange={(e) => update("car_model", e.target.value)} placeholder="Ex: Civic, Onix..." />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">Cor</Label>
                <Input value={form.car_color} onChange={(e) => update("car_color", e.target.value)} placeholder="Ex: Prata, Preto..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={cancelForm}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
              <Button type="submit" className="gap-2 rounded-full px-6 font-bold"><Save className="h-4 w-4" /> {editingId ? "Atualizar" : "Cadastrar"}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, placa ou casa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 rounded-2xl bg-card border-0 shadow-sm text-base font-medium"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4">
        {(["", "morador", "visitante"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
              filterType === t
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-foreground/60 hover:text-foreground"
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
          <p className="text-muted-foreground font-medium">
            {search || filterType ? "Nenhum resultado." : "Nenhum cadastro ainda."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="apple-card p-4 flex items-center gap-4 animate-fade-in">
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

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-lg text-foreground uppercase">{r.name}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    r.type === "morador"
                      ? "bg-primary/15 text-primary"
                      : "bg-accent/15 text-accent"
                  }`}>
                    {r.type === "morador" ? "Morador" : "Visitante"}
                  </span>
                </div>
                {r.plate && (
                  <div className="mt-1">
                    <PlateBadge plate={r.plate} size="sm" />
                  </div>
                )}
                {r.unit && <p className="text-sm font-semibold text-muted-foreground mt-0.5">Casa {r.unit}</p>}
              </div>

              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(r)} className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="h-10 w-10 rounded-full hover:bg-destructive/10 flex items-center justify-center text-destructive/60 hover:text-destructive transition-colors">
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

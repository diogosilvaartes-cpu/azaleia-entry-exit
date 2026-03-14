import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useAllShiftNotes, useCreateShiftNote } from "@/hooks/useShiftNotes";
import { useToast } from "@/hooks/use-toast";
import DoormanTag from "@/components/DoormanTag";

const OccurrencesPage = () => {
  const { data: notes, isLoading } = useAllShiftNotes();
  const createNote = useCreateShiftNote();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createNote.mutateAsync(content.trim());
      setContent("");
      toast({ title: "Ocorrência registrada!" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const grouped = (notes || []).reduce<Record<string, typeof notes>>((acc, note) => {
    const date = note.shift_date;
    if (!acc[date]) acc[date] = [];
    acc[date]!.push(note);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <AppLayout pageId="occurrences">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Livro de Ocorrências</h1>
        <p className="text-sm font-medium text-muted-foreground">Registro de observações e eventos</p>
      </div>

      {/* New occurrence */}
      <div className="apple-card p-5 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Registrar evento ou observação do turno..."
            rows={2}
            className="flex-1 rounded-xl border-border/60 bg-secondary/40 resize-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={createNote.isPending || !content.trim()}
            className="self-end rounded-xl h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8 font-medium">Carregando...</p>
      ) : !notes?.length ? (
        <div className="apple-card p-8 text-center">
          <p className="text-sm text-muted-foreground font-medium">Nenhuma ocorrência registrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {formatDate(date + "T00:00:00")}
              </p>
              <div className="space-y-2">
                {grouped[date]!.map((note) => (
                  <div key={note.id} className="apple-card p-4 animate-fade-in">
                    <p className="text-sm text-foreground whitespace-pre-wrap font-medium leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-muted-foreground font-medium">{formatTime(note.created_at)}</p>
                      <DoormanTag userId={note.created_by} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default OccurrencesPage;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, BookOpen } from "lucide-react";
import { useTodayShiftNotes, useCreateShiftNote } from "@/hooks/useShiftNotes";
import { useToast } from "@/hooks/use-toast";

const ShiftNotesWidget = () => {
  const { data: notes, isLoading } = useTodayShiftNotes();
  const createNote = useCreateShiftNote();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createNote.mutateAsync(content.trim());
      setContent("");
      toast({ title: "Observação registrada!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const colors = [
    "border-l-4 border-l-warning bg-warning/5",
    "border-l-4 border-l-primary bg-primary/5",
    "border-l-4 border-l-success bg-success/5",
    "border-l-4 border-l-destructive bg-destructive/5",
    "border-l-4 border-l-accent bg-accent/5",
  ];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <MessageSquare className="h-5 w-5 text-primary" />
            Observações do Turno
          </CardTitle>
          <Link to="/occurrences">
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-medium">
              <BookOpen className="h-3.5 w-3.5" /> Ver Livro
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
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
            className="self-end gap-1 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {isLoading ? (
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        ) : !notes?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4 font-medium">
            Nenhuma observação registrada hoje.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notes.map((note, i) => (
              <div
                key={note.id}
                className={`rounded-xl p-3 animate-fade-in ${colors[i % colors.length]}`}
              >
                <p className="text-sm text-foreground whitespace-pre-wrap font-medium">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{formatTime(note.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftNotesWidget;

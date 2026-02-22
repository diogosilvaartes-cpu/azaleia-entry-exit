import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Observações do Turno
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Registrar evento ou observação do turno..."
            rows={2}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={createNote.isPending || !content.trim()}
            className="self-end gap-1"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : !notes?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma observação registrada hoje.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-border bg-muted/50 p-3 animate-fade-in"
              >
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(note.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftNotesWidget;

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Send } from "lucide-react";
import { useAllShiftNotes, useCreateShiftNote } from "@/hooks/useShiftNotes";
import { useToast } from "@/hooks/use-toast";

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
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR");
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // Group notes by shift_date
  const grouped = (notes || []).reduce<Record<string, typeof notes>>((acc, note) => {
    const date = note.shift_date;
    if (!acc[date]) acc[date] = [];
    acc[date]!.push(note);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Livro de Ocorrências
        </h1>
        <p className="text-sm text-muted-foreground">
          Registro de observações e eventos dos turnos
        </p>
      </div>

      {/* New occurrence form */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nova Ocorrência</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Send className="h-4 w-4" /> Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notes list grouped by date */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
      ) : !notes?.length ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma ocorrência registrada.
        </p>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="outline">{formatDate(date + "T00:00:00")}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[date]!.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-border bg-muted/50 p-3 animate-fade-in"
                  >
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(note.created_at)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default OccurrencesPage;

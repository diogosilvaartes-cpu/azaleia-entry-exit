import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ShiftNote } from "@/lib/types";

export function useTodayShiftNotes() {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["shift_notes", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shift_notes")
        .select("*")
        .eq("shift_date", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ShiftNote[];
    },
  });
}

export function useCreateShiftNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { error } = await supabase
        .from("shift_notes")
        .insert({ content, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift_notes"] });
    },
  });
}

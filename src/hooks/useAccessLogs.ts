import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AccessLog, AccessLogInsert } from "@/lib/types";

export function useActiveEntries() {
  return useQuery({
    queryKey: ["access_logs", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .is("exit_time", null)
        .order("entry_time", { ascending: false });
      if (error) throw error;
      return data as AccessLog[];
    },
    refetchInterval: 30000,
  });
}

export function useTodayStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  return useQuery({
    queryKey: ["access_logs", "today_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .gte("entry_time", todayISO);
      if (error) throw error;
      const logs = data as AccessLog[];
      return {
        entries: logs.length,
        exits: logs.filter((l) => l.exit_time).length,
        active: logs.filter((l) => !l.exit_time).length,
      };
    },
    refetchInterval: 30000,
  });
}

export function useRegisterExit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("access_logs")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access_logs"] });
    },
  });
}

export function useCreateEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<AccessLogInsert, "created_by">) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { error } = await supabase
        .from("access_logs")
        .insert({ ...entry, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access_logs"] });
    },
  });
}

export function useCreateStandaloneExit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<AccessLogInsert, "created_by">) => {
      if (!user) throw new Error("Usuário não autenticado");
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("access_logs")
        .insert({
          ...entry,
          created_by: user.id,
          entry_time: now,
          exit_time: now,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access_logs"] });
    },
  });
}

export function useHistoryLogs(filters: {
  dateFrom?: string;
  dateTo?: string;
  plate?: string;
  name?: string;
  destination?: string;
  status?: "active" | "finished" | "";
}) {
  return useQuery({
    queryKey: ["access_logs", "history", filters],
    queryFn: async () => {
      let query = supabase
        .from("access_logs")
        .select("*")
        .order("entry_time", { ascending: false });

      if (filters.dateFrom) {
        query = query.gte("entry_time", filters.dateFrom);
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        query = query.lte("entry_time", to.toISOString());
      }
      if (filters.plate) {
        query = query.ilike("plate", `%${filters.plate}%`);
      }
      if (filters.name) {
        query = query.ilike("driver_name", `%${filters.name}%`);
      }
      if (filters.destination) {
        query = query.ilike("destination", `%${filters.destination}%`);
      }
      if (filters.status === "active") {
        query = query.is("exit_time", null);
      } else if (filters.status === "finished") {
        query = query.not("exit_time", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AccessLog[];
    },
  });
}

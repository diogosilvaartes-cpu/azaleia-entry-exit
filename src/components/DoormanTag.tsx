import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

interface Props {
  userId: string;
}

const DoormanTag = ({ userId }: Props) => {
  const { data: email } = useQuery({
    queryKey: ["user_email", userId],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("get_user_email", { user_id: userId });
      return (data as string) || null;
    },
    staleTime: Infinity,
    retry: false,
  });

  const label = email
    ? email.split("@")[0].replace(/[._]/g, " ").slice(0, 12)
    : userId.slice(0, 6);

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
      <Shield className="h-2.5 w-2.5" />
      {label}
    </span>
  );
};

export default DoormanTag;

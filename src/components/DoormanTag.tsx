import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

interface Props {
  userId: string;
}

const TAG_COLORS = [
  { bg: "bg-primary/10", text: "text-primary/80" },
  { bg: "bg-success/10", text: "text-success" },
  { bg: "bg-warning/10", text: "text-warning" },
  { bg: "bg-destructive/10", text: "text-destructive/80" },
  { bg: "bg-accent", text: "text-accent-foreground" },
  { bg: "bg-secondary", text: "text-secondary-foreground" },
];

const hashUserId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % TAG_COLORS.length;
};

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

  const color = TAG_COLORS[hashUserId(userId)];

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${color.bg} ${color.text}`}>
      <Shield className="h-2.5 w-2.5" />
      {label}
    </span>
  );
};

export default DoormanTag;

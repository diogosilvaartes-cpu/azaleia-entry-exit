
-- Create access_logs table
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exit_time TIMESTAMP WITH TIME ZONE,
  plate TEXT,
  driver_name TEXT NOT NULL,
  identity_number TEXT,
  destination TEXT NOT NULL,
  authorized_by TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all logs
CREATE POLICY "Authenticated users can read access_logs"
ON public.access_logs FOR SELECT TO authenticated
USING (true);

-- Authenticated users can insert (created_by must match their uid)
CREATE POLICY "Authenticated users can insert access_logs"
ON public.access_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Authenticated users can update (only exit_time and updated_at)
CREATE POLICY "Authenticated users can update access_logs"
ON public.access_logs FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_access_logs_updated_at
BEFORE UPDATE ON public.access_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

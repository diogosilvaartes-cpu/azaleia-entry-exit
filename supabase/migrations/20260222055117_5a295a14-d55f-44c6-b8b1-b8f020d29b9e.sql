
-- 1. Residents/visitors directory
CREATE TABLE public.residents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  unit text, -- apto/bloco
  phone text,
  type text NOT NULL DEFAULT 'morador' CHECK (type IN ('morador', 'visitante')),
  car_model text,
  car_color text,
  plate text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS for residents
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read residents"
  ON public.residents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert residents"
  ON public.residents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update residents"
  ON public.residents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete residents"
  ON public.residents FOR DELETE
  TO authenticated
  USING (true);

-- updated_at trigger for residents
CREATE TRIGGER update_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add car_model and car_color to access_logs
ALTER TABLE public.access_logs ADD COLUMN car_model text;
ALTER TABLE public.access_logs ADD COLUMN car_color text;

-- 3. Shift notes table
CREATE TABLE public.shift_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  created_by uuid NOT NULL,
  shift_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shift_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read shift_notes"
  ON public.shift_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shift_notes"
  ON public.shift_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

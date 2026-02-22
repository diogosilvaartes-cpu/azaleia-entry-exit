export interface AccessLog {
  id: string;
  entry_time: string;
  exit_time: string | null;
  plate: string | null;
  driver_name: string;
  identity_number: string | null;
  destination: string;
  authorized_by: string;
  notes: string | null;
  car_model: string | null;
  car_color: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AccessLogInsert {
  plate?: string;
  driver_name: string;
  identity_number?: string;
  destination: string;
  authorized_by: string;
  notes?: string;
  car_model?: string;
  car_color?: string;
  created_by: string;
}

export interface Resident {
  id: string;
  name: string;
  unit: string | null;
  phone: string | null;
  type: "morador" | "visitante";
  car_model: string | null;
  car_color: string | null;
  plate: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResidentInsert {
  name: string;
  unit?: string;
  phone?: string;
  type?: "morador" | "visitante";
  car_model?: string;
  car_color?: string;
  plate?: string;
  notes?: string;
}

export interface ShiftNote {
  id: string;
  content: string;
  created_by: string;
  shift_date: string;
  created_at: string;
}

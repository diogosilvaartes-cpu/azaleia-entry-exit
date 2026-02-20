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
  created_by: string;
}

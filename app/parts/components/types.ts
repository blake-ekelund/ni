export interface ComponentRecord {
  id: string;
  component: string;
  description?: string | null;
  used_in?: string[];
  qty_available?: number | null;
  qty_on_order?: number | null;
  lead_time?: number | null;        // ✅ renamed from lead_time_days
  min_stock?: number | null;
  max_stock?: number | null;
  moq?: number | null;              // ✅ renamed from min_order_qty
  units?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

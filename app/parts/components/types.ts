export interface ComponentRecord {
  id: string;
  component: string;
  description?: string | null;
  used_in?: string[];
  qty_available?: number | null;
  qty_on_order?: number | null;
  lead_time_days?: number | null;
  min_stock?: number | null;
  max_stock?: number | null;
  min_order_qty?: number | null;
  created_at?: string | null;
}

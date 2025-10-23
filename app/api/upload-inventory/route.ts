import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import Papa from "papaparse";

// ---------- Types ----------
interface InventoryRowRaw {
  [key: string]: string | number | null | undefined;
}

interface InventoryRowMapped {
  part: string | null;
  description: string | null;
  uom: string | null;
  on_hand: number;
  allocated: number;
  not_available: number;
  drop_ship: number;
  available: number;
  on_order: number;
  committed: number;
  short: number;
  location: string | null;
  source_file_name: string;
}

// ---------- Helpers ----------
const cleanNumber = (val: unknown): number => {
  if (val === null || val === undefined) return 0;
  const cleaned = String(val).replace(/[^\d.-]/g, "").trim();
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const normalize = (str: string): string =>
  str
    .replace(/\r?\n|\r/g, " ")
    .replace(/"/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// ---------- Route ----------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const location = formData.get("location") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: InventoryRowRaw[] = [];

    // --- Parse file ---
    if (file.name.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const parsed = Papa.parse<InventoryRowRaw>(text, {
        header: true,
        skipEmptyLines: true,
      });
      rows = parsed.data;
    } else if (/\.(xlsx|xls)$/i.test(file.name)) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<InventoryRowRaw>(sheet, {
        range: 4,
        defval: "",
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows found" },
        { status: 400 }
      );
    }

    // --- Normalize headers ---
    const rawHeaders = Object.keys(rows[0] ?? {});
    const headerMap: Record<string, string> = Object.fromEntries(
      rawHeaders.map((h) => [normalize(h), h])
    );

    const getVal = (row: InventoryRowRaw, key: string): string | number | null =>
      headerMap[key] !== undefined ? (row[headerMap[key]] ?? null) : null;

    // --- Map to DB structure ---
    const mapped: InventoryRowMapped[] = rows.map((r) => ({
      part: (getVal(r, "part") ?? r["Part"] ?? null) as string | null,
      description: (getVal(r, "description") ?? null) as string | null,
      uom: (getVal(r, "uom") ?? null) as string | null,
      on_hand: cleanNumber(getVal(r, "on hand")),
      allocated: cleanNumber(getVal(r, "allocated")),
      not_available: cleanNumber(getVal(r, "not available")),
      drop_ship: cleanNumber(getVal(r, "drop ship")),
      available: cleanNumber(getVal(r, "available")),
      on_order: cleanNumber(getVal(r, "on order")),
      committed: cleanNumber(getVal(r, "committed")),
      short: cleanNumber(getVal(r, "short")),
      location,
      source_file_name: file.name,
    }));

    console.log("✅ Parsed headers:", rawHeaders);
    console.log("📦 First mapped row:", mapped[0]);

    // --- Insert into Supabase ---
    const { error } = await supabase.from("inventory_data").insert(mapped);
    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      inserted: mapped.length,
      headers_detected: Object.keys(headerMap),
    });
  } catch (err) {
    const e = err as Error;
    console.error("❌ Upload failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

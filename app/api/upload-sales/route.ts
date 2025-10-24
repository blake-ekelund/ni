import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface ParsedSaleRow {
  product: string;
  qty: number;
  sales: number;
}

type RawRow = (string | number | null | undefined)[];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const period = formData.get('period') as string | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!period) return NextResponse.json({ error: 'Missing period' }, { status: 400 });

    // ─────────────────────────────
    // Read Excel workbook
    // ─────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { header: 1, defval: '' });

    if (rows.length === 0)
      return NextResponse.json({ error: 'Empty file detected' }, { status: 400 });

    // ─────────────────────────────
    // Helpers
    // ─────────────────────────────
    const normalize = (s: unknown): string =>
      String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const cleanNumber = (val: unknown): number => {
      if (val == null) return 0;
      if (typeof val === 'number') return val;
      const str = String(val)
        .replace(/\u00A0/g, ' ') // non-breaking spaces
        .replace(/[^\d.\-]/g, '') // remove $, commas, etc.
        .trim();
      const num = Number(str);
      return isFinite(num) ? num : 0;
    };

    // ─────────────────────────────
    // Find header row (must include "Product" AND ("Qty" or "Sales"))
    // ─────────────────────────────
    const headerRowIndex = rows.findIndex((row) => {
    const normed = row.map(normalize);

    // Ignore title lines like "GrossSalesByProduct"
    if (normed.join('').includes('grosssalesbyproduct')) return false;

    // Require "product" AND either "qty" or "sales" in the same row
    const hasProduct = normed.some((c) => c.includes('product'));
    const hasQty = normed.some((c) => c.includes('qty') || c.includes('quantity'));
    const hasSales = normed.some((c) => c.includes('sales'));
    return hasProduct && (hasQty || hasSales);
    });

    if (headerRowIndex === -1) {
      console.error('❌ Could not locate header row');
      return NextResponse.json(
        { error: 'Could not locate header row (expected Product / Qty / Sales)' },
        { status: 400 }
      );
    }

    // Trim off any empty leading columns
    const rawHeaders = rows[headerRowIndex];
    const firstNonEmpty = rawHeaders.findIndex((h) => normalize(h) !== '');
    const headers = rawHeaders.slice(firstNonEmpty).map((h) => normalize(h));
    const dataRows = rows.slice(headerRowIndex + 1).map((r) => r.slice(firstNonEmpty));
    
    // ─────────────────────────────
    // Parse and extract data
    // ─────────────────────────────
    const extracted: ParsedSaleRow[] = dataRows
      .map((row) => {
        const record: ParsedSaleRow = { product: '', qty: 0, sales: 0 };

        headers.forEach((header, i) => {
          const value = row[i];
          if (header.includes('product')) record.product = String(value ?? '').trim();
          else if (header.includes('qty') || header.includes('quantity'))
            record.qty = cleanNumber(value);
          else if (header.includes('sale')) record.sales = cleanNumber(value);
        });

        // Skip continuation / UPC rows
        if (/^upc/i.test(record.product)) record.product = '';

        return record;
      })
      .filter((r) => r.product && (r.qty > 0 || r.sales > 0));

    if (extracted.length === 0) {
      console.warn('⚠️ No valid rows extracted — check data formatting');
      return NextResponse.json(
        {
          error:
            'No valid sales records found. Check that Product / Qty / Sales columns have numeric data.',
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────
    // Insert into Supabase
    // ─────────────────────────────
    const { error } = await supabase.from('sales_data').insert(
      extracted.map((r) => ({
        product: r.product,
        qty: r.qty,
        sales: r.sales,
        period,
      }))
    );

    if (error) throw new Error(error.message);

    return NextResponse.json({
      inserted: extracted.length,
      period,
      status: 'success',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown upload error';
    console.error('💥 Upload error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

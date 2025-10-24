'use client';

import { useState, useEffect, useMemo } from 'react';
import SalesFilters from './components/SalesFilters';
import SalesSummaryCards from './components/SalesSummaryCards';
import SalesChartYearly from './components/SalesChartYearly';
import SalesTable from './components/SalesTable';
import ExportButton from './components/ExportButton';
import SalesUploadModal from './components/SalesUploadModal';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

// ─────────────────────────────
// Types
// ─────────────────────────────
interface SalesRecord {
  id: string;
  created_at: string;
  product_code: string;
  product_name: string | null;
  description: string | null;
  fragrance: string | null;
  type: string | null;
  other: string | null;
  size: string | null;
  status: string | null;
  qty: number;
  sales: number;
  period: string;
}

interface Filters {
  product: string[];
  type: string[];
  fragrance: string[];
}

// ─────────────────────────────
// Page Component
// ─────────────────────────────
export default function SalesPage() {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [chartData, setChartData] = useState<
    { month_name: string; current_year_sales: number; prior_year_sales: number }[]
  >([]);
  const [filters, setFilters] = useState<Filters>({
    product: [],
    type: [],
    fragrance: [],
  });
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedView, setSelectedView] = useState<'product' | 'fragrance' | 'none'>('product');

  const currentYear = new Date().getFullYear();
  const priorYear = currentYear - 1;

  // ─────────────────────────────
  // Fetch sales (YTD current + prior year) — batched + multi-filter
  // ─────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const startDate = `${priorYear}-01-01`;
      const endDate = new Date().toISOString().split('T')[0];
      const batchSize = 1000;
      let from = 0;
      let allRows: SalesRecord[] = [];

      while (true) {
        let query = supabase
          .from('sales_data_view')
          .select('*', { count: 'exact' })
          .gte('period', startDate)
          .lte('period', endDate)
          .range(from, from + batchSize - 1);

        if (filters.product.length) query = query.in('product_name', filters.product);
        if (filters.type.length) query = query.in('type', filters.type);
        if (filters.fragrance.length) query = query.in('fragrance', filters.fragrance);

        const { data, error } = await query;

        if (error) {
          console.error('❌ Supabase batch error:', error);
          toast.error('❌ Failed to fetch sales data.');
          break;
        }

        if (!data?.length) break;
        allRows = allRows.concat(data);

        if (data.length < batchSize) break;
        from += batchSize;
      }

      setSalesData(allRows);
      setLoading(false);
    };

    fetchData();
  }, [filters, priorYear]);

  // ─────────────────────────────
  // Build month-by-month chart
  // ─────────────────────────────
  useEffect(() => {
    if (!salesData.length) {
      setChartData([]);
      return;
    }

    const grouped: Record<number, Record<number, number>> = {};
    for (const row of salesData) {
      const d = new Date(row.period);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (!grouped[y]) grouped[y] = {};
      grouped[y][m] = (grouped[y][m] || 0) + (row.sales ?? 0);
    }

    const data = Array.from({ length: 12 }, (_, m) => ({
      month_name: new Date(0, m).toLocaleString('en-US', { month: 'short' }),
      current_year_sales: grouped[currentYear]?.[m] ?? 0,
      prior_year_sales: grouped[priorYear]?.[m] ?? 0,
    }));

    setChartData(data);
  }, [salesData, currentYear, priorYear]);

  // ─────────────────────────────
  // Upload Handler
  // ─────────────────────────────
  const handleUpload = async (file: File, period: string): Promise<boolean> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('period', period);

      const res = await fetch('/api/upload-sales', { method: 'POST', body: formData });
      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(`❌ Upload failed: ${result.error}`);
        return false;
      }

      toast.success(`✅ Uploaded ${result.inserted} records for ${result.period}`);
      return true;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('❌ Network or server error.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
        <p className="text-gray-500 text-sm max-w-7xl">
          Review year-to-date (YTD) sales performance across products, fragrances, and categories.
          Compare current-year results against prior-year benchmarks to identify growth trends and opportunities.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex-1">
          <SalesFilters filters={filters} setFilters={setFilters} salesData={salesData} />
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#007EA7] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#006A90] transition"
          >
            Upload Sales
          </button>
          <ExportButton data={salesData} />
        </div>
      </div>

      {/* Summary + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <SalesSummaryCards
            currentYear={currentYear}
            priorYear={priorYear}
            salesData={salesData.map((s) => ({
              qty: s.qty,
              sales: s.sales,
              period: s.period,
            }))}
          />
        </div>

        <div className="lg:col-span-2">
          <SalesChartYearly data={chartData} currentYear={currentYear} priorYear={priorYear} />
        </div>
      </div>

      {/* Table Selector */}
      <div className="mt-8 flex items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">View:</span>
        {[
          { label: 'By Product', key: 'product' },
          { label: 'By Fragrance', key: 'fragrance' },
          { label: 'All SKUs', key: 'none' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedView(opt.key as 'product' | 'fragrance' | 'none')}
            className={`px-3 py-1.5 text-sm rounded-md border transition ${
              selectedView === opt.key
                ? 'bg-[#00338d] text-white border-[#00338d]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Conditional Table Rendering */}
      <div className="mt-4">
        {selectedView === 'product' && (
          <SalesTable
            title="Performance by Product"
            salesData={salesData}
            currentYear={currentYear}
            priorYear={priorYear}
            groupBy="product"
          />
        )}

        {selectedView === 'fragrance' && (
          <SalesTable
            title="Performance by Fragrance"
            salesData={salesData}
            currentYear={currentYear}
            priorYear={priorYear}
            groupBy="fragrance"
          />
        )}

        {selectedView === 'none' && (
          <SalesTable
            title="Performance by SKU"
            salesData={salesData}
            currentYear={currentYear}
            priorYear={priorYear}
            groupBy="none"
          />
        )}
      </div>

      {/* Upload Modal */}
      <SalesUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </div>
  );
}

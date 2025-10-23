'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowUpDown } from 'lucide-react';
import { FiltersBar } from './components/FiltersBar';
import { useComponentData } from './components/useComponentData';
import { ComponentRecord } from './components/types';

export default function ComponentsPage() {
  const {
    loading,
    filters,
    setFilters,
    products,
    components,
  } = useComponentData();

  const [selectedComponent, setSelectedComponent] = useState<ComponentRecord | null>(null);

  // ---------- sorting ----------
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'component',
    direction: 'asc',
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedComponents = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...components].sort((a, b) => {
      const valA = (a as any)[key];
      const valB = (b as any)[key];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return direction === 'asc' ? numA - numB : numB - numA;
    });
  }, [components, sortConfig]);

  // ---------- helpers ----------
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-1 text-[#00338d] hover:text-[#007EA7]"
    >
      {label}
      <ArrowUpDown className="w-3 h-3 opacity-60" />
    </button>
  );

  // ---------- render ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wrench className="w-6 h-6 text-[#00338d]" />
        <h1 className="text-2xl font-semibold text-[#00338d] tracking-tight">
          Components
        </h1>
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} setFilters={setFilters} products={products} />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="p-6 text-gray-500 text-center">Loading...</div>
        ) : sortedComponents.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No components match current filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold">
              <tr>
                <th className="py-3 px-4"><SortHeader label="SKU" sortKey="component" /></th>
                <th className="py-3 px-4"><SortHeader label="Description" sortKey="description" /></th>
                <th className="py-3 px-4 text-right"><SortHeader label="Available" sortKey="qty_available" /></th>
                <th className="py-3 px-4 text-right"><SortHeader label="On Order" sortKey="qty_on_order" /></th>
                <th className="py-3 px-4 text-right"><SortHeader label="Lead Time" sortKey="lead_time" /></th>
                <th className="py-3 px-4 text-right"><SortHeader label="Min" sortKey="min_stock" /></th>
                <th className="py-3 px-4 text-right"><SortHeader label="Max" sortKey="max_stock" /></th>
                <th className="py-3 px-4 text-right"><SortHeader label="MOQ" sortKey="moq" /></th>
              </tr>
            </thead>

            <tbody>
              {sortedComponents.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
                >
                  <td
                    className="py-3 px-4 font-medium text-[#007EA7] hover:underline cursor-pointer"
                    onClick={() => setSelectedComponent(c)}
                  >
                    {c.component}
                  </td>
                  <td className="py-3 px-4">{c.description ?? '—'}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.qty_available)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.qty_on_order)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.lead_time)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.min_stock)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.max_stock)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.moq)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}

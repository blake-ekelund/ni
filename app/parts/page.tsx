'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { FiltersBar } from './components/FiltersBar';
import { useComponentData } from './components/useComponentData';
import { EditComponentModal } from './components/EditComponentModal';
import { ComponentRecord } from "./components/types";

export default function ComponentsPage() {
  const {
    loading,
    filters,
    setFilters,
    products,
    components,
    setComponents,
  } = useComponentData();

  const [selectedComponent, setSelectedComponent] = useState<ComponentRecord | null>(null);

  // ✅ Number formatting helper (type-safe)
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '—';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
        ) : components.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No components match current filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold">
              <tr>
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4 text-right">On Order</th>
                <th className="py-3 px-4 text-right">Lead Time</th>
                <th className="py-3 px-4 text-right">Min</th>
                <th className="py-3 px-4 text-right">Max</th>
                <th className="py-3 px-4 text-right">Min Order</th>
              </tr>
            </thead>

            <tbody>
              {components.map((c) => (
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
                  <td className="py-3 px-4 text-right">{formatNumber(c.qty_available ?? null)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.qty_on_order ?? null)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.lead_time_days ?? null)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.min_stock ?? null)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.max_stock ?? null)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(c.min_order_qty ?? null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal */}
      {selectedComponent && (
        <EditComponentModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onSaveSuccess={(updated: ComponentRecord) => {
            setSelectedComponent(null);
            // ✅ Instantly update local data without full reload
            setComponents((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
          }}
        />
      )}
    </div>
  );
}

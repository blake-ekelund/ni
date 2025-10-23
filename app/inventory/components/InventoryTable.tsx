'use client';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';

export type InventoryRow = {
  id: string;
  part: string;
  description: string | null;
  available: number | null;
  location: string | null;
};

export type PivotRow = {
  id: string;
  part: string;
  description: string | null;
  Total: number;
  [location: string]: string | number | null | undefined;
};

type Props = {
  loading: boolean;
  inventory: PivotRow[];
  locations: string[];
};

export default function InventoryTable({ loading, inventory, locations }: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'part',
    direction: 'asc',
  });

  // helper: format numbers
  const formatNumber = (num: number) =>
    (Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 0 });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedInventory = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...inventory].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      // handle strings and numbers gracefully
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return direction === 'asc' ? numA - numB : numB - numA;
    });
  }, [inventory, sortConfig]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        Loading inventory...
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="text-center text-gray-500 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        No inventory data found. Try uploading a file.
      </div>
    );
  }

  const SortButton = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-1 text-[#00338d] hover:text-[#007EA7]"
    >
      {label}
      <ArrowUpDown className="w-3 h-3 opacity-60" />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto"
    >
      <table className="min-w-full text-sm">
        <thead className="bg-[#F6F9FB] text-left font-semibold whitespace-nowrap">
          <tr>
            <th className="py-3 px-4">
              <SortButton label="SKU" sortKey="part" />
            </th>
            <th className="py-3 px-4">
              <SortButton label="Description" sortKey="description" />
            </th>
            {locations.map((loc) => (
              <th key={loc} className="py-3 px-4 text-right">
                <SortButton label={loc} sortKey={loc} />
              </th>
            ))}
            <th className="py-3 px-4 text-right">
              <SortButton label="Total" sortKey="Total" />
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedInventory.map((row) => (
            <tr
              key={row.id}
              className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
            >
              <td className="py-3 px-4 font-medium text-[#00338d]">{row.part}</td>
              <td className="py-3 px-4 text-gray-600">{row.description}</td>

              {locations.map((loc) => (
                <td
                  key={loc}
                  className="py-3 px-4 text-right text-[#00338d] font-semibold"
                >
                  {formatNumber(Number(row[loc]) || 0)}
                </td>
              ))}

              <td className="py-3 px-4 text-right font-bold text-[#007EA7]">
                {formatNumber(Number(row.Total) || 0)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Footer Totals */}
        <tfoot className="bg-[#F6F9FB] font-semibold text-[#00338d]">
          <tr>
            <td className="py-3 px-4" colSpan={2}>
              Totals
            </td>

            {locations.map((loc) => {
              const sum = sortedInventory.reduce(
                (total, row) => total + (Number(row[loc]) || 0),
                0
              );
              return (
                <td key={loc} className="py-3 px-4 text-right">
                  {formatNumber(sum)}
                </td>
              );
            })}

            <td className="py-3 px-4 text-right font-bold text-[#007EA7]">
              {formatNumber(
                sortedInventory.reduce(
                  (total, row) => total + (Number(row.Total) || 0),
                  0
                )
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </motion.div>
  );
}

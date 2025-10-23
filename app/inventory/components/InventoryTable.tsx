'use client';
import { motion } from 'framer-motion';

export type InventoryRow = {
  id: string;
  part: string;
  description: string | null;
  available: number | null;
  location: string | null;
};

/**
 * PivotRow = one row per part, dynamic numeric columns (locations) + Total
 */
export type PivotRow = {
  id: string;
  part: string;
  description: string | null;
  Total: number;
  [location: string]: string | number | null | undefined; // ✅ more flexible
};

type Props = {
  loading: boolean;
  inventory: PivotRow[];
  locations: string[];
};

/**
 * InventoryTable renders pivoted inventory data:
 * - Each location is a dynamic column
 * - Final column shows totals per part
 * - Footer row shows column totals and grand total
 */
export default function InventoryTable({ loading, inventory, locations }: Props) {
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

  // Helper to format numbers with commas
  const formatNumber = (num: number) =>
    (Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto"
    >
      <table className="min-w-full text-sm">
        <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold whitespace-nowrap">
          <tr>
            <th className="py-3 px-4">Part</th>
            <th className="py-3 px-4">Description</th>
            {locations.map((loc) => (
              <th key={loc} className="py-3 px-4 text-right">
                {loc}
              </th>
            ))}
            <th className="py-3 px-4 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((row) => (
            <tr
              key={row.id}
              className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
            >
              <td className="py-3 px-4 font-medium">{row.part}</td>
              <td className="py-3 px-4 text-gray-600">{row.description}</td>

              {/* Per-location values */}
              {locations.map((loc) => (
                <td
                  key={loc}
                  className="py-3 px-4 text-right text-[#00338d] font-semibold"
                >
                  {formatNumber(Number(row[loc]) || 0)}
                </td>
              ))}

              {/* Total per part */}
              <td className="py-3 px-4 text-right font-bold text-[#007EA7]">
                {formatNumber(Number(row.Total) || 0)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Footer with totals per column and grand total */}
        <tfoot className="bg-[#F6F9FB] font-semibold text-[#00338d]">
          <tr>
            <td className="py-3 px-4" colSpan={2}>
              Totals
            </td>

            {/* Location totals */}
            {locations.map((loc) => {
              const sum = inventory.reduce(
                (total, row) => total + (Number(row[loc]) || 0),
                0
              );
              return (
                <td key={loc} className="py-3 px-4 text-right">
                  {formatNumber(sum)}
                </td>
              );
            })}

            {/* Grand total */}
            <td className="py-3 px-4 text-right font-bold text-[#007EA7]">
              {formatNumber(
                inventory.reduce(
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

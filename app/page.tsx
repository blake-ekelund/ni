'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  BarChart3,
  Layers,
  TrendingDown,
  TrendingUp,
  Circle,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface InventoryRecord {
  component: string;
  description: string | null;
  qty_available: number | null;
  min_stock: number | null;
  max_stock: number | null;
  min_order_qty: number | null;
}

interface InventoryHealth {
  needsReorder: InventoryRecord[];
  low: InventoryRecord[];
  healthy: InventoryRecord[];
}

type TabKey = 'inventory' | 'sales' | 'other';

// ─────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('inventory');

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        {[
          { key: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
          { key: 'sales', label: 'Sales', icon: <BarChart3 className="w-4 h-4" /> },
          { key: 'other', label: 'Other', icon: <Layers className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.key
                ? 'border-[#007EA7] text-[#00338d]'
                : 'border-transparent text-gray-500 hover:text-[#00338d]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {activeTab === 'inventory' && <InventoryView />}
      {activeTab === 'sales' && <SalesView />}
      {activeTab === 'other' && <OtherView />}
    </div>
  );
}

// ─────────────────────────────────────────────
// INVENTORY VIEW
// ─────────────────────────────────────────────
function InventoryView() {
  const [data, setData] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('component_inventory_view')
        .select(
          'component, description, qty_available, min_stock, max_stock, min_order_qty'
        );

      if (error) {
        console.error('Error loading inventory:', error);
      } else {
        setData((data as InventoryRecord[]) ?? []);
      }
      setLoading(false);
    };

    fetchInventory();
  }, []);

  if (loading)
    return <div className="text-gray-500 text-sm mt-2">Loading inventory...</div>;

  if (data.length === 0)
    return (
      <div className="text-gray-500 text-sm mt-2">
        No inventory data found.
      </div>
    );

  // classify inventory by stock health
  const health = data.reduce<InventoryHealth>(
    (acc, item) => {
      const available = Number(item.qty_available ?? 0);
      const min = Number(item.min_stock ?? 0);
      const max = Number(item.max_stock ?? 0);

      if (available < min) acc.needsReorder.push(item);
      else if (available < max) acc.low.push(item);
      else acc.healthy.push(item);

      return acc;
    },
    { needsReorder: [], low: [], healthy: [] }
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <h2 className="text-lg font-semibold text-[#007EA7] mb-4">
        Inventory Overview
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          color="red"
          icon={<TrendingDown className="text-red-600 w-5 h-5" />}
          title="Needs Reorder"
          count={health.needsReorder.length}
          subtitle="Below minimum stock"
        />
        <SummaryCard
          color="yellow"
          icon={<Circle className="text-yellow-600 w-5 h-5" />}
          title="Low Stock"
          count={health.low.length}
          subtitle="Between min and max"
        />
        <SummaryCard
          color="green"
          icon={<TrendingUp className="text-green-600 w-5 h-5" />}
          title="Healthy"
          count={health.healthy.length}
          subtitle="Above safety levels"
        />
      </div>

      {/* Low + reorder table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
          <thead className="bg-[#F6F9FB] text-[#00338d] font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Component</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-right">Available</th>
              <th className="py-3 px-4 text-right">Min</th>
              <th className="py-3 px-4 text-right">Max</th>
              <th className="py-3 px-4 text-right">Min Order</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...health.needsReorder, ...health.low].map((item) => {
              const available = Number(item.qty_available ?? 0);
              const min = Number(item.min_stock ?? 0);
              const max = Number(item.max_stock ?? 0);
              const status =
                available < min
                  ? { text: 'Needs Reorder', color: 'text-red-600' }
                  : { text: 'Low Stock', color: 'text-yellow-600' };

              return (
                <tr key={item.component} className="border-t border-gray-100">
                  <td className="py-2 px-4">{item.component}</td>
                  <td className="py-2 px-4">{item.description ?? '—'}</td>
                  <td className="py-2 px-4 text-right">{available}</td>
                  <td className="py-2 px-4 text-right">{min}</td>
                  <td className="py-2 px-4 text-right">{max}</td>
                  <td className="py-2 px-4 text-right">
                    {item.min_order_qty ?? 0}
                  </td>
                  <td className={`py-2 px-4 font-semibold ${status.color}`}>
                    {status.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// PLACEHOLDER VIEWS
// ─────────────────────────────────────────────
function SalesView() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-500"
    >
      <h2 className="text-lg font-semibold text-[#007EA7] mb-3">Sales View</h2>
      <p>This section will include charts and metrics for sales performance.</p>
    </motion.section>
  );
}

function OtherView() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-500"
    >
      <h2 className="text-lg font-semibold text-[#007EA7] mb-3">Other View</h2>
      <p>Additional analytics or modules can appear here later.</p>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// REUSABLE SUMMARY CARD
// ─────────────────────────────────────────────
function SummaryCard({
  color,
  icon,
  title,
  count,
  subtitle,
}: {
  color: 'red' | 'yellow' | 'green';
  icon: React.ReactNode;
  title: string;
  count: number;
  subtitle: string;
}) {
  const colors = {
    red: 'bg-red-50 border-red-100 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    green: 'bg-green-50 border-green-100 text-green-700',
  }[color];

  return (
    <div className={`p-4 rounded-xl border ${colors}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="mt-2 text-2xl font-bold">{count}</div>
      <p className="text-sm opacity-80">{subtitle}</p>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface Props {
  currentYear: number;
  priorYear: number;
  salesData: {
    qty: number;
    sales: number;
    period: string;
  }[];
}

interface BaseCard {
  label: string;
  value: string;
  icon: React.ReactNode; // ✅ works universally for JSX
  sub?: string;
  positive?: boolean;
}

// ─────────────────────────────
// Helper Functions
// ─────────────────────────────
const formatCurrency = (num?: number | null): string => {
  if (num == null || isNaN(num)) return '—';
  const formatted = Math.round(num).toLocaleString('en-US');
  return `$${formatted}`;
};

const formatNumber = (num?: number | null): string => {
  if (num == null || isNaN(num)) return '—';
  return Math.round(num).toLocaleString('en-US');
};

// ─────────────────────────────
// Component
// ─────────────────────────────
export default function SalesSummaryCards({
  currentYear,
  priorYear,
  salesData,
}: Props) {
  // ──────────────── YTD Calculation ────────────────
  const currentYearData = salesData.filter(
    (s) => new Date(s.period).getFullYear() === currentYear
  );
  const priorYearData = salesData.filter(
    (s) => new Date(s.period).getFullYear() === priorYear
  );

  // Determine latest month in current year
  const maxMonthCurrentYear = Math.max(
    ...currentYearData.map((s) => new Date(s.period).getMonth()),
    0
  );

  // Limit both years to that month (YTD alignment)
  const currentYTD = currentYearData.filter(
    (s) => new Date(s.period).getMonth() <= maxMonthCurrentYear
  );
  const priorYTD = priorYearData.filter(
    (s) => new Date(s.period).getMonth() <= maxMonthCurrentYear
  );

  // Totals
  const current_qty = currentYTD.reduce((sum, s) => sum + (s.qty ?? 0), 0);
  const current_sales = currentYTD.reduce((sum, s) => sum + (s.sales ?? 0), 0);
  const prior_qty = priorYTD.reduce((sum, s) => sum + (s.qty ?? 0), 0);
  const prior_sales = priorYTD.reduce((sum, s) => sum + (s.sales ?? 0), 0);

  // Variance
  const qtyDiff = current_qty - prior_qty;
  const salesDiff = current_sales - prior_sales;
  const qtyPct = prior_qty ? (qtyDiff / prior_qty) * 100 : 0;
  const salesPct = prior_sales ? (salesDiff / prior_sales) * 100 : 0;

  // ──────────────── Cards ────────────────
  const mainCards: BaseCard[] = [
    {
      label: `${currentYear} Quantity (YTD)`,
      value: formatNumber(current_qty),
      icon: <Package className="w-5 h-5 text-sky-500" />,
    },
    {
      label: `${currentYear} Sales (YTD)`,
      value: formatCurrency(current_sales),
      icon: <DollarSign className="w-5 h-5 text-sky-500" />,
    },
    {
      label: `${priorYear} Qty (YTD)`,
      value: formatNumber(prior_qty),
      icon: <Package className="w-5 h-5 text-gray-400" />,
    },
    {
      label: `${priorYear} Sales (YTD)`,
      value: formatCurrency(prior_sales),
      icon: <DollarSign className="w-5 h-5 text-gray-400" />,
    },
  ];

  const varianceCards: BaseCard[] = [
    {
      label: 'Qty Variance (YTD)',
      value: `${qtyDiff >= 0 ? '+' : '-'}${formatNumber(Math.abs(qtyDiff))}`,
      sub: `${qtyPct >= 0 ? '+' : '-'}${Math.abs(qtyPct).toFixed(1)}% vs ${priorYear}`,
      positive: qtyDiff >= 0,
      icon:
        qtyDiff >= 0 ? (
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        ),
    },
    {
      label: 'Sales Variance (YTD)',
      value: `${salesDiff >= 0 ? '+' : '-'}${formatCurrency(Math.abs(salesDiff))}`,
      sub: `${salesPct >= 0 ? '+' : '-'}${Math.abs(salesPct).toFixed(1)}% vs ${priorYear}`,
      positive: salesDiff >= 0,
      icon:
        salesDiff >= 0 ? (
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        ),
    },
  ];

  const allCards: BaseCard[] = [...mainCards, ...varianceCards];

  // ──────────────── Render ────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {allCards.map((card) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col justify-between bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            {card.icon}
            {card.label}
          </div>

          <div
            className={`text-2xl font-bold ${
              card.positive === false
                ? 'text-red-600'
                : card.positive === true
                ? 'text-emerald-600'
                : 'text-[#00338d]'
            } tracking-tight`}
          >
            {card.value}
          </div>

          {card.sub && (
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-gray-500">
              {card.sub}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type GroupBy = 'product' | 'fragrance' | 'none';

interface SalesYTDTableBaseProps {
  title: string;
  salesData: {
    product_code: string;
    product_name: string | null;
    fragrance: string | null;
    sales: number;
    period: string;
  }[];
  currentYear: number;
  priorYear: number;
  groupBy: GroupBy;
}

type SortKey =
  | 'label'
  | 'total_current_sales'
  | 'total_prior_sales'
  | 'diff'
  | 'pct';

export default function SalesYTDTableBase({
  title,
  salesData,
  currentYear,
  priorYear,
  groupBy,
}: SalesYTDTableBaseProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  }>({
    key: 'total_current_sales',
    direction: 'desc',
  });

  const toggleExpand = (label: string) => {
    const newSet = new Set(expanded);
    newSet.has(label) ? newSet.delete(label) : newSet.add(label);
    setExpanded(newSet);
  };

  // ────────────── Helper: Aggregate ──────────────
  const getYearlyData = (year: number) => {
    const filtered = salesData.filter(
      (s) => new Date(s.period).getFullYear() === year
    );
    const maxMonth = Math.max(
      ...filtered.map((s) => new Date(s.period).getMonth()),
      0
    );
    return filtered.filter((s) => new Date(s.period).getMonth() <= maxMonth);
  };

  const currentYTD = getYearlyData(currentYear);
  const priorYTD = getYearlyData(priorYear);

  const aggregate = (data: typeof salesData) => {
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        product_name: string | null;
        fragrance: string | null;
        sku: string;
        total_sales: number;
      }
    >();

    data.forEach((s) => {
      map.set(s.product_code, {
        key: s.product_code,
        label:
          groupBy === 'product'
            ? s.product_name ?? 'Unknown'
            : groupBy === 'fragrance'
            ? s.fragrance ?? 'Unknown'
            : s.product_code,
        product_name: s.product_name,
        fragrance: s.fragrance,
        sku: s.product_code,
        total_sales: (map.get(s.product_code)?.total_sales ?? 0) + (s.sales ?? 0),
      });
    });

    return map;
  };

  const currAgg = aggregate(currentYTD);
  const priorAgg = aggregate(priorYTD);

  // ────────────── Grouping Logic ──────────────
  const grouped: Record<
    string,
    {
      label: string;
      total_current_sales: number;
      total_prior_sales: number;
      diff: number;
      pct: number;
      children: {
        sku: string;
        product_name: string | null;
        fragrance: string | null;
        current_sales: number;
        prior_sales: number;
        diff: number;
        pct: number;
      }[];
    }
  > = {};

  currAgg.forEach((cur, sku) => {
    const prev = priorAgg.get(sku);
    const priorSales = prev?.total_sales ?? 0;
    const diff = cur.total_sales - priorSales;
    const pct = priorSales ? (diff / priorSales) * 100 : 0;

    const parentKey =
      groupBy === 'product'
        ? cur.product_name ?? 'Unknown'
        : groupBy === 'fragrance'
        ? cur.fragrance ?? 'Unknown'
        : cur.sku;

    if (!grouped[parentKey]) {
      grouped[parentKey] = {
        label: parentKey,
        total_current_sales: 0,
        total_prior_sales: 0,
        diff: 0,
        pct: 0,
        children: [],
      };
    }

    grouped[parentKey].children.push({
      sku: cur.sku,
      product_name: cur.product_name,
      fragrance: cur.fragrance,
      current_sales: cur.total_sales,
      prior_sales: priorSales,
      diff,
      pct,
    });

    grouped[parentKey].total_current_sales += cur.total_sales;
    grouped[parentKey].total_prior_sales += priorSales;
  });

  // finalize diffs
  Object.values(grouped).forEach((g) => {
    const diff = g.total_current_sales - g.total_prior_sales;
    const pct = g.total_prior_sales ? (diff / g.total_prior_sales) * 100 : 0;
    g.diff = diff;
    g.pct = pct;
  });

  // ────────────── Sorting ──────────────
  const sorted = React.useMemo(() => {
    const arr = Object.values(grouped);
    const { key, direction } = sortConfig;
    return arr.sort((a, b) => {
        const valA = a[key] as string | number;
        const valB = b[key] as string | number;

        // String sort
        if (typeof valA === 'string' && typeof valB === 'string') {
            return direction === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        // Numeric sort (treat non-numbers as 0)
        const numA = typeof valA === 'number' ? valA : 0;
        const numB = typeof valB === 'number' ? valB : 0;
        return direction === 'asc' ? numA - numB : numB - numA;
        });

  }, [grouped, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 inline text-gray-500" />
    ) : (
      <ArrowDown className="w-3 h-3 inline text-gray-500" />
    );
  };

  // ────────────── Render ──────────────
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm mt-8">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="text-xs text-gray-400">{sorted.length} {groupBy === 'none' ? 'SKUs' : groupBy === 'product' ? 'Products' : 'Fragrances'}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-gray-600 text-xs uppercase tracking-wide border-b border-gray-200 select-none">
            <tr>
              <th
                className="px-5 py-3 text-left cursor-pointer"
                onClick={() => requestSort('label')}
              >
                {groupBy === 'product'
                  ? 'Product'
                  : groupBy === 'fragrance'
                  ? 'Fragrance'
                  : 'SKU'}{' '}
                {getSortIcon('label')}
              </th>
              <th
                className="px-5 py-3 text-right cursor-pointer"
                onClick={() => requestSort('total_current_sales')}
              >
                {currentYear} YTD Sales {getSortIcon('total_current_sales')}
              </th>
              <th
                className="px-5 py-3 text-right cursor-pointer"
                onClick={() => requestSort('total_prior_sales')}
              >
                {priorYear} YTD Sales {getSortIcon('total_prior_sales')}
              </th>
              <th
                className="px-5 py-3 text-right cursor-pointer"
                onClick={() => requestSort('diff')}
              >
                Δ $ {getSortIcon('diff')}
              </th>
              <th
                className="px-5 py-3 text-right cursor-pointer"
                onClick={() => requestSort('pct')}
              >
                Δ % {getSortIcon('pct')}
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((group) => (
              <React.Fragment key={group.label}>
                {groupBy !== 'none' && (
                  <tr
                    onClick={() => toggleExpand(group.label)}
                    className="cursor-pointer border-b border-gray-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-2.5 font-medium text-gray-800 flex items-center gap-2">
                      {expanded.has(group.label) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      {group.label}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium text-gray-800">
                      ${Math.round(group.total_current_sales).toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5 text-right text-gray-500">
                      ${Math.round(group.total_prior_sales).toLocaleString()}
                    </td>
                    <td
                      className={`px-5 py-2.5 text-right font-semibold ${
                        group.diff >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {group.diff >= 0 ? '+' : '-'}$
                      {Math.abs(Math.round(group.diff)).toLocaleString()}
                    </td>
                    <td
                      className={`px-5 py-2.5 text-right font-semibold ${
                        group.pct >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {group.pct >= 0 ? (
                        <TrendingUp className="w-3 h-3 inline" />
                      ) : (
                        <TrendingDown className="w-3 h-3 inline" />
                      )}
                      {Math.abs(group.pct).toFixed(1)}%
                    </td>
                  </tr>
                )}

                {/* Flat mode or Expanded Rows */}
                {(!groupBy || groupBy === 'none' || expanded.has(group.label)) &&
                  group.children.map((child) => (
                    <tr
                      key={child.sku + child.fragrance}
                      className={`border-b border-gray-100 ${
                        groupBy !== 'none'
                          ? 'bg-slate-50 hover:bg-slate-100'
                          : 'hover:bg-slate-50'
                      } transition`}
                    >
                      <td
                        className={`${
                          groupBy !== 'none' ? 'px-12' : 'px-5'
                        } py-2 text-gray-700`}
                      >
                        {groupBy === 'fragrance'
                          ? child.product_name
                          : groupBy === 'product'
                          ? `${child.sku} — ${child.fragrance ?? '—'}`
                          : `${child.sku} | ${child.product_name} | ${child.fragrance ?? '—'}`}
                      </td>
                      <td className="px-5 py-2 text-right text-gray-700">
                        ${Math.round(child.current_sales).toLocaleString()}
                      </td>
                      <td className="px-5 py-2 text-right text-gray-500">
                        ${Math.round(child.prior_sales).toLocaleString()}
                      </td>
                      <td
                        className={`px-5 py-2 text-right font-medium ${
                          child.diff >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {child.diff >= 0 ? '+' : '-'}$
                        {Math.abs(Math.round(child.diff)).toLocaleString()}
                      </td>
                      <td
                        className={`px-5 py-2 text-right font-medium ${
                          child.pct >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(child.pct).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-400 py-6 text-sm"
                >
                  No data available for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

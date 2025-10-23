import { Filter, XCircle } from 'lucide-react';
import React, { useMemo } from 'react';

// ---------- Types ----------
type Product = {
  product: string;
  type?: string | null;
  fragrance?: string | null;
  size?: string | null;
};

type Filters = {
  product: string;
  type: string;
  fragrance: string;
  size: string;
};

interface FiltersBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  products: Product[];
}

// ---------- Component ----------
export function FiltersBar({ filters, setFilters, products }: FiltersBarProps) {
  // ✅ Utility: distinct + alphabetical sort
  const distinct = (arr: (string | null | undefined)[]) =>
    Array.from(new Set(arr.filter(Boolean) as string[])).sort(
      (a, b) => a.localeCompare(b)
    );

  // ✅ Dynamically filtered product list based on other active filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchProduct =
        filters.product === 'All' || p.product === filters.product;
      const matchType = filters.type === 'All' || p.type === filters.type;
      const matchFragrance =
        filters.fragrance === 'All' || p.fragrance === filters.fragrance;
      const matchSize = filters.size === 'All' || p.size === filters.size;
      return matchProduct && matchType && matchFragrance && matchSize;
    });
  }, [products, filters]);

  // ✅ Build dropdown options dynamically (context-sensitive)
  const productOptions = distinct(filteredProducts.map((p) => p.product));
  const typeOptions = distinct(filteredProducts.map((p) => p.type));
  const fragranceOptions = distinct(filteredProducts.map((p) => p.fragrance));
  const sizeOptions = distinct(filteredProducts.map((p) => p.size));

  // ✅ Clear Filters
  const clearFilters = () =>
    setFilters({ product: 'All', type: 'All', fragrance: 'All', size: 'All' });

  const filterConfigs = [
    { key: 'product', options: productOptions },
    { key: 'type', options: typeOptions },
    { key: 'fragrance', options: fragranceOptions },
    { key: 'size', options: sizeOptions },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#F6F9FB] border border-gray-100 rounded-xl p-3">
      <Filter className="w-4 h-4 text-gray-500" />

      {filterConfigs.map(({ key, options }) => (
        <select
          key={key}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3] focus:outline-none"
          value={filters[key]}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              [key]: e.target.value,
            }))
          }
        >
          <option>All</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ))}

      {/* ✅ Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#00338d] transition ml-auto"
      >
        <XCircle className="w-4 h-4" />
        Clear
      </button>
    </div>
  );
}

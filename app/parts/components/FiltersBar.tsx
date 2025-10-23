import { Filter } from 'lucide-react';
import React from 'react';

// Define Product type for type-safe mapping
type Product = {
  product: string;
  type?: string | null;
  fragrance?: string | null;
  size?: string | null;
};

// Define filters state shape
type Filters = {
  product: string;
  type: string;
  fragrance: string;
  size: string;
};

// Define props for the FiltersBar component
interface FiltersBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  products: Product[];
}

export function FiltersBar({ filters, setFilters, products }: FiltersBarProps) {
  // Utility: get distinct non-null string values
  const distinct = (arr: (string | null | undefined)[]) =>
    Array.from(new Set(arr.filter(Boolean))) as string[];

  // Build dropdown options dynamically
  const productOptions = distinct(products.map((p) => p.product));
  const typeOptions = distinct(products.map((p) => p.type));
  const fragranceOptions = distinct(products.map((p) => p.fragrance));
  const sizeOptions = distinct(products.map((p) => p.size));

  // Map of filter categories and options
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
    </div>
  );
}

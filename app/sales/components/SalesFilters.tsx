'use client';

import dynamic from 'next/dynamic';
import { Filter } from 'lucide-react';
import type { GroupBase, MultiValue, Props as SelectProps } from 'react-select';

interface Option {
  value: string;
  label: string;
}

const Select = dynamic<SelectProps<Option, true, GroupBase<Option>>>(() => import('react-select'), {
  ssr: false,
}) as React.ComponentType<SelectProps<Option, true, GroupBase<Option>>>;

interface Filters {
  product: string[];
  type: string[];
  fragrance: string[];
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  salesData: {
    product_name: string | null;
    type: string | null;
    fragrance: string | null;
  }[];
}

const uniqueOptions = (arr: (string | null)[]): Option[] =>
  Array.from(new Set(arr.filter(Boolean) as string[]))
    .sort((a, b) => a.localeCompare(b))
    .map((val) => ({ value: val, label: val }));

export default function SalesFilters({ filters, setFilters, salesData }: Props) {
  const productOptions = uniqueOptions(salesData.map((s) => s.product_name));
  const typeOptions = uniqueOptions(salesData.map((s) => s.type));
  const fragranceOptions = uniqueOptions(salesData.map((s) => s.fragrance));

  const handleChange = (key: keyof Filters, values: MultiValue<Option> | null) => {
    const newVals = values ? values.map((v) => v.value) : [];
    setFilters({ ...filters, [key]: newVals });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center w-full">
      <Filter className="w-4 h-4 text-gray-500" />

      {/* Product */}
      <div className="min-w-[220px]">
        <Select
          isMulti
          options={productOptions}
          placeholder="Filter by Product..."
          value={productOptions.filter((o) => filters.product.includes(o.value))}
          onChange={(vals) => handleChange('product', vals)}
          classNamePrefix="react-select"
        />
      </div>

      {/* Type */}
      <div className="min-w-[180px]">
        <Select
          isMulti
          options={typeOptions}
          placeholder="Filter by Type..."
          value={typeOptions.filter((o) => filters.type.includes(o.value))}
          onChange={(vals) => handleChange('type', vals)}
          classNamePrefix="react-select"
        />
      </div>

      {/* Fragrance */}
      <div className="min-w-[200px]">
        <Select
          isMulti
          options={fragranceOptions}
          placeholder="Filter by Fragrance..."
          value={fragranceOptions.filter((o) => filters.fragrance.includes(o.value))}
          onChange={(vals) => handleChange('fragrance', vals)}
          classNamePrefix="react-select"
        />
      </div>

      <button
        onClick={() => setFilters({ product: [], type: [], fragrance: [] })}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Reset
      </button>
    </div>
  );
}

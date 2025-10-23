'use client';
import { Filter } from 'lucide-react';

type Props = {
  locations: string[];
  selected: string;
  onChange: (location: string) => void;
};

export default function InventoryFilters({ locations, selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
      <Filter className="w-5 h-5 text-gray-500" />
      <select
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3]"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
    </div>
  );
}

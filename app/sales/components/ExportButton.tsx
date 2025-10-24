'use client';

import { Download } from 'lucide-react';
import { Parser } from 'json2csv';

interface Props<T extends object> {
  data: T[];
  fileName?: string;
}

export default function ExportButton<T extends object>({
  data,
  fileName = 'sales_export.csv',
}: Props<T>) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const parser = new Parser<T>();
      const csv = parser.parse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}

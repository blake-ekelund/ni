'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, Upload } from 'lucide-react';

interface SalesUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, period: string) => Promise<boolean>;
  uploading: boolean;
}

export default function SalesUploadModal({
  isOpen,
  onClose,
  onUpload,
  uploading,
}: SalesUploadModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);

  if (!isOpen) return null;

  // Build normalized system date (e.g., "10/31/2025")
  const getPeriodDate = (): string => {
    const lastDay = new Date(year, month, 0);
    return lastDay.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file before uploading.');
      return;
    }
    const periodDate = getPeriodDate();
    const success = await onUpload(file, periodDate);
    if (success) {
      toast.success(`✅ Sales data uploaded for ${periodDate}`);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-[#00338d] mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Upload Monthly Sales Data
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Select the reporting month and upload the sales file (.xls, .xlsx, or .csv).  
          Only <strong>Product</strong>, <strong>Qty</strong>, and <strong>Sales</strong> columns will be imported.
        </p>

        {/* Period Selection */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {Array.from({ length: 6 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          <span className="text-xs text-gray-500 ml-2">
            Period: {getPeriodDate()}
          </span>
        </div>

        {/* File Input */}
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="px-4 py-2 text-sm rounded-md bg-[#007EA7] text-white hover:bg-[#006A90] transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

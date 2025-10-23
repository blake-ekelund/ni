'use client';
import * as React from 'react';
import { motion } from 'framer-motion';

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, location: string) => void;
  uploading: boolean;
  uploadStatus: string | null;
  locations: string[];
};

export default function InventoryUploadModal({
  isOpen,
  onClose,
  onUpload,
  uploading,
  uploadStatus,
  locations,
}: UploadModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState(locations[0] || '');
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = () => {
    if (file) onUpload(file, selectedLocation);
  };

  // ✅ Close modal when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // ✅ Softer translucent background instead of black
      className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-[#00338d] mb-3">
          Upload Inventory File
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose a file to upload (.xls, .xlsx, or .csv) and assign it to a specific warehouse.
        </p>

        <div className="space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          {uploadStatus && (
            <p className="text-xs text-gray-600 italic">{uploadStatus}</p>
          )}
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            disabled={uploading}
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-md bg-[#007EA7] text-white hover:bg-[#006A90] transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

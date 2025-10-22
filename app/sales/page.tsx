'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Filter, Upload } from 'lucide-react';

export default function SalesPage() {
  const [filters, setFilters] = useState({
    customer: 'All',
    productType: 'All',
    fragrance: 'All',
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // --- Fake Sales Data (only finished goods) ---
  const sales = [
    {
      id: 1,
      product: 'Sea Salt Citrus Body Oil',
      fragrance: 'Sea Salt Citrus',
      quantity: 480,
      totalSales: 48000,
    },
    {
      id: 2,
      product: 'Lavender Hand Cream',
      fragrance: 'Lavender',
      quantity: 320,
      totalSales: 19200,
    },
    {
      id: 3,
      product: 'Pomegranate Lotion',
      fragrance: 'Pomegranate',
      quantity: 220,
      totalSales: 15400,
    },
  ];

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalSales, 0);
  const avgOrderValue = (totalRevenue / sales.length).toFixed(2);
  const topProduct = sales.sort((a, b) => b.totalSales - a.totalSales)[0].product;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <LineChart className="w-6 h-6 text-[#00338d]" />
          <h1 className="text-2xl font-semibold text-[#00338d] tracking-tight">
            Sales
          </h1>
        </div>

        {/* Filters + Upload */}
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <Filter className="w-5 h-5 text-gray-500" />

          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3]"
            value={filters.productType}
            onChange={(e) => handleChange('productType', e.target.value)}
          >
            <option>All Product Types</option>
            <option>Body Oil</option>
            <option>Hand Cream</option>
            <option>Lotion</option>
          </select>

          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3]"
            value={filters.fragrance}
            onChange={(e) => handleChange('fragrance', e.target.value)}
          >
            <option>All Fragrances</option>
            <option>Sea Salt Citrus</option>
            <option>Lavender</option>
            <option>Pomegranate</option>
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#007EA7] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#006A90] transition"
          >
            <Upload className="w-4 h-4" />
            Upload Sales
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Average Order Value', value: `$${avgOrderValue}` },
          { label: 'Top Product', value: topProduct },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold text-[#00338d] mt-1 truncate">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Fragrance</th>
              <th className="py-3 px-4 text-right">Quantity Sold</th>
              <th className="py-3 px-4 text-right">Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr
                key={s.id}
                className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
              >
                <td className="py-3 px-4 font-medium">{s.product}</td>
                <td className="py-3 px-4 text-gray-600">{s.fragrance}</td>
                <td className="py-3 px-4 text-right">{s.quantity}</td>
                <td className="py-3 px-4 text-right font-semibold text-[#007EA7]">
                  ${s.totalSales.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md"
            >
              <h2 className="text-lg font-semibold text-[#00338d] mb-3">
                Upload Sales Data
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Choose a sales file to upload (.csv or .xlsx).  
                This will overwrite or append new finished goods sales.
              </p>

              <div className="space-y-4">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Uploading sales file...');
                    setShowUploadModal(false);
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-[#007EA7] text-white hover:bg-[#006A90]"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

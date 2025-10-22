'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Filter, Upload, ChevronDown, ChevronRight } from 'lucide-react';

export default function InventoryPage() {
  // --- Filter and UI state ---
  const [filters, setFilters] = useState({
    type: 'All',
    component: 'All',
    status: 'All',
  });
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Main Warehouse');

  const handleChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // --- Fake warehouse and inventory data ---
  const locations = ['Main Warehouse', 'East Coast', 'West Coast'];
  const inventory = [
    {
      id: 1,
      name: 'Sea Salt Citrus Body Oil',
      sku: 'SS-BO-001',
      type: 'Finished Product',
      component: 'Bottle 4oz',
      totalStock: 245,
      reorderPoint: 80,
      byLocation: {
        'Main Warehouse': 120,
        'East Coast': 85,
        'West Coast': 40,
      },
    },
    {
      id: 2,
      name: 'Lavender Hand Cream',
      sku: 'LV-HC-002',
      type: 'Finished Product',
      component: 'Tube 2oz',
      totalStock: 32,
      reorderPoint: 50,
      byLocation: {
        'Main Warehouse': 10,
        'East Coast': 12,
        'West Coast': 10,
      },
    },
  ];

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const lowStock = inventory.filter((i) => i.totalStock <= i.reorderPoint);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Boxes className="w-6 h-6 text-[#00338d]" />
          <h1 className="text-2xl font-semibold text-[#00338d] tracking-tight">
            Inventory
          </h1>
        </div>

        {/* Filters + Upload */}
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3]"
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option>All Types</option>
            <option>Finished Product</option>
            <option>Component</option>
          </select>
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3]"
            value={filters.component}
            onChange={(e) => handleChange('component', e.target.value)}
          >
            <option>All Components</option>
            <option>Raw Material</option>
            <option>Packaging</option>
          </select>
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3]"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option>All Statuses</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#007EA7] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#006A90] transition"
          >
            <Upload className="w-4 h-4" />
            Upload Inventory
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total SKUs', value: inventory.length },
          { label: 'Low Stock Items', value: lowStock.length },
          { label: 'Locations', value: locations.length },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold text-[#00338d] mt-1">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold">
            <tr>
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Component</th>
              <th className="py-3 px-4 text-right">Stock</th>
              <th className="py-3 px-4 text-right">Reorder Point</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const isLow = item.totalStock <= item.reorderPoint;
              const expanded = expandedRows[item.id];
              return (
                <>
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
                  >
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleRow(item.id)}>
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-gray-500">{item.sku}</td>
                    <td className="py-3 px-4">{item.type}</td>
                    <td className="py-3 px-4">{item.component}</td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        isLow ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {item.totalStock}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {item.reorderPoint}
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#F6F9FB]"
                      >
                        <td></td>
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {Object.entries(item.byLocation).map(
                              ([loc, qty]) => (
                                <div
                                  key={loc}
                                  className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm flex justify-between items-center"
                                >
                                  <span className="text-gray-700">{loc}</span>
                                  <span
                                    className={`font-semibold ${
                                      qty <= item.reorderPoint / 3
                                        ? 'text-red-600'
                                        : 'text-emerald-700'
                                    }`}
                                  >
                                    {qty}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              );
            })}
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
                Upload Inventory File
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Choose a file to upload and assign it to a specific warehouse.
              </p>

              <div className="space-y-4">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
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
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Uploading to:', selectedLocation);
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

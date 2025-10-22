'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Package, Plus, Filter } from 'lucide-react';

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    productType: 'All',
    fragrance: 'All',
    status: 'All',
  });

  const handleChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Sample fake product data
  const products = [
    {
      id: 1,
      name: 'Sea Salt Citrus Body Oil',
      sku: 'SS-BO-001',
      type: 'Body Oil',
      fragrance: 'Sea Salt Citrus',
      stock: 122,
      lowStock: false,
      image: '/images/products/sea-salt-citrus.png',
    },
    {
      id: 2,
      name: 'Lavender Hand Cream',
      sku: 'LV-HC-002',
      type: 'Hand Cream',
      fragrance: 'Lavender',
      stock: 18,
      lowStock: true,
      image: '/images/products/lavender.png',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-[#00338d]" />
          <h1 className="text-2xl font-semibold text-[#00338d] tracking-tight">
            Products
          </h1>
        </div>

        {/* Top right controls */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3] focus:outline-none"
            value={filters.productType}
            onChange={(e) => handleChange('productType', e.target.value)}
          >
            <option>All Types</option>
            <option>Body Oil</option>
            <option>Lotion</option>
            <option>Candle</option>
          </select>
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3] focus:outline-none"
            value={filters.fragrance}
            onChange={(e) => handleChange('fragrance', e.target.value)}
          >
            <option>All Fragrances</option>
            <option>Sea Salt Citrus</option>
            <option>Lavender</option>
            <option>Pomegranate</option>
          </select>
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3] focus:outline-none"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option>All Statuses</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>

          <button className="flex items-center gap-2 bg-[#007EA7] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#006A90] transition">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: 142 },
          { label: 'Low Stock Items', value: 6 },
          { label: 'Out of Stock', value: 2 },
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

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Fragrance</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
              >
                <td className="py-3 px-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 object-contain rounded-md border border-gray-100"
                  />
                </td>
                <td className="py-3 px-4 font-medium">{p.name}</td>
                <td className="py-3 px-4 text-gray-500">{p.sku}</td>
                <td className="py-3 px-4">{p.type}</td>
                <td className="py-3 px-4">{p.fragrance}</td>
                <td
                  className={`py-3 px-4 font-semibold ${
                    p.lowStock ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {p.stock}
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-[#007EA7] hover:underline text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

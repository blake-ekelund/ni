'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    product: 'All',
    fragrance: 'All',
    productType: 'All',
  });

  const handleChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-semibold text-[#00338d] tracking-tight">
          Dashboard Overview
        </h1>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3] focus:outline-none"
            value={filters.product}
            onChange={(e) => handleChange('product', e.target.value)}
          >
            <option>All Products</option>
            <option>Body Oil</option>
            <option>Lotion</option>
            <option>Scrub</option>
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
            value={filters.productType}
            onChange={(e) => handleChange('productType', e.target.value)}
          >
            <option>All Types</option>
            <option>Retail</option>
            <option>Bulk</option>
            <option>Sampler</option>
          </select>
        </div>
      </div>

      {/* Sales Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-[#007EA7] mb-3">
          Sales Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['By Customer', 'By Rep Group', 'By Product', 'By Product Type', 'By Fragrance'].map(
            (metric) => (
              <div
                key={metric}
                className="p-4 rounded-xl border border-gray-100 bg-[#F6F9FB] text-gray-700 text-sm hover:shadow-md transition-all"
              >
                <div className="font-semibold text-[#00338d]">{metric}</div>
                <div className="mt-2 text-gray-500">Chart placeholder...</div>
              </div>
            )
          )}
        </div>
      </motion.section>

      {/* Inventory Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-[#007EA7] mb-3">
          Inventory Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['By Product', 'By Product Type', 'By Components'].map((metric) => (
            <div
              key={metric}
              className="p-4 rounded-xl border border-gray-100 bg-[#F6F9FB] text-gray-700 text-sm hover:shadow-md transition-all"
            >
              <div className="font-semibold text-[#00338d]">{metric}</div>
              <div className="mt-2 text-gray-500">Chart placeholder...</div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

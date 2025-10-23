'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────
// Types
// ─────────────────────────────
interface ProductRecord {
  id: string;
  part: string;
  description: string | null;
  product: string | null;
  fragrance: string | null;
  size: string | null;
  type: string | null;
  other: string | null;
  bom: string | null;
  status: 'Active' | 'Inactive';
  created_at?: string;
}

interface Filters {
  product: string;
  fragrance: string;
  type: string;
  status: string;
}

type NewProductForm = Omit<ProductRecord, 'id' | 'created_at'>;

// ─────────────────────────────
// Component
// ─────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = React.useState<ProductRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const [filters, setFilters] = React.useState<Filters>({
    product: 'All',
    fragrance: 'All',
    type: 'All',
    status: 'All',
  });

  const [newProduct, setNewProduct] = React.useState<NewProductForm>({
    part: '',
    description: '',
    product: '',
    fragrance: '',
    size: '',
    type: '',
    other: '',
    bom: '',
    status: 'Active',
  });

  // sorting state
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'part', direction: 'asc' });

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const SortHeader = ({
    label,
    sortKey,
    alignRight,
  }: {
    label: string;
    sortKey: string;
    alignRight?: boolean;
  }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`flex items-center gap-1 ${
        alignRight ? 'justify-end' : ''
      } text-[#00338d] hover:text-[#007EA7]`}
    >
      {label}
      <ArrowUpDown className="w-3 h-3 opacity-60" />
    </button>
  );

  // ✅ Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(
        'id, part, description, product, fragrance, size, type, other, bom, status, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) console.error('❌ Supabase fetch error:', error);
    else setProducts((data as ProductRecord[]) ?? []);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Filtered + Sorted view
  const filteredProducts = React.useMemo(() => {
    const base = products.filter((p) => {
      const matchProduct =
        filters.product === 'All' || p.product === filters.product;
      const matchFragrance =
        filters.fragrance === 'All' || p.fragrance === filters.fragrance;
      const matchType = filters.type === 'All' || p.type === filters.type;
      const matchStatus =
        filters.status === 'All' || p.status === filters.status;
      return matchProduct && matchFragrance && matchType && matchStatus;
    });

    const { key, direction } = sortConfig;
    return [...base].sort((a, b) => {
      const valA = (a as any)[key];
      const valB = (b as any)[key];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return direction === 'asc' ? numA - numB : numB - numA;
    });
  }, [products, filters, sortConfig]);

  // ✅ Add new product
  const handleAddProduct = async () => {
    if (!newProduct.part.trim()) {
      alert('Part number is required.');
      return;
    }

    const { error } = await supabase.from('products').insert([newProduct]);

    if (error) {
      alert(`❌ Error adding product: ${error.message}`);
    } else {
      alert('✅ Product added successfully.');
      setShowAddModal(false);
      setNewProduct({
        part: '',
        description: '',
        product: '',
        fragrance: '',
        size: '',
        type: '',
        other: '',
        bom: '',
        status: 'Active',
      });
      fetchProducts();
    }
  };

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
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

        {/* Filters + Add Button */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Filter className="w-5 h-5 text-gray-500" />
          {(['product', 'fragrance', 'type', 'status'] as (keyof Filters)[]).map(
            (key) => (
              <select
                key={key}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-[#5EC3E3] focus:outline-none"
                value={filters[key]}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                }
              >
                <option>All</option>
                {key === 'status' ? (
                  <>
                    <option>Active</option>
                    <option>Inactive</option>
                  </>
                ) : (
                  [...new Set(products.map((p) => p[key]).filter(Boolean))].map(
                    (val) => (
                      <option key={String(val)}>{String(val)}</option>
                    )
                  )
                )}
              </select>
            )
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#007EA7] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#006A90] transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="p-6 text-gray-500 text-center">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F6F9FB] text-[#00338d] text-left font-semibold">
              <tr>
                <th className="py-3 px-4">
                  <SortHeader label="SKU" sortKey="part" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="Product" sortKey="product" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="Type" sortKey="type" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="Fragrance" sortKey="fragrance" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="Size" sortKey="size" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="Other" sortKey="other" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="BOM" sortKey="bom" />
                </th>
                <th className="py-3 px-4">
                  <SortHeader label="Status" sortKey="status" />
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-100 hover:bg-[#F6F9FB] transition"
                >
                  <td className="py-3 px-4 font-medium">{p.part}</td>
                  <td className="py-3 px-4">{p.product}</td>
                  <td className="py-3 px-4">{p.type}</td>
                  <td className="py-3 px-4">{p.fragrance}</td>
                  <td className="py-3 px-4">{p.size}</td>
                  <td className="py-3 px-4">{p.other}</td>
                  <td className="py-3 px-4">{p.bom}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${
                      p.status === 'Active'
                        ? 'text-green-700'
                        : 'text-red-600'
                    }`}
                  >
                    {p.status}
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
        )}
      </motion.div>

      {/* Add Product Modal (unchanged) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-semibold text-[#00338d] mb-4">
              Add Product
            </h2>
            <div className="space-y-3">
              {(
                [
                  'part',
                  'description',
                  'product',
                  'type',
                  'fragrance',
                  'size',
                  'other',
                  'bom',
                ] as (keyof NewProductForm)[]
              ).map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={
                    field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={newProduct[field] ?? ''}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              ))}

              <select
                value={newProduct.status}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    status: e.target.value as 'Active' | 'Inactive',
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 text-sm rounded-md bg-[#007EA7] text-white hover:bg-[#006A90] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

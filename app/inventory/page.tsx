'use client';

import * as React from 'react';
import { Boxes, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import InventoryTable, { InventoryRow, PivotRow } from './components/InventoryTable';
import InventoryFilters from './components/InventoryFilters';
import InventoryUploadModal from './components/InventoryUploadModal';

export default function InventoryPage() {
  const [inventory, setInventory] = React.useState<InventoryRow[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState('All');
  const [loading, setLoading] = React.useState(true);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);

  // ✅ Fetch inventory data from Supabase
  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_data')
      .select('id, part, description, available, location')
      .order('uploaded_at', { ascending: false });

    if (error) console.error('Supabase fetch error:', error);
    else setInventory(data ?? []);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchInventory();
  }, []);

  // ✅ Collect unique warehouse locations
  const locations: string[] = Array.from(
    new Set(
      inventory
        .map((i) => i.location)
        .filter((loc): loc is string => Boolean(loc))
    )
  );

  // ✅ Build pivoted structure: one row per part, columns for each location
  const buildPivotData = (rows: InventoryRow[], locs: string[]): PivotRow[] => {
    const map = new Map<string, PivotRow>();

    for (const row of rows) {
      if (!map.has(row.part)) {
        map.set(row.part, {
          id: row.id,
          part: row.part,
          description: row.description,
          Total: 0,
          ...Object.fromEntries(locs.map((l) => [l, 0])),
        });
      }

      const item = map.get(row.part)!;

      if (row.location && locs.includes(row.location)) {
        const qty = Number(row.available) || 0; // ensure numeric
        item[row.location] = qty;
        item.Total += qty;
      }
    }

    return Array.from(map.values());
  };

  const pivotedInventory: PivotRow[] = buildPivotData(inventory, locations);

  // ✅ Determine which location columns to show
  const visibleLocations =
    selectedFilter === 'All'
      ? locations
      : [selectedFilter]; // show only the selected location

  // ✅ Handle file upload
  const handleUpload = async (file: File, location: string) => {
    setUploading(true);
    setUploadStatus('⏳ Uploading and processing file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('location', location);

      const res = await fetch('/api/upload-inventory', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.error) alert(`❌ Upload failed: ${result.error}`);
      else alert(`✅ Uploaded successfully: ${result.inserted || 0} rows`);

      await fetchInventory();
    } catch (err) {
      console.error(err);
      alert('❌ Upload failed due to network or server error.');
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setUploadStatus(null);
    }
  };

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

        <div className="flex items-center gap-3">
          <InventoryFilters
            locations={['All', ...locations]}
            selected={selectedFilter}
            onChange={(loc) => setSelectedFilter(loc)}
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#007EA7] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#006A90] transition"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Pivoted Inventory Table */}
      <InventoryTable
        loading={loading}
        inventory={pivotedInventory}
        locations={visibleLocations}
      />

      {/* Upload Modal */}
      <InventoryUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
        uploadStatus={uploadStatus}
        locations={['Point B Solutions', 'Kapra']}
      />
    </div>
  );
}

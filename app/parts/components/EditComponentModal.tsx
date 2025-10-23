'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X } from 'lucide-react';
import { ComponentRecord } from "./types";

// Define modal props
interface EditComponentModalProps {
  component: ComponentRecord;
  onClose: () => void;
  onSaveSuccess: (updated: ComponentRecord) => void;
}

export function EditComponentModal({
  component,
  onClose,
  onSaveSuccess,
}: EditComponentModalProps) {
  const [form, setForm] = useState<Omit<
    ComponentRecord,
    'id' | 'component' | 'description'
  >>({
    lead_time_days: component.lead_time_days || 0,
    min_stock: component.min_stock || 0,
    max_stock: component.max_stock || 0,
    min_order_qty: component.min_order_qty || 0,
  });

  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Close modal when user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // ✅ Format numbers while typing
  const formatNumber = (value: number | string): string => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = String(value).replace(/\D/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumber = (value: string): number =>
    Number(value.replace(/,/g, '')) || 0;

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: parseNumber(value),
    }));
  };

  // ✅ Save to Supabase and update parent
  const handleSave = async () => {
    setSaving(true);

    // Supabase generics: from<TableName extends string, RowType>
    const { data, error } = await supabase
      .from('components')
      .update(form)
      .eq('id', component.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert(`❌ Error updating component: ${error.message}`);
    } else if (data) {
      onSaveSuccess({ ...component, ...data });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 border border-gray-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#00338d]">
            Edit Component – {component.component}
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700 w-5 h-5" />
          </button>
        </div>

        {/* Editable Fields */}
        <div className="space-y-3">
          {([
            { key: 'lead_time_days', label: 'Lead Time (Days)', format: false },
            { key: 'min_stock', label: 'Minimum Stock', format: true },
            { key: 'max_stock', label: 'Maximum Stock', format: true },
            { key: 'min_order_qty', label: 'Minimum Order Quantity', format: true },
          ] as const).map(({ key, label, format }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={
                  format
                    ? formatNumber(form[key] ?? '')
                    : String(form[key] ?? '')
                }
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#007EA7] focus:ring-1 focus:ring-[#007EA7]"
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-sm rounded-md text-white ${
              saving ? 'bg-gray-400' : 'bg-[#007EA7] hover:bg-[#006A90]'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

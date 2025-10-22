'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  Plug,
  Palette,
  CreditCard,
  Database,
  Settings as SettingsIcon,
} from 'lucide-react';

const tabs = [
  { id: 'company', name: 'Company Profile', icon: Building2 },
  { id: 'users', name: 'Users & Roles', icon: Users },
  { id: 'integrations', name: 'Integrations', icon: Plug },
  { id: 'branding', name: 'Branding', icon: Palette },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'data', name: 'Data Management', icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');

  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#00338d]">Company Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Natural Inspirations"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="info@naturalinspirations.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button className="mt-4 bg-[#007EA7] text-white px-4 py-2 rounded-md text-sm hover:bg-[#006A90] transition">
              Save Changes
            </button>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#00338d]">Users & Roles</h2>
            <p className="text-sm text-gray-500">
              Invite team members and manage their access.
            </p>
            <button className="bg-[#007EA7] text-white px-3 py-2 rounded-md text-sm hover:bg-[#006A90] transition">
              + Invite User
            </button>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <h2 className="text-lg font-semibold text-[#00338d]">Integrations</h2>
            <p className="text-sm text-gray-500 mt-2">Connect external tools like QuickBooks, Google Sheets, or Shopify.</p>
          </div>
        );

      case 'branding':
        return (
          <div>
            <h2 className="text-lg font-semibold text-[#00338d]">Branding</h2>
            <p className="text-sm text-gray-500 mt-2">Customize your dashboard colors and logo.</p>
          </div>
        );

      case 'billing':
        return (
          <div>
            <h2 className="text-lg font-semibold text-[#00338d]">Billing & Subscription</h2>
            <p className="text-sm text-gray-500 mt-2">Manage your plan, payment method, and invoices.</p>
          </div>
        );

      case 'data':
        return (
          <div>
            <h2 className="text-lg font-semibold text-[#00338d]">Data Management</h2>
            <p className="text-sm text-gray-500 mt-2">
              Export your sales, inventory, and product data or perform a backup.
            </p>
            <button className="mt-3 text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50">
              Export All Data
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-[#00338d]" />
        <h1 className="text-2xl font-semibold text-[#00338d] tracking-tight">
          Settings
        </h1>
      </div>

      {/* Layout */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full sm:w-60 bg-white border border-gray-100 rounded-xl shadow-sm p-3">
          {tabs.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md mb-1 transition ${
                activeTab === id
                  ? 'bg-[#F6F9FB] text-[#00338d] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {name}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-6"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

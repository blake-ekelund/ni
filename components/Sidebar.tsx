'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  LineChart,
  Settings,
  HelpCircle,
  LogOut,
  Component,
} from 'lucide-react';

// Brand-inspired palette from the image
const colors = {
  blue: '#5EC3E3', // ocean tone
  darkBlue: '#007EA7',
  lightGray: '#F6F9FB',
  white: '#FFFFFF',
};

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Components', href: '/parts', icon: Component },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Boxes },
  { name: 'Sales', href: '/sales', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Collaborate', href: '/collaborate', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 h-screen flex flex-col justify-between bg-white border-r border-gray-200 shadow-sm"
      style={{ backgroundColor: colors.white }}
    >
      {/* Top Section */}
      <div>
        <div
          className="p-5 text-xl font-semibold tracking-tight"
          style={{ color: colors.darkBlue }}
        >
          Natural Inspirations
        </div>
        <div className="mx-5 mb-3 border-t" style={{ borderColor: colors.lightGray }} />

        {/* Navigation */}
        <nav className="flex flex-col">
          {navItems.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={name} href={href} className="relative group">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: active ? colors.lightGray : 'transparent',
                    color: active ? colors.darkBlue : '#55565A',
                  }}
                  whileHover={{ backgroundColor: colors.lightGray }}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-lg mx-2 mb-1 cursor-pointer transition-colors"
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? 'text-emerald-700' : 'text-gray-500'
                    } group-hover:text-emerald-700 transition-colors`}
                  />
                  <span className="text-sm font-medium">{name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-5 border-t border-gray-100">
        <button
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition"
          onClick={() => console.log('Log out clicked')}
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

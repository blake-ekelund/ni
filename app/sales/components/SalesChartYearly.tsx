'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { month_name: string; current_year_sales: number; prior_year_sales: number }[];
  currentYear: number;
  priorYear: number;
}

export default function SalesChartYearly({ data, currentYear, priorYear }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-semibold text-[#00338d] mb-3">
        Sales by Month ({currentYear} vs {priorYear})
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }} // ✅ added padding
          >
          <XAxis dataKey="month_name" />
          <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="current_year_sales" name={`${currentYear}`} fill="#007EA7" radius={[4, 4, 0, 0]} />
          <Bar dataKey="prior_year_sales" name={`${priorYear}`} fill="#3BA55D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

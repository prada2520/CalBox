import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostBreakdown, ProductionSpecs } from '../types';

interface ResultsChartProps {
  data: CostBreakdown;
  production: ProductionSpecs;
}

const CATEGORY_COLORS: Record<string, string> = {
  'กระดาษ/วัสดุ': '#F59E0B', // Amber
  'งานพิมพ์': '#3B82F6',    // Blue
  'งานเคลือบ/ตกแต่ง': '#A855F7', // Purple
  'งานไดคัท/ปะกาว': '#F43F5E', // Rose
  'บรรจุภัณฑ์/คงที่': '#64748B', // Slate
  'กำไร (Profit)': '#10B981', // Emerald
};

const ResultsChart: React.FC<ResultsChartProps> = ({ data, production }) => {
  if (!data || !production) {
    return (
      <div className="h-60 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg text-xs">
        กรอกข้อมูลเพื่อแสดงกราฟแจกแจง
      </div>
    );
  }

  const qty = Math.max(1, production.quantity || 1);

  const chartData = [
    {
      name: 'กระดาษ/วัสดุ',
      value: Number((data.materialCostPerUnit ?? 0).toFixed(2)),
      color: CATEGORY_COLORS['กระดาษ/วัสดุ'],
    },
    {
      name: 'งานพิมพ์',
      value: Number((((data.printingFixedCost ?? 0) / qty) + (data.printingCostPerUnit ?? 0)).toFixed(2)),
      color: CATEGORY_COLORS['งานพิมพ์'],
    },
    {
      name: 'งานเคลือบ/ตกแต่ง',
      value: Number((((data.finishingFixedCost ?? 0) / qty) + (data.finishingCostPerUnit ?? 0)).toFixed(2)),
      color: CATEGORY_COLORS['งานเคลือบ/ตกแต่ง'],
    },
    {
      name: 'งานไดคัท/ปะกาว',
      value: Number((((data.convertingFixedCost ?? 0) / qty) + (data.convertingCostPerUnit ?? 0)).toFixed(2)),
      color: CATEGORY_COLORS['งานไดคัท/ปะกาว'],
    },
    {
      name: 'บรรจุภัณฑ์/คงที่',
      value: Number((((data.otherFixedCost ?? 0) / qty) + (data.packagingCostPerUnit ?? 0)).toFixed(2)),
      color: CATEGORY_COLORS['บรรจุภัณฑ์/คงที่'],
    },
    {
      name: 'กำไร (Profit)',
      value: Number(((data.sellingPricePerUnit ?? 0) - (data.totalCostPerUnit ?? 0)).toFixed(2)),
      color: CATEGORY_COLORS['กำไร (Profit)'],
    },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg text-xs">
        กรอกข้อมูลเพื่อแสดงกราฟแจกแจง
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} บาท/ใบ`, 'สัดส่วน']}
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              borderRadius: '10px',
              color: '#F8FAFC',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;

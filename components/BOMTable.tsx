import React, { useState } from 'react';
import { BOMItem } from '../types';
import { Layers, Filter, CheckCircle2, Sliders, Search, X } from 'lucide-react';

interface BOMTableProps {
  items: BOMItem[];
  quantity: number;
  totalCostPerUnit: number;
  totalOrderCost: number;
}

const BOMTable: React.FC<BOMTableProps> = ({
  items,
  quantity,
  totalCostPerUnit,
  totalOrderCost,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = items.filter((item) => {
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      (item.detail && item.detail.toLowerCase().includes(q)) ||
      item.type.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'material':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'printing':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'finishing':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'converting':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 text-white">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              ตารางแจกแจงรายการต้นทุน BOM ละเอียด (BOM Items Breakdown)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              แจกแจงต้นทุนคงที่ (Fixed) และผันแปร (Variable) • ค้นหาและกรองได้ทันที
            </p>
          </div>
        </div>

        {/* Filter Controls (Search + Category) */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารายการ BOM..."
              className="text-xs bg-[#161f36] border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs font-bold border border-slate-700 rounded-lg py-1.5 px-2.5 text-slate-200 bg-[#161f36] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
            >
              <option value="all">ทุกหมวด ({items.length})</option>
              <option value="material">เฉพาะกระดาษ/วัสดุ</option>
              <option value="printing">เฉพาะงานพิมพ์</option>
              <option value="finishing">เฉพาะงานเคลือบ/ตกแต่ง</option>
              <option value="converting">เฉพาะงานไดคัท/ปะกาว</option>
              <option value="fixed_costs">เฉพาะค่าเตรียมงาน/คงที่</option>
            </select>
          </div>
        </div>
      </div>

      {/* Locked Header Scrollable Table Container */}
      <div className="max-h-[480px] overflow-y-auto overflow-x-auto rounded-xl border border-slate-800 shadow-inner bg-[#0b0f19]/80">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Locked Header with Solid Contrast */}
          <thead className="sticky top-0 z-10 bg-[#151c2e] text-slate-200 font-bold border-b border-slate-800 shadow-md">
            <tr>
              <th className="py-3 px-3 border-r border-slate-800 text-center w-12">ลำดับ</th>
              <th className="py-3 px-3 border-r border-slate-800 w-36 text-center">หมวดหมู่</th>
              <th className="py-3 px-3 border-r border-slate-800">รายการองค์ประกอบ (BOM Component)</th>
              <th className="py-3 px-2 border-r border-slate-800 text-center w-24">ประเภท</th>
              <th className="py-3 px-3 border-r border-slate-800 text-right w-36">ต้นทุน/ใบ (บาท)</th>
              <th className="py-3 px-3 border-r border-slate-800 text-right w-36">ยอดรวม (บาท)</th>
              <th className="py-3 px-3 text-right w-32">สัดส่วน (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-medium text-slate-300">
            {filteredItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-800 bg-[#0d1220]/50 font-mono">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-800 text-center whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(item.category)}`}>
                    {item.categoryLabel}
                  </span>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-800">
                  <div className="font-bold text-slate-200">{item.name}</div>
                  {item.detail && <div className="text-[11px] text-slate-400 mt-0.5">{item.detail}</div>}
                </td>
                <td className="py-2.5 px-2 border-r border-slate-800 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.type === 'fixed'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.type === 'fixed' ? 'Fixed' : 'Variable'}
                  </span>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-800 text-right font-mono font-bold text-white">
                  {item.costPerUnit.toFixed(3)} ฿
                </td>
                <td className="py-2.5 px-3 border-r border-slate-800 text-right font-mono text-slate-300">
                  {item.totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono font-bold text-slate-300 text-xs">{item.percentageOfTotal.toFixed(1)}%</span>
                    <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, item.percentageOfTotal)}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Table Footer with Summary */}
          <tfoot className="sticky bottom-0 z-10 bg-[#151c2e] text-white font-bold border-t border-slate-700 shadow-md">
            <tr>
              <td colSpan={4} className="py-3 px-3 text-right border-r border-slate-800 text-xs">
                รวมต้นทุนสุทธิ (Total Net Cost) ที่ {quantity.toLocaleString()} ใบ:
              </td>
              <td className="py-3 px-3 text-right border-r border-slate-800 font-mono text-sm font-black text-emerald-400">
                {totalCostPerUnit.toFixed(2)} ฿
              </td>
              <td className="py-3 px-3 text-right border-r border-slate-800 font-mono text-sm font-black text-emerald-400">
                {totalOrderCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs font-bold text-slate-300">
                100.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BOMTable;

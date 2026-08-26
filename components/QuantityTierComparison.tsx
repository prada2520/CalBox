import React from 'react';
import { QuantityTier } from '../types';
import { TrendingUp, CheckCircle2, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';

interface QuantityTierComparisonProps {
  tiers: QuantityTier[];
  currentQuantity: number;
  onSelectQuantity: (qty: number) => void;
}

const QuantityTierComparison: React.FC<QuantityTierComparisonProps> = ({
  tiers,
  currentQuantity,
  onSelectQuantity,
}) => {
  return (
    <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              ตารางเปรียบเทียบระดับยอดสั่งผลิต (Volume Tier Pricing Matrix)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              แสดงการประหยัดจากขนาด (Economies of Scale) • คลิกที่แถวเพื่อเปลี่ยนจำนวนผลิตทันที
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 self-start sm:self-auto">
          กำลังคำนวณที่: <strong className="font-mono text-white">{currentQuantity.toLocaleString()}</strong> ใบ
        </div>
      </div>

      {/* Locked Header Scrollable Table Container */}
      <div className="max-h-[480px] overflow-y-auto overflow-x-auto rounded-xl border border-slate-800 shadow-inner bg-[#0b0f19]/80">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Header with Solid Contrast */}
          <thead className="sticky top-0 z-10 bg-[#151c2e] text-slate-200 font-bold border-b border-slate-800 shadow-md">
            <tr>
              <th className="py-3 px-4 border-r border-slate-800 text-left">จำนวนสั่งผลิต (ใบ)</th>
              <th className="py-3 px-3 border-r border-slate-800 text-right">ค่าเตรียมพิมพ์/บล็อก/ใบ</th>
              <th className="py-3 px-3 border-r border-slate-800 text-right">ต้นทุนสุทธิ/ใบ</th>
              <th className="py-3 px-4 border-r border-slate-800 text-right">ราคาขายเสนอ/ใบ</th>
              <th className="py-3 px-4 border-r border-slate-800 text-right">ยอดรวมทั้งออเดอร์</th>
              <th className="py-3 px-3 border-r border-slate-800 text-center">ประหยัด (%)</th>
              <th className="py-3 px-3 text-center w-28">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-medium text-slate-300">
            {tiers.map((tier) => {
              const isSelected = tier.quantity === currentQuantity;
              return (
                <tr
                  key={tier.quantity}
                  onClick={() => onSelectQuantity(tier.quantity)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-900/30 text-white font-bold ring-1 ring-inset ring-blue-500/50'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Quantity */}
                  <td className="py-3 px-4 border-r border-slate-800">
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-600 inline-block shrink-0" />
                      )}
                      <span className="font-mono text-sm font-bold text-white">
                        {tier.quantity.toLocaleString()} ใบ
                      </span>
                    </div>
                  </td>

                  {/* Fixed Cost Per Unit */}
                  <td className="py-3 px-3 border-r border-slate-800 text-right font-mono text-slate-400">
                    {(tier.fixedCostPerUnit ?? 0).toFixed(2)} ฿
                  </td>

                  {/* Unit Cost */}
                  <td className="py-3 px-3 border-r border-slate-800 text-right font-mono font-bold text-slate-200">
                    {(tier.unitCost ?? tier.totalCostPerUnit ?? 0).toFixed(2)} ฿
                  </td>

                  {/* Selling Price */}
                  <td className="py-3 px-4 border-r border-slate-800 text-right">
                    <span className="font-mono text-sm font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {(tier.sellingPricePerUnit ?? tier.suggestedPricePerUnit ?? 0).toFixed(2)} ฿
                    </span>
                  </td>

                  {/* Total Value */}
                  <td className="py-3 px-4 border-r border-slate-800 text-right font-mono font-bold text-white">
                    {(tier.totalOrderValue ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                  </td>

                  {/* Savings % */}
                  <td className="py-3 px-3 border-r border-slate-800 text-center">
                    {tier.savingsPercentVsLowest !== undefined && tier.savingsPercentVsLowest > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        ลดลง {tier.savingsPercentVsLowest}%
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3 px-3 text-center">
                    {isSelected ? (
                      <span className="inline-block py-1 px-2.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-xs">
                        กำลังเลือก
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuantity(tier.quantity);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition-colors"
                      >
                        เลือกยอดนี้
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuantityTierComparison;

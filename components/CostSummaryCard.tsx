import React from 'react';
import { CostBreakdown, ProductionSpecs } from '../types';
import { FileDown, Sparkles, DollarSign, ArrowUpRight, TrendingUp, Layers, CheckCircle2, BookmarkPlus } from 'lucide-react';

interface CostSummaryCardProps {
  result: CostBreakdown;
  production: ProductionSpecs;
  onChangeQuantity: (qty: number) => void;
  onOpenQuotation: () => void;
  onOpenSaveRevision: () => void;
}

const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  result,
  production,
  onChangeQuantity,
  onOpenQuotation,
  onOpenSaveRevision,
}) => {
  const quickQuantities = [1000, 3000, 5000, 10000, 20000, 50000];

  const totalCost = Math.max(0.0001, result?.totalCostPerUnit || 1);
  const qty = Math.max(1, production?.quantity || 1);
  const materialPct = (((result?.materialCostPerUnit ?? 0) / totalCost) * 100).toFixed(1);
  const printCostUnit = ((result?.printingFixedCost ?? 0) / qty) + (result?.printingCostPerUnit ?? 0);
  const printPct = ((printCostUnit / totalCost) * 100).toFixed(1);
  const finishCostUnit = ((result?.finishingFixedCost ?? 0) / qty) + (result?.finishingCostPerUnit ?? 0);
  const finishPct = ((finishCostUnit / totalCost) * 100).toFixed(1);
  const convertCostUnit = ((result?.convertingFixedCost ?? 0) / qty) + (result?.convertingCostPerUnit ?? 0);
  const convertPct = ((convertCostUnit / totalCost) * 100).toFixed(1);
  const fixedCostUnit = ((result?.otherFixedCost ?? 0) / qty) + (result?.packagingCostPerUnit ?? 0);
  const fixedPct = ((fixedCostUnit / totalCost) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-300 p-5 sm:p-6 space-y-6">
      
      {/* Top Hero Price Display: High-Contrast Executive Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border-2 border-slate-800 relative overflow-hidden">
        {/* Subtle Background Graphic */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <DollarSign className="w-36 h-36 text-white" />
        </div>

        <div className="relative z-10">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-amber-300 uppercase">
                ราคาขายเสนอแนะ (Suggested Selling Price)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-emerald-500 text-white px-3 py-1 rounded-full shadow-xs">
                กำไรเป้าหมาย +{production.markupPercent}% (Margin)
              </span>
            </div>
          </div>

          {/* Main Price Numbers */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {result.sellingPricePerUnit.toFixed(2)}
            </span>
            <span className="text-lg sm:text-xl font-bold text-slate-200">บาท / ใบ</span>
            <span className="text-xs sm:text-sm font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
              (ต้นทุนแท้จริง {(result?.totalCostPerUnit ?? 0).toFixed(2)} ฿ / กำไร {((result?.sellingPricePerUnit ?? 0) - (result?.totalCostPerUnit ?? 0)).toFixed(2)} ฿)
            </span>
          </div>

          {/* Quick Quantity Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-700/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                ⚡ สลับดูราคาตามจำนวนผลิตทันที (Quick Volume):
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-amber-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                ยอดคำนวณ: {production.quantity.toLocaleString()} ใบ
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickQuantities.map((q) => {
                const isCurrent = production.quantity === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onChangeQuantity(q)}
                    className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-mono font-black transition-all ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.03] border-2 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600'
                    }`}
                  >
                    {q.toLocaleString()} ใบ
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/80">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-300 text-xs font-bold block mb-1">
                💰 ยอดรวมทั้งออเดอร์ ({production.quantity.toLocaleString()} ใบ)
              </span>
              <span className="text-lg sm:text-xl font-black font-mono text-white">
                {result.totalOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
              <span className="text-emerald-300 text-xs font-bold block mb-1">
                📈 กำไรรวมทั้งออเดอร์ (Total Profit)
              </span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-5 h-5" />
                +{result.totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Cost Breakdown: Table with Clear Grid Lines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-700" />
            ตารางโครงสร้างต้นทุนเฉลี่ยต่อใบ (Unit Cost Breakdown Table)
          </h4>
          <span className="text-xs sm:text-sm font-mono font-black bg-slate-100 text-slate-900 px-3 py-1 rounded-lg border border-slate-300">
            ต้นทุนรวม: {result.totalCostPerUnit.toFixed(2)} บาท/ใบ
          </span>
        </div>

        {/* Full Grid Table */}
        <div className="overflow-x-auto rounded-xl border-2 border-slate-300 shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-900 font-extrabold border-b-2 border-slate-300">
              <tr>
                <th className="py-2.5 px-3 text-center border-r border-slate-300 w-12">ลำดับ</th>
                <th className="py-2.5 px-3 border-r border-slate-300">หมวดหมู่ต้นทุน</th>
                <th className="py-2.5 px-3 text-right border-r border-slate-300 w-32">ต้นทุนต่อใบ (บาท)</th>
                <th className="py-2.5 px-3 text-right border-r border-slate-300 w-28">สัดส่วน (%)</th>
                <th className="py-2.5 px-3 text-center w-28">ประเภท</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Row 1: Material */}
              <tr className="hover:bg-amber-50/50">
                <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50">1</td>
                <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>ค่ากระดาษกล่องแป้ง & วัตถุดิบ</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {result.materialCostPerUnit.toFixed(2)} ฿
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-amber-900 border-r border-slate-200">
                  {materialPct}%
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ผันแปร
                  </span>
                </td>
              </tr>

              {/* Row 2: Printing */}
              <tr className="hover:bg-blue-50/50">
                <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50">2</td>
                <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>ค่าพิมพ์ Offset & แม่พิมพ์เพลท</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {printCostUnit.toFixed(2)} ฿
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-slate-200">
                  {printPct}%
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    ผสม (Fix+Var)
                  </span>
                </td>
              </tr>

              {/* Row 3: Finishing */}
              <tr className="hover:bg-purple-50/50">
                <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50">3</td>
                <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span>ค่าเคลือบผิว & สเปเชียลเอฟเฟกต์</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {finishCostUnit.toFixed(2)} ฿
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-purple-900 border-r border-slate-200">
                  {finishPct}%
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    ผสม (Fix+Var)
                  </span>
                </td>
              </tr>

              {/* Row 4: Converting */}
              <tr className="hover:bg-rose-50/50">
                <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50">4</td>
                <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>ค่าปั๊มไดคัท & ปะกาวขึ้นรูป</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {convertCostUnit.toFixed(2)} ฿
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-rose-900 border-r border-slate-200">
                  {convertPct}%
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    ผสม (Fix+Var)
                  </span>
                </td>
              </tr>

              {/* Row 5: Packaging & Fixed */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50">5</td>
                <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span>ค่าบรรจุหีบห่อ & ค่าใช้จ่ายคงที่</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {fixedCostUnit.toFixed(2)} ฿
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 border-r border-slate-200">
                  {fixedPct}%
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    ผันแปร
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 text-slate-900 font-black border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 border-r border-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    รวมต้นทุนสุทธิต่อใบ (Total Unit Cost)
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-sm sm:text-base font-black text-indigo-900 border-r border-slate-300">
                  {result.totalCostPerUnit.toFixed(2)} ฿
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 border-r border-slate-300">
                  100.0%
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenSaveRevision}
          className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border-2 border-slate-300 shadow-xs"
        >
          <BookmarkPlus className="w-4 h-4 text-indigo-700" />
          <span>บันทึกเป็น Revision ใหม่</span>
        </button>

        <button
          type="button"
          onClick={onOpenQuotation}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <FileDown className="w-4 h-4" />
          <span>ออกใบเสนอราคา / พิมพ์ PDF</span>
        </button>
      </div>

    </div>
  );
};

export default CostSummaryCard;

import React from 'react';
import {
  Sparkles,
  Layers,
  FileDown,
  FileSpreadsheet,
  Save,
  Package,
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CostBreakdown, ProductionSpecs } from '../types';

interface FloatingCostCockpitProps {
  result: CostBreakdown;
  production: ProductionSpecs;
  onChangeQuantity: (qty: number) => void;
  onChangeMarkup: (markup: number) => void;
  onOpenQuotation: () => void;
  onOpenSaveRevision: () => void;
  onDirectExportExcel: () => void;
}

const FloatingCostCockpit: React.FC<FloatingCostCockpitProps> = ({
  result,
  production,
  onChangeQuantity,
  onChangeMarkup,
  onOpenQuotation,
  onOpenSaveRevision,
  onDirectExportExcel,
}) => {
  const quickQuantities = [1000, 3000, 5000, 10000, 20000, 50000];
  const quickMarkups = [15, 20, 25, 28, 30, 35];

  const unitCost = result?.totalCostPerUnit ?? 0;
  const sellingPrice = result?.sellingPricePerUnit ?? 0;
  const unitProfit = sellingPrice - unitCost;
  const quantity = Math.max(1, Number(production?.quantity) || 1000);
  const markupPercent = Number.isFinite(production?.markupPercent) ? Number(production.markupPercent) : 25;
  const totalValue = result?.totalOrderValue ?? (sellingPrice * quantity);
  const totalProfit = result?.totalProfit ?? (unitProfit * quantity);

  return (
    <div className="sticky top-20 z-20 space-y-4">
      {/* Floating Dark Glassmorphic Enterprise HUD Card */}
      <div className="relative rounded-2xl bg-[#111726]/90 backdrop-blur-xl text-white p-5 sm:p-6 shadow-2xl border border-slate-700/80 ring-1 ring-white/5 overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-950/40">
        
        {/* Subtle Ambient Backlight */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Header Tag */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black tracking-wider text-slate-300 uppercase">
                EXECUTIVE COST HUD
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Real-Time
            </span>
          </div>

          {/* Big Hero Price Display */}
          <div className="bg-[#0b0f19]/70 rounded-xl p-4 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>ราคาขายเสนอแนะต่อใบ (Unit Price):</span>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{production.markupPercent}% Margin
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                {sellingPrice.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-400">บาท / ใบ</span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">
                ต้นทุนแท้จริง: <strong className="text-slate-200 font-mono font-bold">{unitCost.toFixed(2)} ฿</strong>
              </span>
              <span className="text-emerald-400">
                กำไรต่อใบ: <strong className="font-mono font-bold">+{unitProfit.toFixed(2)} ฿</strong>
              </span>
            </div>
          </div>

          {/* Quick Volume Switcher */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Package className="w-3.5 h-3.5 text-blue-400" />
                เลือกจำนวนสั่งผลิต (Quantity):
              </span>
              <span className="font-mono text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-xs">
                {quantity.toLocaleString()} ใบ
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {quickQuantities.map((q) => {
                const isCurrent = quantity === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onChangeQuantity(q)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400 ring-1 ring-blue-400/40 scale-[1.02]'
                        : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {q.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Markup Margin Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Percent className="w-3.5 h-3.5 text-indigo-400" />
                อัตรากำไรเป้าหมาย (Markup %):
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs">
                +{markupPercent}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={markupPercent}
                onChange={(e) => onChangeMarkup(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="grid grid-cols-6 gap-1">
                {quickMarkups.map((m) => {
                  const isCurrent = markupPercent === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChangeMarkup(m)}
                      className={`py-1 text-[11px] font-mono font-bold rounded-md transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white font-black shadow-xs'
                          : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-800'
                      }`}
                    >
                      {m}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Financial Totals Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                ยอดรวมทั้งออเดอร์
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block truncate">
                {totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/40">
              <span className="text-[11px] font-medium text-emerald-400 block mb-0.5">
                กำไรรวมออเดอร์
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 block truncate">
                +{totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
              </span>
            </div>
          </div>

          {/* 1-Click Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onOpenQuotation}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-99 border border-blue-400/30"
            >
              <FileDown className="w-4 h-4" />
              <span>พิมพ์ใบเสนอราคา / PDF Quotation</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenSaveRevision}
                className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
                title="บันทึกราคาและเหตุผลการปรับราคา"
              >
                <Save className="w-3.5 h-3.5 text-blue-400" />
                <span>บันทึก Rev</span>
              </button>

              <button
                type="button"
                onClick={onDirectExportExcel}
                className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
                title="ส่งออกรายงาน Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FloatingCostCockpit;

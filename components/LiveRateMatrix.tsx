import React, { useState } from 'react';
import {
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  CostBreakdown,
  BoxPreset,
} from '../types';
import { MASTER_BOX_PRESETS } from '../data/boxPresets';
import { PAPER_CATALOG } from '../data/paperCatalog';
import {
  Grid,
  Edit2,
  Sparkles,
  Sliders,
  ChevronDown,
  Layers,
  Percent,
  CheckCircle2,
  Info,
  Maximize2,
  RotateCcw,
  Search,
  X,
  Check,
  Package,
} from 'lucide-react';

interface LiveRateMatrixProps {
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  result: CostBreakdown;
  activePresetId?: string;
  onSelectPreset?: (preset: BoxPreset) => void;
  onChangeDimensions?: (dim: BoxDimensions) => void;
  onChangePaper?: (paper: PaperSpecs) => void;
  onChangePrinting?: (printing: PrintingSpecs) => void;
  onChangeFinishing?: (finishing: FinishingSpecs) => void;
  onChangeConverting?: (converting: ConvertingSpecs) => void;
  onChangeProduction?: (prod: ProductionSpecs) => void;
}

export const LiveRateMatrix: React.FC<LiveRateMatrixProps> = ({
  dimensions,
  paper,
  printing,
  finishing,
  converting,
  production,
  result,
  activePresetId,
  onSelectPreset,
  onChangeDimensions,
  onChangePaper,
  onChangePrinting,
  onChangeFinishing,
  onChangeConverting,
  onChangeProduction,
}) => {
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperSearch, setPaperSearch] = useState('');

  // Margin color status
  const markup = production.markupPercent;
  const getMarginBadge = (m: number) => {
    if (m < 15) return { label: 'Low Margin (<15%)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (m <= 25) return { label: 'Medium Margin (15-25%)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'High Margin (>25%)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const currentMargin = getMarginBadge(markup);

  const filteredPresets = MASTER_BOX_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(presetSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(presetSearch.toLowerCase())
  );

  const filteredPapers = PAPER_CATALOG.filter(
    (p) =>
      p.name.toLowerCase().includes(paperSearch.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(paperSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(paperSearch.toLowerCase())
  );

  return (
    <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-5 text-white relative">
      
      {/* Top Matrix Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Packaging Specification & Rate Matrix
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Interactive Grid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual matrix for rapid dimensional adjustments, raw material pricing, and production multipliers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${currentMargin.color}`}>
            {currentMargin.label}
          </span>
        </div>
      </div>

      {/* Quick Config Pills Row (Add Dimension / Paper / Preset) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Preset Selector Box */}
        <div className="bg-[#0b0f19]/70 rounded-xl p-3.5 border border-slate-800 space-y-2 relative">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>ทรงกล่องมาตรฐาน (Box Template):</span>
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(!isPresetModalOpen)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>ค้นหา/ดูทั้งหมด ({MASTER_BOX_PRESETS.length})</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {MASTER_BOX_PRESETS.slice(0, 4).map((p) => {
              const isSelected = p.id === activePresetId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset && onSelectPreset(p)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium text-left truncate transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs border border-blue-400'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                  }`}
                  title={p.name}
                >
                  {p.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Preset Search Popover */}
          {isPresetModalOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPresetModalOpen(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-full sm:w-96 bg-[#0f172a] text-white rounded-xl shadow-2xl border-2 border-blue-500/50 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                  <span>ค้นหาทรงกล่องมาตรฐาน ({filteredPresets.length})</span>
                  <button
                    type="button"
                    onClick={() => setIsPresetModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    placeholder="พิมพ์ชื่อทรงกล่อง เช่น ฝาเสียบ, ก้นขัด..."
                    className="w-full bg-[#1e293b] text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-800 text-xs">
                  {filteredPresets.map((p) => {
                    const isSelected = p.id === activePresetId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectPreset && onSelectPreset(p);
                          setIsPresetModalOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors pt-1.5 ${
                          isSelected
                            ? 'bg-blue-600/30 text-white font-bold border border-blue-500'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.defaultDimensions.length}×{p.defaultDimensions.width}×{p.defaultDimensions.height} mm • {p.defaultPaper.materialType.split(' ')[0]}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Paper Selector Box */}
        <div className="bg-[#0b0f19]/70 rounded-xl p-3.5 border border-slate-800 space-y-2 relative">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>ชนิดกระดาษหลัก (Paper Grade):</span>
            <button
              type="button"
              onClick={() => setIsPaperModalOpen(!isPaperModalOpen)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>ค้นหา/ดูทั้งหมด ({PAPER_CATALOG.length})</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {PAPER_CATALOG.slice(0, 3).map((cat) => {
              const isSelected = paper.materialType === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangePaper && onChangePaper({
                    ...paper,
                    materialType: cat.name,
                    gsm: cat.defaultGsm,
                    pricingUnit: cat.pricingUnit,
                    pricePerUnit: cat.defaultPricePerUnit,
                  })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium text-left truncate transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs border border-blue-400'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                  }`}
                  title={cat.name}
                >
                  {cat.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Paper Search Popover */}
          {isPaperModalOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPaperModalOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-full sm:w-96 bg-[#0f172a] text-white rounded-xl shadow-2xl border-2 border-emerald-500/50 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                  <span>ค้นหาชนิดกระดาษ ({filteredPapers.length})</span>
                  <button
                    type="button"
                    onClick={() => setIsPaperModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paperSearch}
                    onChange={(e) => setPaperSearch(e.target.value)}
                    placeholder="พิมพ์ชื่อกระดาษ เช่น แป้งหลังขาว, คราฟท์..."
                    className="w-full bg-[#1e293b] text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-800 text-xs">
                  {filteredPapers.map((cat) => {
                    const isSelected = paper.materialType === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onChangePaper && onChangePaper({
                            ...paper,
                            materialType: cat.name,
                            gsm: cat.defaultGsm,
                            pricingUnit: cat.pricingUnit,
                            pricePerUnit: cat.defaultPricePerUnit,
                          });
                          setIsPaperModalOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors pt-1.5 ${
                          isSelected
                            ? 'bg-emerald-600/30 text-white font-bold border border-emerald-500'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{cat.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {cat.defaultGsm} GSM (มี {cat.availableGsms.join(', ')}g) • {cat.defaultPricePerUnit} ฿/{cat.pricingUnit === 'per_kg' ? 'kg' : 'm²'}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary Matrix Grid Table (Matches Screenshot Rate Matrix Grid) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Cost & Specifications Grid: <span className="text-slate-500">Click on inputs to edit parameters directly</span></span>
          <span className="text-[11px] text-slate-500 font-mono">Dieline: {Math.round(result.spreadWidthMm)}×{Math.round(result.spreadHeightMm)} mm</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner bg-[#0b0f19]/80">
          <table className="w-full text-left text-xs border-collapse font-mono">
            {/* Table Header */}
            <thead className="bg-[#151c2e] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 border-r border-slate-800 w-36 font-sans">พารามิเตอร์</th>
                <th className="py-3 px-3 border-r border-slate-800 text-center">ค่าที่ 1 (Length/GSM)</th>
                <th className="py-3 px-3 border-r border-slate-800 text-center">ค่าที่ 2 (Width/Price)</th>
                <th className="py-3 px-3 border-r border-slate-800 text-center">ค่าที่ 3 (Height/Waste)</th>
                <th className="py-3 px-4 text-right font-sans text-emerald-400">ต้นทุนคำนวณ/ใบ</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              
              {/* Row 1: Dimensions */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 border-r border-slate-800 font-sans font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>ขนาดกล่อง (mm)</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">L:</span>
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, length: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">W:</span>
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, width: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">H:</span>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, height: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-300">
                  {result.areaSqM.toFixed(4)} m²
                </td>
              </tr>

              {/* Row 2: Paper & Material */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 border-r border-slate-800 font-sans font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>กระดาษ / แกรม</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">GSM:</span>
                    <input
                      type="number"
                      value={paper.gsm}
                      onChange={(e) => onChangePaper && onChangePaper({ ...paper, gsm: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">฿/kg:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={paper.pricePerUnit}
                      onChange={(e) => onChangePaper && onChangePaper({ ...paper, pricePerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">Waste:</span>
                    <input
                      type="number"
                      value={paper.wastePercent}
                      onChange={(e) => onChangePaper && onChangePaper({ ...paper, wastePercent: Number(e.target.value) })}
                      className="w-12 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-amber-300">
                  {(result?.materialCostPerUnit ?? 0).toFixed(2)} ฿
                </td>
              </tr>

              {/* Row 3: Printing & Plates */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 border-r border-slate-800 font-sans font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>งานพิมพ์ & เพลท</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">เพลท:</span>
                    <input
                      type="number"
                      value={printing.plateFixedCost}
                      onChange={(e) => onChangePrinting && onChangePrinting({ ...printing, plateFixedCost: Number(e.target.value) })}
                      className="w-16 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">พิมพ์/ใบ:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={printing.printCostPerUnit}
                      onChange={(e) => onChangePrinting && onChangePrinting({ ...printing, printCostPerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">Pantone:</span>
                    <input
                      type="number"
                      value={printing.pantoneColorsCount}
                      onChange={(e) => onChangePrinting && onChangePrinting({ ...printing, pantoneColorsCount: Number(e.target.value) })}
                      className="w-10 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <span className="text-[10px] text-slate-400">สี</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-blue-300">
                  {(((result?.printingFixedCost ?? 0) / Math.max(1, production.quantity)) + (result?.printingCostPerUnit ?? 0)).toFixed(2)} ฿
                </td>
              </tr>

              {/* Row 4: Finishing & Coating */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 border-r border-slate-800 font-sans font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>เคลือบ & ตกแต่ง</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">เคลือบ:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={finishing.coatingCostPerUnit}
                      onChange={(e) => onChangeFinishing && onChangeFinishing({ ...finishing, coatingCostPerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">Foil:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={finishing.foilCostPerUnit}
                      onChange={(e) => onChangeFinishing && onChangeFinishing({ ...finishing, foilCostPerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">Emboss:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={finishing.embossCostPerUnit}
                      onChange={(e) => onChangeFinishing && onChangeFinishing({ ...finishing, embossCostPerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-purple-300">
                  {(((result?.finishingFixedCost ?? 0) / Math.max(1, production.quantity)) + (result?.finishingCostPerUnit ?? 0)).toFixed(2)} ฿
                </td>
              </tr>

              {/* Row 5: Die-cut & Gluing */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 border-r border-slate-800 font-sans font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>ไดคัท & ปะกาว</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">บล็อก:</span>
                    <input
                      type="number"
                      value={converting.dieCutPlateFixedCost}
                      onChange={(e) => onChangeConverting && onChangeConverting({ ...converting, dieCutPlateFixedCost: Number(e.target.value) })}
                      className="w-16 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">ไดคัท/ใบ:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={converting.dieCutCostPerUnit}
                      onChange={(e) => onChangeConverting && onChangeConverting({ ...converting, dieCutCostPerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 bg-[#161f36] px-2 py-1 rounded-md border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">ปะกาว:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={converting.gluingCostPerUnit}
                      onChange={(e) => onChangeConverting && onChangeConverting({ ...converting, gluingCostPerUnit: Number(e.target.value) })}
                      className="w-14 bg-transparent text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-rose-300">
                  {(((result?.convertingFixedCost ?? 0) / Math.max(1, production.quantity)) + (result?.convertingCostPerUnit ?? 0)).toFixed(2)} ฿
                </td>
              </tr>

            </tbody>

            {/* Total Footer */}
            <tfoot className="bg-[#151c2e] font-bold border-t border-slate-800 text-white">
              <tr>
                <td colSpan={4} className="py-3 px-4 border-r border-slate-800 text-right font-sans text-xs">
                  รวมต้นทุนสุทธิต่อใบ (Net Cost Per Unit):
                </td>
                <td className="py-3 px-4 text-right text-emerald-400 text-sm font-black font-mono">
                  {(result?.totalCostPerUnit ?? 0).toFixed(2)} ฿
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend Footer matching reference screenshot */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Low Margin (&lt;15%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Medium Margin (15-25%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>High Margin (&gt;25%)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>ค่าพารามิเตอร์จะถูกคำนวณและอัปเดตลง BOM อัตโนมัติ</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LiveRateMatrix;

import React, { useState } from 'react';
import {
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  CostBreakdown,
  BoxCategory,
  BoxPreset,
} from '../types';
import { MASTER_BOX_PRESETS } from '../data/boxPresets';
import { PAPER_CATALOG } from '../data/paperCatalog';
import { BoxDiagramWithSpecs } from './BoxDiagramWithSpecs';
import {
  Package,
  FileText,
  Printer,
  Sparkles,
  Scissors,
  Layers,
  Scale,
  Edit3,
  CheckCircle2,
  TableProperties,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw,
  Box as BoxIcon,
  Ruler,
} from 'lucide-react';

interface ActiveSpecsCardProps {
  category: BoxCategory;
  categoryName: string;
  boxName: string;
  onChangeBoxName?: (name: string) => void;
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
  onEditSpecs: () => void;
}

export const ActiveSpecsCard: React.FC<ActiveSpecsCardProps> = ({
  category,
  categoryName,
  boxName,
  onChangeBoxName,
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
  onEditSpecs,
}) => {
  // Mode: '3d' (Interactive 3D Box) vs 'table' (Formal specs grid) vs 'editor' (Inline quick tweak editor)
  const [viewMode, setViewMode] = useState<'3d' | 'table' | 'editor'>('3d');
  const [activeEditorTab, setActiveEditorTab] = useState<'dim' | 'paper' | 'print' | 'finish' | 'convert'>('dim');

  // Check active finishes to display only what's actually used
  const hasCoating = finishing?.coatingType && finishing.coatingType !== 'none';
  const hasSpotUv = Boolean(finishing?.hasSpotUv);
  const hasFoil = Boolean(finishing?.hasFoilStamping);
  const hasEmboss = Boolean(finishing?.hasEmbossing);
  const hasWindow = Boolean(converting?.hasWindowPatching);
  const hasPantone = Boolean(printing?.pantoneColorsCount && printing.pantoneColorsCount > 0);

  // Cost calculation helpers
  const formatCost = (val?: number | null) => (val ?? 0).toFixed(2);
  const qty = Math.max(1, Number(production?.quantity) || 1);
  const printCostUnit = ((result?.printingFixedCost ?? 0) / qty) + (result?.printingCostPerUnit ?? 0);
  const finishCostUnit = ((result?.finishingFixedCost ?? 0) / qty) + (result?.finishingCostPerUnit ?? 0);
  const convertCostUnit = ((result?.convertingFixedCost ?? 0) / qty) + (result?.convertingCostPerUnit ?? 0);

  // Quick dimension steppers
  const stepDimension = (key: 'length' | 'width' | 'height', delta: number) => {
    if (!onChangeDimensions) return;
    const currentVal = Number(dimensions?.[key]) || 10;
    const newVal = Math.max(10, currentVal + delta);
    onChangeDimensions({
      length: dimensions?.length || 100,
      width: dimensions?.width || 40,
      height: dimensions?.height || 140,
      ...dimensions,
      [key]: newVal,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-300 overflow-hidden space-y-0">
      
      {/* Header Banner - High-contrast Clean Navy/Slate */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-amber-300">
                สเปกการผลิตและคิดราคาจริง (Active Production Specifications)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-xs">
                กล่องแป้งขึ้นรูป
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
              {boxName}
            </h2>
          </div>
        </div>

        {/* View Mode Switcher + Full Edit Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BoxIcon className="w-3.5 h-3.5" />
              <span>โมเดล 3D กล่อง</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>ตารางสเปก</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === 'editor'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ปรับแก้สเปก</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onEditSpecs}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all shadow-xs"
            title="เปิดหน้าต่างปรับแต่งสเปกขั้นสูง"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ขั้นสูง</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 0: 3D & TECHNICAL DIAGRAM BOX VIEW */}
      {viewMode === '3d' && (
        <div className="p-4 sm:p-5 bg-slate-950 space-y-4">
          <BoxDiagramWithSpecs
            dimensions={dimensions}
            category={category}
            paper={paper}
            finishing={finishing}
            boxName={boxName}
          />

          {/* Quick Live Dimension Controls directly below 3D Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  ปรับขนาดมิติกล่อง (L × W × H) เพื่อดูการเปลี่ยนแปลงแบบเรียลไทม์ 3D
                </h4>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
                กางแผ่นพิมพ์: {Math.round(result.spreadWidthMm)} × {Math.round(result.spreadHeightMm)} mm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Length L */}
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/80">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
                  <span>ความยาว (L) mm</span>
                  <span className="font-mono text-white text-sm">{dimensions.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepDimension('length', -5)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 font-black text-white text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, length: Number(e.target.value) })}
                    className="w-full text-center font-mono font-black text-sm bg-slate-900 border border-slate-700 rounded py-1 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => stepDimension('length', 5)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 font-black text-white text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Width W */}
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/80">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                  <span>ความกว้าง (W) mm</span>
                  <span className="font-mono text-white text-sm">{dimensions.width}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepDimension('width', -5)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 font-black text-white text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, width: Number(e.target.value) })}
                    className="w-full text-center font-mono font-black text-sm bg-slate-900 border border-slate-700 rounded py-1 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => stepDimension('width', 5)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 font-black text-white text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Height H */}
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/80">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1">
                  <span>ความสูง (H) mm</span>
                  <span className="font-mono text-white text-sm">{dimensions.height}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepDimension('height', -5)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 font-black text-white text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, height: Number(e.target.value) })}
                    className="w-full text-center font-mono font-black text-sm bg-slate-900 border border-slate-700 rounded py-1 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => stepDimension('height', 5)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 font-black text-white text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: INLINE QUICK TWEAK EDITOR */}
      {viewMode === 'editor' && (
        <div className="p-5 bg-slate-50 space-y-5">
          {/* Sub-tabs for direct editing */}
          <div className="flex flex-wrap gap-1.5 bg-slate-200/80 p-1.5 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveEditorTab('dim')}
              className={`px-3 py-2 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center gap-1.5 ${
                activeEditorTab === 'dim'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-indigo-700" />
              <span>1. ขนาด & ทรงกล่อง</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('paper')}
              className={`px-3 py-2 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center gap-1.5 ${
                activeEditorTab === 'paper'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>2. ชนิดกระดาษ & แกรม</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('print')}
              className={`px-3 py-2 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center gap-1.5 ${
                activeEditorTab === 'print'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>3. งานพิมพ์ & Pantone</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('finish')}
              className={`px-3 py-2 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center gap-1.5 ${
                activeEditorTab === 'finish'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>4. งานเคลือบ & ตกแต่ง</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('convert')}
              className={`px-3 py-2 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center gap-1.5 ${
                activeEditorTab === 'convert'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-rose-600" />
              <span>5. ไดคัท & ปะกาว</span>
            </button>
          </div>

          {/* Sub-Tab 1: Dimensions & Shape */}
          {activeEditorTab === 'dim' && (
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-950 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-700" />
                  ปรับขนาดกล่อง (มิลลิเมตร mm) & ทรงกล่อง
                </h4>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  กางพิมพ์: {Math.round(result.spreadWidthMm)} x {Math.round(result.spreadHeightMm)} mm
                </span>
              </div>

              {/* Box Presets Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ทรงกล่องมาตรฐาน:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MASTER_BOX_PRESETS.map((p) => {
                    const isSelected = p.id === activePresetId || p.category === category;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectPreset && onSelectPreset(p)}
                        className={`p-2.5 rounded-xl text-left border-2 transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-700 text-indigo-950 shadow-xs ring-1 ring-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-black text-xs">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.nameEn}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Dimension Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Length */}
                <div className="p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความยาว (Length L):</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepDimension('length', -5)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, length: Number(e.target.value) })}
                      className="w-full text-center font-mono font-black text-base border-2 border-slate-300 rounded-lg py-1.5 text-slate-950"
                    />
                    <button
                      type="button"
                      onClick={() => stepDimension('length', 5)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold block text-center mt-1">มิลลิเมตร (mm)</span>
                </div>

                {/* Width */}
                <div className="p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความกว้าง (Width W):</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepDimension('width', -5)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, width: Number(e.target.value) })}
                      className="w-full text-center font-mono font-black text-base border-2 border-slate-300 rounded-lg py-1.5 text-slate-950"
                    />
                    <button
                      type="button"
                      onClick={() => stepDimension('width', 5)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold block text-center mt-1">มิลลิเมตร (mm)</span>
                </div>

                {/* Height */}
                <div className="p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความสูง (Height H):</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepDimension('height', -5)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => onChangeDimensions && onChangeDimensions({ ...dimensions, height: Number(e.target.value) })}
                      className="w-full text-center font-mono font-black text-base border-2 border-slate-300 rounded-lg py-1.5 text-slate-950"
                    />
                    <button
                      type="button"
                      onClick={() => stepDimension('height', 5)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold block text-center mt-1">มิลลิเมตร (mm)</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Paper & Material */}
          {activeEditorTab === 'paper' && (
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-950 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  เลือกกระดาษ แกรม และ % เผื่อเสีย
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  ต้นทุนกระดาษ: {formatCost(result.materialCostPerUnit)} ฿/ใบ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Paper Types */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชนิดกระดาษ:</label>
                  <div className="space-y-1.5">
                    {PAPER_CATALOG.map((cat) => {
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
                          className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-slate-950 font-black ring-1 ring-amber-500'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black">{cat.name}</div>
                            <div className="text-[11px] text-slate-500">{cat.suitableFor}</div>
                          </div>
                          <span className="text-xs font-mono font-bold text-indigo-700">
                            {cat.defaultPricePerUnit} ฿/{cat.pricingUnit === 'per_kg' ? 'kg' : 'm²'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GSM & Waste % */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ความหนากระดาษ (GSM):</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[270, 300, 350, 400, 450, 500].map((g) => {
                        const isSelected = paper.gsm === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => onChangePaper && onChangePaper({ ...paper, gsm: g })}
                            className={`py-2 text-xs font-mono font-black rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {g} GSM
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>เผื่อสูญเสียกระดาษ (% Waste):</span>
                      <span className="font-mono text-indigo-700">{paper.wastePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      step="1"
                      value={paper.wastePercent}
                      onChange={(e) => onChangePaper && onChangePaper({ ...paper, wastePercent: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Printing */}
          {activeEditorTab === 'print' && (
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-950 text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  สเปกงานพิมพ์ & สีพิเศษ Pantone
                </h4>
                <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
                  ต้นทุนพิมพ์: {formatCost(printCostUnit)} ฿/ใบ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Print Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ระบบและจำนวนสีพิมพ์:</label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'offset_cmyk', label: 'ออฟเซ็ท 4 สี (Offset CMYK)', plate: 2000, cost: 0.95 },
                      { id: 'offset_1color', label: 'ออฟเซ็ท 1 สี (Offset 1 Color)', plate: 600, cost: 0.45 },
                      { id: 'offset_2color', label: 'ออฟเซ็ท 2 สี (Offset 2 Colors)', plate: 1200, cost: 0.65 },
                      { id: 'flexo_2color', label: 'เฟล็กโซ 2 สี (Flexo 2 Colors)', plate: 1200, cost: 0.35 },
                      { id: 'none', label: 'ไม่พิมพ์ (กล่องเปล่า / Plain)', plate: 0, cost: 0 },
                    ].map((p) => {
                      const isSelected = printing.type === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onChangePrinting && onChangePrinting({
                            ...printing,
                            type: p.id as any,
                            plateFixedCost: p.plate,
                            printCostPerUnit: p.cost,
                          })}
                          className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-slate-950 font-black ring-1 ring-blue-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-black">{p.label}</span>
                          <span className="text-xs font-mono font-bold text-slate-500">เพลท {p.plate} ฿</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pantone Colors */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">สีพิเศษ Pantone (Spot Color):</label>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[0, 1, 2, 3].map((num) => {
                      const isSelected = printing.pantoneColorsCount === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => onChangePrinting && onChangePrinting({ ...printing, pantoneColorsCount: num })}
                          className={`py-2 text-xs font-mono font-black rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {num} สี
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    เพิ่มสีพิเศษคิดค่าบล็อกผสมสี {printing.pantoneFixedCostPerColor} บาท/สี
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Finishing */}
          {activeEditorTab === 'finish' && (
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-950 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  งานเคลือบผิว & เทคนิคพิเศษ
                </h4>
                <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-300">
                  ต้นทุนตกแต่ง: {formatCost(finishCostUnit)} ฿/ใบ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Coating Types */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ประเภทการเคลือบผิว:</label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'matte_lam', label: 'เคลือบลามิเนตด้าน (Matte Laminate)', cost: 0.75 },
                      { id: 'gloss_lam', label: 'เคลือบลามิเนตเงา (Gloss Laminate)', cost: 0.65 },
                      { id: 'uv_coat', label: 'เคลือบเงา UV (UV Varnish)', cost: 0.40 },
                      { id: 'water_base', label: 'เคลือบ Water-based วานิช', cost: 0.25 },
                      { id: 'none', label: 'ไม่เคลือบผิว (None)', cost: 0 },
                    ].map((c) => {
                      const isSelected = finishing.coatingType === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onChangeFinishing && onChangeFinishing({
                            ...finishing,
                            coatingType: c.id as any,
                            coatingCostPerUnit: c.cost,
                          })}
                          className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-50 border-purple-600 text-slate-950 font-black ring-1 ring-purple-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-black">{c.label}</span>
                          <span className="text-xs font-mono font-bold text-indigo-700">+{c.cost} ฿</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Effects Switches */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">เทคนิคตกแต่งเสริม:</label>
                  
                  {/* Spot UV */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-950 block">สปอต UV เฉพาะจุด (Spot UV)</span>
                      <span className="text-[11px] text-slate-500">บล็อก 600 ฿ | +0.45 ฿/ใบ</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={finishing.hasSpotUv}
                      onChange={(e) => onChangeFinishing && onChangeFinishing({
                        ...finishing,
                        hasSpotUv: e.target.checked,
                        spotUvFixedCost: e.target.checked ? 600 : 0,
                        spotUvCostPerUnit: e.target.checked ? 0.45 : 0,
                      })}
                      className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Hot Foil */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-950 block">ปั๊มฟอยล์ทอง/เงิน (Hot Foil Stamping)</span>
                      <span className="text-[11px] text-slate-500">บล็อก 800 ฿ | +0.60 ฿/ใบ</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={finishing.hasFoilStamping}
                      onChange={(e) => onChangeFinishing && onChangeFinishing({
                        ...finishing,
                        hasFoilStamping: e.target.checked,
                        foilFixedCost: e.target.checked ? 800 : 0,
                        foilCostPerUnit: e.target.checked ? 0.60 : 0,
                      })}
                      className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Embossing */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-950 block">ปั๊มนูน / ปั๊มจม (Embossing)</span>
                      <span className="text-[11px] text-slate-500">บล็อก 700 ฿ | +0.35 ฿/ใบ</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={finishing.hasEmbossing}
                      onChange={(e) => onChangeFinishing && onChangeFinishing({
                        ...finishing,
                        hasEmbossing: e.target.checked,
                        embossFixedCost: e.target.checked ? 700 : 0,
                        embossCostPerUnit: e.target.checked ? 0.35 : 0,
                      })}
                      className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5: Converting & Gluing */}
          {activeEditorTab === 'convert' && (
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-950 text-sm flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-rose-600" />
                  งานขึ้นรูป ไดคัท และ ปะกาว
                </h4>
                <span className="text-xs font-mono font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                  ต้นทุนไดคัท/ปะกาว: {formatCost(convertCostUnit)} ฿/ใบ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">รูปแบบการปะกาว (Gluing Type):</label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'auto_side', label: 'ปะกาวข้างออโต้ 1 จุด (Auto Side Glue)', cost: 0.25 },
                      { id: 'auto_bottom_3point', label: 'ปะกาวก้นออโต้ 3 จุด (Crash Lock Auto Bottom)', cost: 0.60 },
                      { id: 'manual_glue', label: 'ปะกาวมือ / ชิ้นงานพิเศษ', cost: 0.85 },
                      { id: 'no_glue_fold', label: 'ขึ้นรูปพับขัดล็อค (ไม่ต้องปะกาว)', cost: 0 },
                    ].map((g) => {
                      const isSelected = converting.gluingType === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => onChangeConverting && onChangeConverting({
                            ...converting,
                            gluingType: g.id as any,
                            gluingCostPerUnit: g.cost,
                          })}
                          className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-rose-50 border-rose-600 text-slate-950 font-black ring-1 ring-rose-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-black">{g.label}</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{g.cost > 0 ? `+${g.cost} ฿` : 'ฟรี'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>บล็อกไดคัท (Die-cut Plate):</span>
                    <span className="font-mono text-slate-950 font-black">{converting.dieCutPlateFixedCost} บาท</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>ค่าแรงกดไดคัทต่อใบ:</span>
                    <span className="font-mono text-slate-950 font-black">{converting.dieCutCostPerUnit} บาท/ใบ</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
                    * เมื่อสั่งผลิตซ้ำในอนาคต (Repeat Order) จะประหยัดค่าบล็อกไดคัทได้ทันที
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: FORMAL ACTIVE SPECS TABLE (Locked Grid Table) */}
      {viewMode === 'table' && (
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-extrabold border-b-2 border-slate-300">
                <tr>
                  <th className="py-3 px-3 border-r border-slate-300 text-center w-12">ลำดับ</th>
                  <th className="py-3 px-3 border-r border-slate-300 w-36">หมวดหมู่งาน</th>
                  <th className="py-3 px-3 border-r border-slate-300">รายละเอียดสเปกผลิตจริง</th>
                  <th className="py-3 px-3 border-r border-slate-300 w-44">มิติ / ข้อมูลเทคนิค</th>
                  <th className="py-3 px-3 text-right w-36">ต้นทุน/ใบ (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                
                {/* 1. Box Shape & Dimensions */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50">1</td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <span className="inline-flex items-center gap-1.5 font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 text-xs">
                      <Package className="w-3.5 h-3.5" />
                      ทรงกล่อง & ขนาด
                    </span>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{categoryName}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      ขนาดสำเร็จ: <strong>{dimensions.length}</strong> (ยาว) × <strong>{dimensions.width}</strong> (กว้าง) × <strong>{dimensions.height}</strong> (สูง) มม.
                    </div>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 font-mono text-xs">
                    <div className="text-slate-800">กางพิมพ์: {Math.round(result.spreadWidthMm)} × {Math.round(result.spreadHeightMm)} mm</div>
                    <div className="text-slate-500 text-[11px]">พท.แผ่น: {result.areaSqM.toFixed(4)} ตร.ม.</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 font-semibold">-</td>
                </tr>

                {/* 2. Paper Material */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50">2</td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
                      <FileText className="w-3.5 h-3.5" />
                      กระดาษ / วัตถุดิบ
                    </span>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{paper.materialType} {paper.gsm} แกรม (GSM)</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      ราคาวัตถุดิบ: {paper.pricePerUnit} ฿ / {paper.pricingUnit === 'per_kg' ? 'กก.' : 'ตร.ม.'} (เผื่อสูญเสีย {paper.wastePercent}%)
                    </div>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 font-mono text-xs text-slate-700">
                    <div>น.น. {result.weightPerBoxGrams.toFixed(1)} กรัม/ใบ</div>
                    <div className="text-slate-500 text-[11px]">{(result.weightPerBoxGrams * production.quantity / 1000).toFixed(1)} กก./ออเดอร์</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCost(result.materialCostPerUnit)} ฿
                  </td>
                </tr>

                {/* 3. Printing */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50">3</td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <span className="inline-flex items-center gap-1.5 font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 text-xs">
                      <Printer className="w-3.5 h-3.5" />
                      งานพิมพ์ & เพลท
                    </span>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900">
                      ระบบพิมพ์ {printing.type.toUpperCase()}
                      {hasPantone && ` + สีพิเศษ Pantone (${printing.pantoneColorsCount} สี)`}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      ค่าเพลทแม่พิมพ์ {printing.plateFixedCost} บาท | ค่าแรงพิมพ์ {printing.printCostPerUnit} ฿/ใบ
                    </div>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 text-xs text-slate-700">
                    {printing.type === 'none' ? 'ไม่พิมพ์' : 'ออฟเซ็ทคมชัดสูง'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCost(printCostUnit)} ฿
                  </td>
                </tr>

                {/* 4. Finishing */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50">4</td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <span className="inline-flex items-center gap-1.5 font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      เคลือบ & ตกแต่ง
                    </span>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900">
                      {hasCoating ? finishing.coatingType : 'ไม่เคลือบผิว'}
                      {hasSpotUv ? ' + สปอต UV เฉพาะจุด' : ''}
                      {hasFoil ? ' + ปั๊มฟอยล์เงิน/ทอง' : ''}
                      {hasEmboss ? ' + ปั๊มนูน' : ''}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {hasSpotUv && `บล็อก Spot UV: ${finishing.spotUvFixedCost} ฿ | `}
                      {hasFoil && `บล็อกฟอยล์: ${finishing.foilFixedCost} ฿ | `}
                      {hasEmboss && `บล็อกปั๊มนูน: ${finishing.embossFixedCost} ฿`}
                    </div>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 text-xs text-slate-700">
                    {hasCoating ? 'กันรอย & สวยงาม' : 'งานพื้นฐาน'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCost(finishCostUnit)} ฿
                  </td>
                </tr>

                {/* 5. Converting & Assembly */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50">5</td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <span className="inline-flex items-center gap-1.5 font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 text-xs">
                      <Scissors className="w-3.5 h-3.5" />
                      ไดคัท & ปะกาว
                    </span>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900">
                      ไดคัทตามแบบ + {converting.gluingType}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      บล็อกไม้ไดคัท {converting.dieCutPlateFixedCost} บาท | ปะกาว {converting.gluingCostPerUnit} ฿/ใบ
                    </div>
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 text-xs text-slate-700">
                    {hasWindow ? 'เจาะหน้าต่างติดฟิล์ม' : 'ขึ้นรูปพร้อมแพ็ก'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCost(convertCostUnit)} ฿
                  </td>
                </tr>

              </tbody>
              
              <tfoot className="bg-slate-100 font-extrabold border-t-2 border-slate-300 text-slate-950">
                <tr>
                  <td colSpan={4} className="py-3 px-4 border-r border-slate-300 text-right text-xs sm:text-sm font-black">
                    รวมต้นทุนสุทธิต่อใบ (Net Base Cost per Unit) ยอด {production.quantity.toLocaleString()} ใบ:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-950 text-sm sm:text-base font-black">
                    {formatCost(result.totalCostPerUnit)} ฿
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveSpecsCard;

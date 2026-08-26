import React, { useState } from 'react';
import {
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  PricingUnit,
  PrintingType,
  GluingType,
  BoxCategory,
} from '../types';
import { PAPER_CATALOG } from '../data/paperCatalog';
import {
  FileText,
  Printer,
  Sparkles,
  Scissors,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BOMConfiguratorProps {
  boxCategory?: BoxCategory;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  onChangePaper: (paper: PaperSpecs) => void;
  onChangePrinting: (printing: PrintingSpecs) => void;
  onChangeFinishing: (finishing: FinishingSpecs) => void;
  onChangeConverting: (converting: ConvertingSpecs) => void;
  onChangeProduction: (production: ProductionSpecs) => void;
}

const BOMConfigurator: React.FC<BOMConfiguratorProps> = ({
  boxCategory = 'tuck_end',
  paper,
  printing,
  finishing,
  converting,
  production,
  onChangePaper,
  onChangePrinting,
  onChangeFinishing,
  onChangeConverting,
  onChangeProduction,
}) => {
  const [openTab, setOpenTab] = useState<'material' | 'printing' | 'finishing' | 'converting' | 'production'>('material');
  const [smartFocusMode, setSmartFocusMode] = useState<boolean>(true);
  const [showAdvancedFinishing, setShowAdvancedFinishing] = useState<boolean>(false);

  // Filter paper catalog based on folding paperboard
  const filteredPaperCatalog = PAPER_CATALOG.filter((p) => {
    if (!smartFocusMode) return true;
    switch (boxCategory) {
      case 'tuck_end':
      case 'snap_bottom':
        return p.category === 'duplex_board' || p.category === 'art_card';
      case 'auto_bottom':
      case 'sleeve_tray':
        return p.category === 'art_card' || p.category === 'duplex_board' || p.category === 'special_card';
      case 'folding_tray':
        return p.category === 'duplex_board' || p.category === 'kraft_board';
      case 'lid_base':
        return p.category === 'duplex_board' || p.category === 'art_card';
      default:
        return true;
    }
  });

  // Handle selecting a paper from catalog
  const handleSelectCatalogPaper = (paperId: string) => {
    const found = PAPER_CATALOG.find((p) => p.id === paperId);
    if (found) {
      onChangePaper({
        ...paper,
        materialType: found.name,
        gsm: found.defaultGsm,
        pricingUnit: found.pricingUnit,
        pricePerUnit: found.defaultPricePerUnit,
      });
    }
  };

  const QUANTITY_PRESETS = [500, 1000, 2000, 3000, 5000, 10000, 20000];

  // Helper flags
  const isAutoOrSleeve = boxCategory === 'auto_bottom' || boxCategory === 'sleeve_tray';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
      {/* Header with Smart Focus Toggle */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              2. ปรับแต่งองค์ประกอบ BOM (Bill of Materials Configurator)
            </h2>
            <p className="text-[11px] text-slate-500">
              คำนวณแยก 5 หมวดต้นทุนหลักอย่างโปร่งใส
            </p>
          </div>
        </div>

        {/* Smart Focus Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setSmartFocusMode(!smartFocusMode)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            smartFocusMode
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}
          title="สลับระหว่างโหมดกรองเฉพาะฟิลด์ที่เกี่ยวข้อง กับ โหมดแสดงครบทุกตัวเลือก"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{smartFocusMode ? 'โหมดกรองอัจฉริยะ (Smart View)' : 'โหมดวิศวกรรมเต็ม (Full View)'}</span>
        </button>
      </div>

      {/* SECTION 1: Material & Paper */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setOpenTab(openTab === 'material' ? 'production' : 'material')}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                1. วัตถุดิบกระดาษ & ลูกฟูก (Material & Paper)
              </span>
              <p className="text-[11px] text-slate-500">
                {paper.materialType} • {paper.gsm} GSM ({paper.pricePerUnit} บ./{paper.pricingUnit === 'per_kg' ? 'กก.' : 'ตร.ม.'})
              </p>
            </div>
          </div>
          {openTab === 'material' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openTab === 'material' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3.5">
            {/* Quick Catalog Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  เลือกชนิดกระดาษ/ลูกฟูกมาตรฐาน:
                </label>
                {smartFocusMode && (
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    กรองเฉพาะที่เหมาะกับกล่องนี้ ({filteredPaperCatalog.length} รายการ)
                  </span>
                )}
              </div>
              <select
                onChange={(e) => handleSelectCatalogPaper(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">-- เลือกเพื่อโหลดราคาและแกรมมาตรฐาน --</option>
                {filteredPaperCatalog.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.categoryLabel}] {cat.name} ({cat.defaultGsm} GSM - {cat.defaultPricePerUnit} บ./{cat.pricingUnit === 'per_kg' ? 'กก.' : 'ตร.ม.'})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อชนิดวัสดุ (Material Name)
              </label>
              <input
                type="text"
                value={paper.materialType}
                onChange={(e) => onChangePaper({ ...paper, materialType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* GSM, Unit, Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ความหนา (GSM / แกรม)
                </label>
                <input
                  type="number"
                  min={50}
                  max={2500}
                  value={paper.gsm}
                  onChange={(e) => onChangePaper({ ...paper, gsm: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หน่วยการคิดราคา
                </label>
                <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onChangePaper({ ...paper, pricingUnit: 'per_kg' })}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                      paper.pricingUnit === 'per_kg'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    บาท / กก.
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangePaper({ ...paper, pricingUnit: 'per_sqm' })}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                      paper.pricingUnit === 'per_sqm'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    บาท / ตร.ม.
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ราคาต่อหน่วย (บาท/{paper.pricingUnit === 'per_kg' ? 'กก.' : 'ตร.ม.'})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={paper.pricePerUnit}
                  onChange={(e) => onChangePaper({ ...paper, pricePerUnit: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Printing & Pre-press */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setOpenTab(openTab === 'printing' ? 'material' : 'printing')}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                2. งานพิมพ์ & เพลทแม่พิมพ์ (Printing & Pre-press)
              </span>
              <p className="text-[11px] text-slate-500">
                {printing.type === 'none' ? 'ไม่พิมพ์ (กระดาษเปล่า)' : `ระบบ ${printing.type.toUpperCase()}`} • เพลท {printing.plateFixedCost} บ. • ค่าพิมพ์ {printing.printCostPerUnit} บ./ใบ
              </p>
            </div>
          </div>
          {openTab === 'printing' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openTab === 'printing' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระบบการพิมพ์ (Printing Technology)
              </label>
              <select
                value={printing.type}
                onChange={(e) => onChangePrinting({ ...printing, type: e.target.value as PrintingType })}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="offset_cmyk">Offset 4 สี (CMYK - พิมพ์กล่องคุณภาพสูง)</option>
                <option value="offset_1color">Offset 1-2 สี (งานพิมพ์ลายเรียบง่าย)</option>
                <option value="flexo_2color">Flexo 1-2 สี (พิมพ์กล่องลูกฟูก/ลังขนส่ง)</option>
                <option value="digital">Digital Short-run (งานจำนวนน้อย ไม่ใช้เพลท)</option>
                <option value="none">ไม่พิมพ์ (กล่องคราฟท์/ลูกฟูกเปล่า)</option>
              </select>
            </div>

            {printing.type !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ค่าเพลท / บล็อกแม่พิมพ์รวม (Fixed Cost)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={printing.plateFixedCost}
                      onChange={(e) => onChangePrinting({ ...printing, plateFixedCost: Number(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400">บาท</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ค่าแรงพิมพ์ต่อใบ (Printing Labor / Unit)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={printing.printCostPerUnit}
                      onChange={(e) => onChangePrinting({ ...printing, printCostPerUnit: Number(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400">บ./ใบ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pantone Spot Color Addon */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800">
                  พิมพ์สีพิเศษ Pantone / สีทอง / สีเงิน (Spot Colors)
                </span>
                <span className="text-[11px] text-slate-500">
                  {printing.pantoneColorsCount > 0 ? `+${(printing.pantoneColorsCount * printing.pantoneFixedCostPerColor).toLocaleString()} บ.` : 'ไม่มี'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">จำนวนสีพิเศษ (สี)</label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={printing.pantoneColorsCount}
                    onChange={(e) => onChangePrinting({ ...printing, pantoneColorsCount: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">ค่าเพลทต่อ 1 สีพิเศษ (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={printing.pantoneFixedCostPerColor}
                    onChange={(e) => onChangePrinting({ ...printing, pantoneFixedCostPerColor: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Finishing & Coatings */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setOpenTab(openTab === 'finishing' ? 'material' : 'finishing')}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                3. งานเคลือบผิว & ตกแต่งพิเศษ (Surface Finishes & Coatings)
              </span>
              <p className="text-[11px] text-slate-500">
                {finishing.coatingType === 'none' ? 'ไม่เคลือบ' : finishing.coatingType} • {finishing.hasSpotUv ? 'Spot UV' : ''} {finishing.hasFoilStamping ? '• เคทอง' : ''} {finishing.hasEmbossing ? '• ปั๊มนูน' : ''}
              </p>
            </div>
          </div>
          {openTab === 'finishing' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openTab === 'finishing' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3.5">
            {/* Primary Coating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                งานเคลือบผิวหลัก (Primary Surface Coating)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={finishing.coatingType}
                  onChange={(e) => {
                    const type = e.target.value as FinishingSpecs['coatingType'];
                    let defCost = 0;
                    if (type === 'matte_lam') defCost = 1.5;
                    else if (type === 'gloss_lam') defCost = 1.2;
                    else if (type === 'water_based') defCost = 0.9;
                    else if (type === 'varnish') defCost = 0.6;
                    else if (type === 'uv_coat') defCost = 0.8;
                    onChangeFinishing({ ...finishing, coatingType: type, coatingCostPerUnit: defCost });
                  }}
                  className="border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="none">ไม่เคลือบ (Uncoated)</option>
                  <option value="matte_lam">เคลือบลามิเนตด้าน (Matte Lamination - พรีเมียม)</option>
                  <option value="gloss_lam">เคลือบลามิเนตเงา (Gloss Lamination - เงาชัด กันน้ำ)</option>
                  <option value="water_based">เคลือบ Water-based วานิชน้ำ (Food Grade)</option>
                  <option value="varnish">เคลือบวานิชเงา/ด้าน (Varnish Coating - ประหยัด)</option>
                  <option value="uv_coat">เคลือบยูวีเงาเต็มแผ่น (Full UV Coating)</option>
                </select>

                {finishing.coatingType !== 'none' && (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={finishing.coatingCostPerUnit}
                      onChange={(e) => onChangeFinishing({ ...finishing, coatingCostPerUnit: Number(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg p-2 pr-12 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="ค่าเคลือบต่อใบ"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400">บ./ใบ</span>
                  </div>
                )}
              </div>
            </div>

            {/* In smart mode for corrugated RSC, hide luxury embellishments unless requested */}
            {smartFocusMode && isCorrugated && !showAdvancedFinishing ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 mb-2">
                  กล่องลูกฟูกขนส่งมักไม่นิยมใช้สปอต UV หรือเคทอง เพื่อประหยัดต้นทุน
                </p>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFinishing(true)}
                  className="text-xs text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  แสดงตัวเลือกตกแต่งพิเศษ (Spot UV, ปั๊มฟอยล์, ปั๊มนูน)
                </button>
              </div>
            ) : (
              /* Special Effects Switches */
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">งานตกแต่งพิเศษ (Special Embellishments):</span>

                {/* Spot UV */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={finishing.hasSpotUv}
                        onChange={(e) => onChangeFinishing({ ...finishing, hasSpotUv: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-800">สปอตยูวีเฉพาะจุด (Spot UV)</span>
                    </div>
                    <span className="text-[11px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-medium">
                      เพิ่มความเงาเฉพาะจุด/โลโก้
                    </span>
                  </label>

                  {finishing.hasSpotUv && (
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">ค่าบล็อกฟิล์มสปอต (Fixed)</span>
                        <input
                          type="number"
                          min={0}
                          value={finishing.spotUvFixedCost}
                          onChange={(e) => onChangeFinishing({ ...finishing, spotUvFixedCost: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">ค่าสปอตต่อใบ (Variable)</span>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          value={finishing.spotUvCostPerUnit}
                          onChange={(e) => onChangeFinishing({ ...finishing, spotUvCostPerUnit: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hot Foil Stamping */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={finishing.hasFoilStamping}
                        onChange={(e) => onChangeFinishing({ ...finishing, hasFoilStamping: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-800">ปั๊มฟอยล์เคทอง / เคเงิน (Hot Stamping Foil)</span>
                    </div>
                    <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
                      ฟอยล์ทอง/เงิน/โรสโกลด์
                    </span>
                  </label>

                  {finishing.hasFoilStamping && (
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">ค่าบล็อกเคทอง (Fixed)</span>
                        <input
                          type="number"
                          min={0}
                          value={finishing.foilFixedCost}
                          onChange={(e) => onChangeFinishing({ ...finishing, foilFixedCost: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">ค่าปั๊มฟอยล์ต่อใบ (Variable)</span>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          value={finishing.foilCostPerUnit}
                          onChange={(e) => onChangeFinishing({ ...finishing, foilCostPerUnit: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Embossing */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={finishing.hasEmbossing}
                        onChange={(e) => onChangeFinishing({ ...finishing, hasEmbossing: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-800">ปั๊มนูน / ปั๊มจม (Embossing / Debossing)</span>
                    </div>
                    <span className="text-[11px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded font-medium">
                      เพิ่มมิติสัมผัส 3D
                    </span>
                  </label>

                  {finishing.hasEmbossing && (
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">ค่าบล็อกปั๊มนูน (Fixed)</span>
                        <input
                          type="number"
                          min={0}
                          value={finishing.embossFixedCost}
                          onChange={(e) => onChangeFinishing({ ...finishing, embossFixedCost: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">ค่าปั๊มต่อใบ (Variable)</span>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          value={finishing.embossCostPerUnit}
                          onChange={(e) => onChangeFinishing({ ...finishing, embossCostPerUnit: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: Converting & Assembly */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setOpenTab(openTab === 'converting' ? 'material' : 'converting')}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                4. งานขึ้นรูป ไดคัท & ปะกาว (Converting & Assembly)
              </span>
              <p className="text-[11px] text-slate-500">
                บล็อกไดคัท {converting.dieCutPlateFixedCost} บ. • ปะกาว ({converting.gluingType}) {converting.gluingCostPerUnit} บ./ใบ
              </p>
            </div>
          </div>
          {openTab === 'converting' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openTab === 'converting' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3.5">
            {/* Die cut block & labor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ค่าบล็อกมีดไดคัทเลเซอร์ (Die-cut Block Fixed)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={converting.dieCutPlateFixedCost}
                    onChange={(e) => onChangeConverting({ ...converting, dieCutPlateFixedCost: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400">บาท</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ค่าแรงปั๊มไดคัทต่อใบ (Die-cut Labor / Unit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={converting.dieCutCostPerUnit}
                    onChange={(e) => onChangeConverting({ ...converting, dieCutCostPerUnit: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400">บ./ใบ</span>
                </div>
              </div>
            </div>

            {/* Gluing Type & Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทการปะกาว & ขึ้นรูปกล่อง (Gluing / Assembly)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={converting.gluingType}
                  onChange={(e) => {
                    const gType = e.target.value as GluingType;
                    let gCost = 0.5;
                    if (gType === 'self_fold') gCost = 0;
                    else if (gType === 'bottom_lock') gCost = 0.8;
                    else if (gType === 'corner_4_6') gCost = 0.8;
                    else if (gType === 'manual') gCost = 4.5;
                    onChangeConverting({ ...converting, gluingType: gType, gluingCostPerUnit: gCost });
                  }}
                  className="border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="auto_side">ปะกาวข้างอัตโนมัติ (Straight-line Auto Glue)</option>
                  <option value="bottom_lock">ปะกาวก้นล็อกอัตโนมัติ (Crash Lock Bottom)</option>
                  <option value="corner_4_6">ปะกาว 4-6 มุม ถาดเบเกอรี่ (Corner Tray Glue)</option>
                  <option value="self_fold">พับขัดในตัว ไม่ใช้กาว (Self-folding Mailer/Box)</option>
                  <option value="manual">งานหุ้มประกอบมือ / จั่วปัง (Manual Assembly)</option>
                </select>

                {converting.gluingType !== 'self_fold' && (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={converting.gluingCostPerUnit}
                      onChange={(e) => onChangeConverting({ ...converting, gluingCostPerUnit: Number(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg p-2 pr-12 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="ค่าปะกาวต่อใบ"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400">บ./ใบ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Window Patching (Contextually shown/promoted) */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={converting.hasWindowPatching}
                    onChange={(e) => onChangeConverting({ ...converting, hasWindowPatching: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-slate-800">เจาะหน้าต่างติดแผ่นฟิล์มใส (Window Patching)</span>
                </div>
                <span className="text-[11px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-medium">
                  มองเห็นสินค้าภายใน
                </span>
              </label>

              {converting.hasWindowPatching && (
                <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">ค่าบล็อกเจาะหน้าต่าง (Fixed)</span>
                    <input
                      type="number"
                      min={0}
                      value={converting.windowFixedCost}
                      onChange={(e) => onChangeConverting({ ...converting, windowFixedCost: Number(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">ค่าฟิล์ม & ปะหน้าต่างต่อใบ</span>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={converting.windowCostPerUnit}
                      onChange={(e) => onChangeConverting({ ...converting, windowCostPerUnit: Number(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Production Quantity & Profit Margin */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setOpenTab(openTab === 'production' ? 'material' : 'production')}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                5. จำนวนสั่งผลิต & กำไร (Quantity & Profit Margin)
              </span>
              <p className="text-[11px] text-slate-500">
                สั่งผลิต {production.quantity.toLocaleString()} ใบ • Margin กำไร {production.markupPercent}%
              </p>
            </div>
          </div>
          {openTab === 'production' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openTab === 'production' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-4">
            {/* Quantity Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">จำนวนสั่งผลิต (Order Quantity)</label>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {production.quantity.toLocaleString()} ใบ
                </span>
              </div>
              <input
                type="number"
                min={100}
                max={500000}
                value={production.quantity}
                onChange={(e) => onChangeProduction({ ...production, quantity: Math.max(1, Number(e.target.value) || 0) })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Quick quantity chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUANTITY_PRESETS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onChangeProduction({ ...production, quantity: q })}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all ${
                      production.quantity === q
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Markup Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  อัตรากำไรบวกเพิ่ม (Markup % on Cost)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={production.markupPercent}
                    onChange={(e) => onChangeProduction({ ...production, markupPercent: Number(e.target.value) || 0 })}
                    className="w-14 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={production.markupPercent}
                onChange={(e) => onChangeProduction({ ...production, markupPercent: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (ราคาทุน)</span>
                <span>25% (มาตรฐาน)</span>
                <span>35% (งานแบรนด์)</span>
                <span>50%+ (พรีเมียม)</span>
              </div>
            </div>

            {/* Packaging & Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ค่าบรรจุห่อ/มัด/ลัง (บาท/ใบ)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={production.packingCostPerUnit}
                  onChange={(e) => onChangeProduction({ ...production, packingCostPerUnit: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ค่าใช้จ่ายคงที่อื่นๆ (บาท)
                </label>
                <input
                  type="number"
                  min={0}
                  value={production.otherFixedCosts}
                  onChange={(e) => onChangeProduction({ ...production, otherFixedCosts: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900"
                  placeholder="ค่า Mockup, ค่าส่ง ฯลฯ"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOMConfigurator;

import React from 'react';
import {
  BoxCategory,
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  CostBreakdown,
  BoxPreset,
} from '../types';
import DimensionsInput from './DimensionsInput';
import BOMConfigurator from './BOMConfigurator';
import PresetSelector from './PresetSelector';
import { X, Check, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';

interface EditSpecsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  boxName: string;
  onChangeBoxName: (name: string) => void;
  category: BoxCategory;
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  result: CostBreakdown;
  activePresetId: string;
  activePreset: BoxPreset;
  onSelectPreset: (preset: BoxPreset) => void;
  onResetToPresetDefaults: () => void;
  onChangeDimensions: (dimensions: BoxDimensions) => void;
  onChangeWastePercent: (waste: number) => void;
  onChangePaper: (paper: PaperSpecs) => void;
  onChangePrinting: (printing: PrintingSpecs) => void;
  onChangeFinishing: (finishing: FinishingSpecs) => void;
  onChangeConverting: (converting: ConvertingSpecs) => void;
  onChangeProduction: (production: ProductionSpecs) => void;
}

const EditSpecsDrawer: React.FC<EditSpecsDrawerProps> = ({
  isOpen,
  onClose,
  boxName,
  onChangeBoxName,
  category,
  dimensions,
  paper,
  printing,
  finishing,
  converting,
  production,
  result,
  activePresetId,
  activePreset,
  onSelectPreset,
  onResetToPresetDefaults,
  onChangeDimensions,
  onChangeWastePercent,
  onChangePaper,
  onChangePrinting,
  onChangeFinishing,
  onChangeConverting,
  onChangeProduction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                ปรับแต่งสเปก & ต้นทุนกล่อง (Edit Box Specs & BOM)
              </h3>
              <p className="text-xs text-slate-400">
                แก้ไขขนาด, ชนิดกระดาษ, ระบบพิมพ์, เคลือบ และงานไดคัท
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Calculation Bar */}
        <div className="bg-indigo-50 border-b border-indigo-100 p-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">ชื่องาน:</span>
            <input
              type="text"
              value={boxName}
              onChange={(e) => onChangeBoxName(e.target.value)}
              className="border border-indigo-200 bg-white rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-56 sm:w-72"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">ราคาขายคำนวณสด ({production.quantity.toLocaleString()} ใบ)</span>
              <span className="font-mono font-black text-indigo-700 text-base">
                {result.sellingPricePerUnit.toFixed(2)} บาท/ใบ
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Preset Selector */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              เลือกทรงกล่องมาตรฐาน (Box Template)
            </span>
            <PresetSelector
              activePresetId={activePresetId}
              onSelectPreset={onSelectPreset}
              onResetToPresetDefaults={onResetToPresetDefaults}
            />
          </div>

          {/* Dimensions Input */}
          <DimensionsInput
            dimensions={dimensions}
            category={category}
            spreadWidthMm={result.spreadWidthMm}
            spreadHeightMm={result.spreadHeightMm}
            areaSqM={result.areaSqM}
            wastePercent={paper.wastePercent}
            onChangeDimensions={onChangeDimensions}
            onChangeWastePercent={onChangeWastePercent}
            spreadFormulaDesc={activePreset.spreadFormulaDesc}
          />

          {/* BOM Configurator */}
          <BOMConfigurator
            boxCategory={category}
            paper={paper}
            printing={printing}
            finishing={finishing}
            converting={converting}
            production={production}
            onChangePaper={onChangePaper}
            onChangePrinting={onChangePrinting}
            onChangeFinishing={onChangeFinishing}
            onChangeConverting={onChangeConverting}
            onChangeProduction={onChangeProduction}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetToPresetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่ามาตรฐาน</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>เสร็จสิ้น & บันทึกการแก้ไข</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditSpecsDrawer;

import React, { useState } from 'react';
import { BoxDimensions, BoxCategory } from '../types';
import { Ruler, Maximize2, Sparkles, Box as BoxIcon, Eye, Compass } from 'lucide-react';
import { BoxDiagramWithSpecs } from './BoxDiagramWithSpecs';

interface DimensionsInputProps {
  dimensions: BoxDimensions;
  category: BoxCategory;
  spreadWidthMm: number;
  spreadHeightMm: number;
  areaSqM: number;
  wastePercent: number;
  onChangeDimensions: (newDims: BoxDimensions) => void;
  onChangeWastePercent: (waste: number) => void;
  spreadFormulaDesc?: string;
}

const QUICK_SIZES: { label: string; dims: BoxDimensions; category: BoxCategory }[] = [
  { label: 'หลอดครีม/เซรั่ม (40×40×140)', dims: { length: 40, width: 40, height: 140 }, category: 'tuck_end' },
  { label: 'กล่องครีมกระปุก (75×75×65)', dims: { length: 75, width: 75, height: 65 }, category: 'tuck_end' },
  { label: 'กล่องไปรษณีย์ Size S (200×140×60)', dims: { length: 200, width: 140, height: 60 }, category: 'mailer_box' },
  { label: 'กล่องไปรษณีย์ Size M (250×180×90)', dims: { length: 250, width: 180, height: 90 }, category: 'mailer_box' },
  { label: 'ลังเบียร์/ลังขนส่ง (380×260×260)', dims: { length: 380, width: 260, height: 260 }, category: 'rsc_carton' },
  { label: 'กล่องเค้ก 1/2 ปอนด์ (150×150×100)', dims: { length: 150, width: 150, height: 100 }, category: 'food_box' },
];

const DimensionsInput: React.FC<DimensionsInputProps> = ({
  dimensions,
  category,
  spreadWidthMm,
  spreadHeightMm,
  areaSqM,
  wastePercent,
  onChangeDimensions,
  onChangeWastePercent,
  spreadFormulaDesc,
}) => {
  const [show3DPreview, setShow3DPreview] = useState<boolean>(true);

  const handleChange = (field: keyof BoxDimensions, value: number) => {
    onChangeDimensions({
      ...dimensions,
      [field]: Math.max(10, Number(value) || 0),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">ขนาดกล่องพับสำเร็จ & แสดงผล 3D</h3>
            <p className="text-[11px] text-slate-500">ระบุขนาดภายนอก ยาว × กว้าง × สูง (มิลลิเมตร)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShow3DPreview(!show3DPreview)}
            className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 border ${
              show3DPreview
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <BoxIcon className="w-3.5 h-3.5" />
            <span>{show3DPreview ? 'ซ่อน 3D' : 'แสดงโมเดล 3D'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500">เผื่อตัดเจียน (Waste):</span>
            <select
              value={wastePercent}
              onChange={(e) => onChangeWastePercent(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value={5}>+5%</option>
              <option value={8}>+8%</option>
              <option value={10}>+10% (มาตรฐาน)</option>
              <option value={12}>+12%</option>
              <option value={15}>+15% (ชิ้นงานซับซ้อน)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3 Primary Inputs */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ความยาว (L) <span className="text-slate-400 font-normal">mm</span>
          </label>
          <input
            type="number"
            min={10}
            max={2000}
            value={dimensions.length}
            onChange={(e) => handleChange('length', Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ความกว้าง (W) <span className="text-slate-400 font-normal">mm</span>
          </label>
          <input
            type="number"
            min={10}
            max={2000}
            value={dimensions.width}
            onChange={(e) => handleChange('width', Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ความสูง (H) <span className="text-slate-400 font-normal">mm</span>
          </label>
          <input
            type="number"
            min={10}
            max={2000}
            value={dimensions.height}
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          ขนาดกล่องยอดนิยม (คลิกเพื่อใส่ค่า):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SIZES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeDimensions(item.dims)}
              className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded border border-slate-200 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D & Technical Diagram Box Live Render Embed */}
      {show3DPreview && (
        <div className="pt-2">
          <BoxDiagramWithSpecs
            dimensions={dimensions}
            category={category}
            boxName="ตัวอย่างกล่องพับสำเร็จ"
          />
        </div>
      )}

      {/* Calculated Blueprint & Spread Size Bar */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1 font-medium">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            ขนาดกางออกจริง (Unfolded Die-line Sheet):
          </span>
          <span className="font-mono text-cyan-300 font-bold">
            {Math.round(spreadWidthMm)} × {Math.round(spreadHeightMm)} mm
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-[11px]">
          <div>
            <span className="text-slate-400">พื้นที่รวมต่อใบ (+Waste {wastePercent}%):</span>
            <div className="font-mono font-bold text-white text-xs mt-0.5">
              {areaSqM.toFixed(4)} ตร.ม. (m²)
            </div>
          </div>
          <div>
            <span className="text-slate-400">ขนาดเทียบกระดาษแผ่นใหญ่:</span>
            <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
              {Math.ceil(spreadWidthMm / 25.4)}″ × {Math.ceil(spreadHeightMm / 25.4)}″ นิ้ว
            </div>
          </div>
        </div>

        {spreadFormulaDesc && (
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            สูตรคำนวณ: {spreadFormulaDesc}
          </p>
        )}
      </div>
    </div>
  );
};

export default DimensionsInput;

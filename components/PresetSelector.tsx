import React, { useState } from 'react';
import { BoxPreset, BoxCategory } from '../types';
import { MASTER_BOX_PRESETS } from '../data/boxPresets';
import { Box, Package, Truck, Utensils, Sparkles, Layers, RotateCcw, BookmarkCheck, Search, Filter, Check } from 'lucide-react';

interface PresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (preset: BoxPreset) => void;
  onResetToPresetDefaults: () => void;
}

const getCategoryIcon = (category: BoxCategory) => {
  switch (category) {
    case 'tuck_end':
      return <Box className="w-5 h-5 text-indigo-600" />;
    case 'auto_bottom':
      return <Package className="w-5 h-5 text-emerald-600" />;
    case 'snap_bottom':
      return <Layers className="w-5 h-5 text-amber-600" />;
    case 'lid_base':
      return <Sparkles className="w-5 h-5 text-purple-600" />;
    case 'sleeve_tray':
      return <Box className="w-5 h-5 text-blue-600" />;
    case 'folding_tray':
      return <Package className="w-5 h-5 text-rose-600" />;
    default:
      return <Layers className="w-5 h-5 text-slate-600" />;
  }
};

const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
  onResetToPresetDefaults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPresets = MASTER_BOX_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900">
              1. เลือกชนิดกล่องอัจฉริยะ (Smart Box Filter & Auto-Fill)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            เลือกลักษณะกล่องเพื่อดึงข้อมูลขนาด แกรมกระดาษ และองค์ประกอบ BOM มารอทันทีโดยไม่ต้องกรอกเองทั้งหมด
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search for presets */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาทรงกล่อง เช่น กล่องแป้ง, ลูกฟูก..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 w-44 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={onResetToPresetDefaults}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
            title="รีเซ็ตค่ากลับเป็นค่ามาตรฐานของกล่องประเภทนี้"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">รีเซ็ตสเปกมาตรฐาน</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white shadow-2xs border border-slate-100">
                    {getCategoryIcon(preset.category)}
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      <BookmarkCheck className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span className="font-medium text-slate-700 font-mono">
                  {preset.defaultDimensions.length}×{preset.defaultDimensions.width}×{preset.defaultDimensions.height} mm
                </span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  {preset.defaultPaper.gsm}g
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;

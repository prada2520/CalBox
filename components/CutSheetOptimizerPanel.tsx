import React, { useState } from 'react';
import {
  Scissors,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  TrendingDown,
  RotateCw,
  HelpCircle,
} from 'lucide-react';
import { BoxDimensions, BoxCategory, PaperSpecs, ProductionSpecs } from '../types';
import {
  CutSheetOptimizationResult,
  STANDARD_SHEET_SIZES,
} from '../utils/cutSheetOptimizer';

interface CutSheetOptimizerPanelProps {
  dimensions: BoxDimensions;
  category: BoxCategory;
  paper: PaperSpecs;
  production: ProductionSpecs;
  optimizationResult: CutSheetOptimizationResult;
  onSelectSheetSize?: (widthInch: number, lengthInch: number) => void;
  onOpenJobTicket?: () => void;
}

export const CutSheetOptimizerPanel: React.FC<CutSheetOptimizerPanelProps> = ({
  dimensions,
  category,
  paper,
  production,
  optimizationResult,
  onSelectSheetSize,
  onOpenJobTicket,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<string>('sheet_job_23_38_5');
  const [isCustomSheet, setIsCustomSheet] = useState(false);
  const [customW, setCustomW] = useState(optimizationResult.sheetWidthInch);
  const [customL, setCustomL] = useState(optimizationResult.sheetLengthInch);

  const {
    flatWidthMm,
    flatHeightMm,
    sheetWidthInch,
    sheetLengthInch,
    sheetWidthMm,
    sheetLengthMm,
    boxesPerSheet,
    columns,
    rows,
    orientation,
    paperUtilizationPercent,
    paperTrimWastePercent,
    requiredSheetsGross,
    netSheetsRequired,
    grossRequiredBoxes,
    spoilagePercentage,
    weightPerBoxGrams,
  } = optimizationResult;

  return (
    <div className="bg-[#111726]/95 backdrop-blur-md rounded-2xl border-2 border-emerald-500/30 shadow-xl p-5 sm:p-6 space-y-5 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>ระบบคำนวณขนาดตัดกระดาษจริง & จำลองการวางเลย์เอาต์ (Cut Sheet & Imposition)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                {boxesPerSheet} ตัว/แผ่น (Ups)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              วิเคราะห์ขนาดกางออก (Flat Die-Cut Blank), จำนวนอัป, แผ่นพิมพ์สุทธิ และ % เผื่อเสียตามสูตรจริงของโรงพิมพ์
            </p>
          </div>
        </div>

        {onOpenJobTicket && (
          <button
            type="button"
            onClick={onOpenJobTicket}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📄 ออกใบสั่งงานผลิตจริง (Job Ticket)</span>
          </button>
        )}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 2D Imposition Layout Visualizer (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>ภาพจำลองการวางชิ้นงานบนแผ่นกระดาษพิมพ์ ({boxesPerSheet} กล่อง/แผ่น)</span>
            </span>
            <span className="font-mono text-emerald-400 text-[11px]">
              คุ้มค่า: {paperUtilizationPercent}% | เสียขอบ: {paperTrimWastePercent}%
            </span>
          </div>

          {/* Interactive Sheet Preview Canvas */}
          <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
            
            {/* Sheet Background Box */}
            <div
              className="border-2 border-emerald-500/60 bg-emerald-950/20 rounded-lg p-2 flex flex-col justify-between relative shadow-inner transition-all"
              style={{
                width: '100%',
                maxWidth: '380px',
                aspectRatio: `${sheetLengthMm} / ${sheetWidthMm}`,
              }}
            >
              {/* Sheet Dimension Labels */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-1.5 rounded">
                ความยาว: {sheetLengthInch}" ({sheetLengthMm.toFixed(0)} mm)
              </div>
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-1.5 rounded">
                {sheetWidthInch}"
              </div>

              {/* Gripper Margin Indicator */}
              <div className="w-full h-2 bg-rose-500/20 border-b border-rose-500/40 text-[8px] text-rose-300 font-mono flex items-center justify-center">
                ขอบจับพิมพ์ (Gripper Margin 15mm)
              </div>

              {/* Grid of Box Blanks */}
              <div
                className="grid gap-1 flex-1 py-1"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: boxesPerSheet }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border border-blue-400/60 bg-blue-600/20 rounded flex flex-col items-center justify-center p-0.5 text-center transition-all hover:bg-blue-500/40"
                  >
                    <span className="text-[9px] font-black text-blue-200 font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-[8px] text-slate-300 font-mono hidden sm:inline">
                      {flatWidthMm}×{flatHeightMm}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-slate-400 text-center font-mono pt-1">
                การวางแนว: <strong>{orientation.toUpperCase()}</strong> ({columns} คอลัมน์ × {rows} แถว)
              </div>
            </div>

          </div>

          {/* Flat Die-Cut Blank Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-[#0b0f19] border border-slate-800">
              <div className="text-[10px] text-slate-400">ขนาดกล่อง (L×W×H)</div>
              <div className="font-mono font-bold text-white mt-0.5">
                {dimensions.length}×{dimensions.width}×{dimensions.height} mm
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0b0f19] border border-slate-800">
              <div className="text-[10px] text-slate-400">ขนาดกางออก (Flat Die-Cut)</div>
              <div className="font-mono font-bold text-cyan-300 mt-0.5">
                {flatWidthMm} × {flatHeightMm} mm
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0b0f19] border border-slate-800">
              <div className="text-[10px] text-slate-400">น้ำหนักต่อกล่อง</div>
              <div className="font-mono font-bold text-amber-300 mt-0.5">
                {weightPerBoxGrams} กรัม/ใบ
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sheet Size Selectors & Factory Production Calc (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Preset Standard Sheet Sizes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>เลือกขนาดตัดกระดาษ (Sheet Cut Size):</span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {sheetWidthInch} × {sheetLengthInch} นิ้ว
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STANDARD_SHEET_SIZES.map((sz) => {
                const isSelected = sz.widthInch === sheetWidthInch && sz.lengthInch === sheetLengthInch;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => {
                      setSelectedSheetId(sz.id);
                      setIsCustomSheet(false);
                      onSelectSheetSize && onSelectSheetSize(sz.widthInch, sz.lengthInch);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-md'
                        : 'bg-[#0b0f19] hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{sz.name.split(' ')[0]} {sz.name.split(' ')[1]} {sz.name.split(' ')[2]}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sz.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Factory Production & Wastage Breakdown (สูตรคำนวณจริงโรงพิมพ์) */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>สูตรคำนวณยอดแผ่นพิมพ์ & เผื่อเสียจริง (Production Formula)</span>
              <span className="text-[10px] font-mono text-slate-400">อิงตามใบสั่งงาน</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-800/80">
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">1. ยอดกล่องที่ลูกค้าสั่งผลิตสุทธิ:</span>
                <span className="font-mono font-bold text-white">{production.quantity.toLocaleString()} ชิ้น</span>
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-400">2. จำนวนตัวต่อแผ่น (Imposition Ups):</span>
                <span className="font-mono font-bold text-blue-400">{boxesPerSheet} ตัว/แผ่น</span>
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-400">3. จำนวนแผ่นพิมพ์สุทธิ (Net Sheets):</span>
                <span className="font-mono font-bold text-purple-300">
                  {netSheetsRequired.toLocaleString()} แผ่น
                </span>
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-400">4. เปอร์เซ็นต์เผื่อเสียทั้งระบบ (% Spoilage):</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  {spoilagePercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1.5 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/30">
                <span className="font-bold text-emerald-300">5. รวมแผ่นพิมพ์ที่ต้องเบิกตัดจริง (Gross Sheets):</span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {requiredSheetsGross.toLocaleString()} แผ่น (= {grossRequiredBoxes.toLocaleString()} ชิ้น)
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

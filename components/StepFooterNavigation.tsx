import React from 'react';
import { ArrowLeft, ArrowRight, Check, FileDown, Sliders, TrendingUp, FileText, FileSpreadsheet } from 'lucide-react';
import { MainWorkflowStep } from './WorkflowStepper';

interface StepFooterNavigationProps {
  currentStep: MainWorkflowStep;
  onSelectStep: (step: MainWorkflowStep) => void;
  onOpenQuotation?: () => void;
  onOpenSaveRevision?: () => void;
}

export const StepFooterNavigation: React.FC<StepFooterNavigationProps> = ({
  currentStep,
  onSelectStep,
  onOpenQuotation,
  onOpenSaveRevision,
}) => {
  if (currentStep === 'advisor') {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <button
          type="button"
          onClick={() => onSelectStep('step2_calculator')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าคำนวณต้นทุน (Step 2)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectStep('step3_tiers')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 transition-all"
        >
          <span>ไปหน้าตารางราคา (Step 3)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#111726] to-slate-900 border-2 border-slate-800 text-white shadow-xl">
      {/* Left Back Button */}
      <div>
        {currentStep === 'step2_calculator' && (
          <button
            type="button"
            onClick={() => onSelectStep('step1_presets')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>← ย้อนกลับ: เลือกสเปกกล่อง (Step 1)</span>
          </button>
        )}

        {currentStep === 'step3_tiers' && (
          <button
            type="button"
            onClick={() => onSelectStep('step2_calculator')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>← ย้อนกลับ: คำนวณต้นทุน & 3D (Step 2)</span>
          </button>
        )}

        {currentStep === 'step4_quotation' && (
          <button
            type="button"
            onClick={() => onSelectStep('step3_tiers')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>← ย้อนกลับ: ตารางราคาตามยอดสั่ง (Step 3)</span>
          </button>
        )}

        {currentStep === 'step1_presets' && (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>เลือกรายการที่ต้องการจากตารางด้านบน แล้วกดปุ่มขั้นตอนถัดไป</span>
          </div>
        )}
      </div>

      {/* Right Next Step Button */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {currentStep === 'step1_presets' && (
          <button
            type="button"
            onClick={() => onSelectStep('step2_calculator')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-98 transition-all border border-blue-400/40"
          >
            <Sliders className="w-4 h-4 text-blue-200" />
            <span>ขั้นตอนถัดไป: คำนวณต้นทุน & ดูแบบ 3D (Step 2)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {currentStep === 'step2_calculator' && (
          <button
            type="button"
            onClick={() => onSelectStep('step3_tiers')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-98 transition-all border border-blue-400/40"
          >
            <TrendingUp className="w-4 h-4 text-blue-200" />
            <span>ขั้นตอนถัดไป: ดูตารางราคาตามยอดสั่งผลิต (Step 3)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {currentStep === 'step3_tiers' && (
          <button
            type="button"
            onClick={() => onSelectStep('step4_quotation')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-98 transition-all border border-emerald-400/40"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>ขั้นตอนถัดไป: พิมพ์ใบเสนอราคา & บันทึกประวัติ (Step 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {currentStep === 'step4_quotation' && onOpenQuotation && (
          <button
            type="button"
            onClick={onOpenQuotation}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-98 transition-all border border-blue-400/40"
          >
            <FileDown className="w-4 h-4" />
            <span>พิมพ์ใบเสนอราคาแบบเต็ม (Full Screen Print)</span>
          </button>
        )}
      </div>
    </div>
  );
};

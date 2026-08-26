import React from 'react';
import {
  FileSpreadsheet,
  Sliders,
  TrendingUp,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Package,
} from 'lucide-react';

export type MainWorkflowStep =
  | 'step1_presets'
  | 'step2_calculator'
  | 'step3_tiers'
  | 'step4_quotation'
  | 'advisor';

interface WorkflowStepperProps {
  currentStep: MainWorkflowStep;
  onSelectStep: (step: MainWorkflowStep) => void;
  onOpenUserGuide?: () => void;
  activeBoxName: string;
  activeCustomerName: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  onSelectStep,
  onOpenUserGuide,
  activeBoxName,
  activeCustomerName,
}) => {
  const steps: {
    id: MainWorkflowStep;
    stepNo: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'step1_presets',
      stepNo: '1',
      title: 'เลือกสเปก & ราคาเดิม',
      subtitle: 'ตารางลูกค้าเดิม / แม่แบบโรงงาน',
      icon: FileSpreadsheet,
    },
    {
      id: 'step2_calculator',
      stepNo: '2',
      title: 'คำนวณต้นทุน & 3D',
      subtitle: 'ปรับขนาด, กระดาษ, BOM ละเอียด',
      icon: Sliders,
    },
    {
      id: 'step3_tiers',
      stepNo: '3',
      title: 'ตารางราคา & กำไร',
      subtitle: 'เปรียบเทียบยอด 1K - 100K ชิ้น',
      icon: TrendingUp,
    },
    {
      id: 'step4_quotation',
      stepNo: '4',
      title: 'ใบเสนอราคา & ประวัติ',
      subtitle: 'พิมพ์ใบเสนอราคา / บันทึกรอบ',
      icon: FileText,
    },
  ];

  const currentStepObj = steps.find((s) => s.id === currentStep);

  return (
    <div className="space-y-3">
      {/* Interactive 4-Step Stepper Bar */}
      <div className="bg-[#0f172a] rounded-2xl p-2 sm:p-2.5 border-2 border-slate-800 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone =
              (currentStep === 'step2_calculator' && index === 0) ||
              (currentStep === 'step3_tiers' && index <= 1) ||
              (currentStep === 'step4_quotation' && index <= 2);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(step.id)}
                className={`relative flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25 border-2 border-blue-400 ring-2 ring-blue-500/20'
                    : isDone
                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
                    : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 border border-slate-800/60'
                }`}
              >
                {/* Step Number Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm font-black'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span>{step.stepNo}</span>
                  )}
                </div>

                {/* Step Text Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-black truncate ${
                        isActive ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-300'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {step.subtitle}
                  </div>
                </div>

                {/* Arrow indicator between steps (for desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600 pointer-events-none">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow Step Helper & Context Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="font-bold text-white">
            {currentStep === 'step1_presets' && '📌 ขั้นตอนที่ 1: เลือกสเปกกล่องจากฐานราคาเดิม หรือเลือกแบบมาตรฐาน'}
            {currentStep === 'step2_calculator' && '📌 ขั้นตอนที่ 2: ตรวจสอบ/ปรับขนาด L×W×H, กระดาษ, พิมพ์ และดูต้นทุน BOM'}
            {currentStep === 'step3_tiers' && '📌 ขั้นตอนที่ 3: ตรวจสอบราคาขายตามยอดสั่ง (500 - 100,000 ใบ) และผลกำไร'}
            {currentStep === 'step4_quotation' && '📌 ขั้นตอนที่ 4: ตรวจสอบและพิมพ์ใบเสนอราคา (Quotation) หรือบันทึกรอบราคา'}
            {currentStep === 'advisor' && '📌 ผู้ช่วยประเมิน AI: วิเคราะห์ต้นทุนและให้คำแนะนำปรับปรุงราคา'}
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline truncate max-w-xs">
            กล่อง: <strong className="text-amber-300">{activeBoxName}</strong> ({activeCustomerName})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectStep('advisor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === 'advisor'
                ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-500/30'
                : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cost Advisor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

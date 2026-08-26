import React from 'react';
import {
  Package,
  Layers,
  FileText,
  TrendingUp,
  History,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sliders,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  AlertCircle,
  Zap,
  BookOpen,
  HelpCircle,
  Upload,
  Database,
  Mail,
  MessageSquare,
  X,
} from 'lucide-react';
import { Customer } from '../types';

interface EnterpriseSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeCustomer: Customer;
  onOpenCustomerSelect: () => void;
  onOpenHistory: () => void;
  onOpenQuotation: () => void;
  onOpenUserGuide?: () => void;
  onOpenDataImport?: () => void;
  onOpenQuickEmailQuote?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const EnterpriseSidebar: React.FC<EnterpriseSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  activeCustomer,
  onOpenCustomerSelect,
  onOpenHistory,
  onOpenQuotation,
  onOpenUserGuide,
  onOpenDataImport,
  onOpenQuickEmailQuote,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const navSections = [
    {
      label: '4-STEP WORKFLOW',
      items: [
        { id: 'step1_presets', label: '1. เลือกสเปก & ราคาเดิม', icon: FileSpreadsheet, badge: 'Step 1' },
        { id: 'step2_calculator', label: '2. คำนวณต้นทุน & 3D', icon: Sliders, badge: 'Step 2' },
        { id: 'step3_tiers', label: '3. ตารางราคา & กำไร', icon: TrendingUp, badge: 'Step 3' },
        { id: 'step4_quotation', label: '4. ใบเสนอราคา & ประวัติ', icon: FileText, badge: 'Step 4' },
      ],
    },
    {
      label: 'SMART TOOLS',
      items: [
        { id: 'advisor', label: 'ผู้ช่วย AI ประเมินต้นทุน', icon: Sparkles, badge: 'AI' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b0f19] text-slate-200">
      {/* Top Brand & Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        {(!collapsed || isMobileOpen) ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                PackCalc <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono font-bold border border-blue-500/30">PRO</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                Mobile Estimator
              </div>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
        )}

        {isMobileOpen ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ${
              collapsed ? 'hidden' : 'block'
            }`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Profile Card */}
      <div className="p-3 border-b border-slate-800/80">
        {(!collapsed || isMobileOpen) ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-300 font-black flex items-center justify-center text-xs border border-indigo-500/40 shrink-0">
              PK
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold text-white truncate">
                {activeCustomer?.contactPerson || 'Estimator Officer'}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{activeCustomer?.name || 'Standard Client'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-full bg-indigo-600/30 text-indigo-300 font-black flex items-center justify-center text-xs border border-indigo-500/40 cursor-pointer"
            title={activeCustomer?.name}
            onClick={onOpenCustomerSelect}
          >
            PK
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        
        {/* Quick Email & Mobile Estimator Action */}
        {onOpenQuickEmailQuote && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => {
                onOpenQuickEmailQuote();
                if (onMobileClose) onMobileClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 transition-all border border-blue-400/40"
              title="คิดราคาด่วนจากข้อความอีเมล / LINE"
            >
              <Zap className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
              {(!collapsed || isMobileOpen) && <span>⚡ คิดราคาด่วน (อีเมล/LINE)</span>}
            </button>
          </div>
        )}

        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {(!collapsed || isMobileOpen) && (
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 mb-1.5">
                {section.label}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onMobileClose) onMobileClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold border border-blue-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title={collapsed && !isMobileOpen ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {(!collapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Data & Tools Section */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          {(!collapsed || isMobileOpen) && (
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 mb-1.5">
              DATA CONVERTER
            </div>
          )}

          {onOpenDataImport && (
            <button
              type="button"
              onClick={() => {
                onOpenDataImport();
                if (onMobileClose) onMobileClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-500/20 transition-all"
              title="นำเข้า & แปลงไฟล์ Excel ลูกค้าเดิม"
            >
              <Upload className="w-4 h-4 shrink-0 text-emerald-400" />
              {(!collapsed || isMobileOpen) && <span>นำเข้าไฟล์ Excel ลูกค้า</span>}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenQuotation();
              if (onMobileClose) onMobileClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 border border-blue-500/20 transition-all"
            title="Quotation Preview"
          >
            <FileText className="w-4 h-4 shrink-0 text-blue-400" />
            {(!collapsed || isMobileOpen) && <span>Open Quotation</span>}
          </button>
        </div>
      </div>

      {/* Discreet User Guide at Bottom of Sidebar */}
      {onOpenUserGuide && (
        <div className="px-3 py-1.5 border-t border-slate-800/60 bg-[#080b13]/60">
          <button
            type="button"
            onClick={() => {
              onOpenUserGuide();
              if (onMobileClose) onMobileClose();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="คู่มือการใช้งานระบบ (User Guide)"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              {(!collapsed || isMobileOpen) && <span className="font-medium text-[11px]">คู่มือการใช้งาน</span>}
            </div>
            {(!collapsed || isMobileOpen) && (
              <span className="text-[10px] text-slate-500 font-mono">คู่มือ 4 ขั้นตอน</span>
            )}
          </button>
        </div>
      )}

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080b13]">
        {(!collapsed || isMobileOpen) ? (
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-300">Cost Engine: Ready</div>
              <div className="text-[10px] text-slate-500 font-mono">Mobile Sync Active</div>
            </div>
          </div>
        ) : (
          <div className="w-3 h-3 mx-auto rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0b0f19] border-r border-slate-800/80 transition-all duration-300 select-none z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs h-full bg-[#0b0f19] z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default EnterpriseSidebar;



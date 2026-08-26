import React, { useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  Package,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Zap,
  Sliders,
  Layers,
  CheckCircle2,
  HelpCircle,
  Database,
  Upload,
} from 'lucide-react';
import { Customer, BoxCategory, BoxPreset, CustomerBoxRecord } from '../types';
import { MASTER_BOX_PRESETS } from '../data/boxPresets';
import { CUSTOMER_LEGACY_DATASETS } from '../data/factory3SheetsData';

interface WelcomeCleanDashboardProps {
  customers: Customer[];
  activeCustomer: Customer;
  boxRecords: CustomerBoxRecord[];
  onSelectCustomer: (customer: Customer) => void;
  onStartNewBox: () => void;
  onSelectPreset: (preset: BoxPreset) => void;
  onSelectLegacyItem: (itemSpecs: any) => void;
  onOpenCustomerDirectory: () => void;
  onOpenDataImport?: () => void;
}

export const WelcomeCleanDashboard: React.FC<WelcomeCleanDashboardProps> = ({
  customers,
  activeCustomer,
  boxRecords,
  onSelectCustomer,
  onStartNewBox,
  onSelectPreset,
  onSelectLegacyItem,
  onOpenCustomerDirectory,
  onOpenDataImport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered items across customers, saved boxes, and presets
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCustomerSavedBoxes = boxRecords.filter((b) => b.customerId === activeCustomer.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Hero Workspace Clean Start Banner */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#111c38] to-[#0f172a] rounded-3xl border-2 border-blue-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center sm:text-left">
        
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ระบบคำนวณราคาและวางแผนสั่งตัดกระดาษผลิตกล่องอัจฉริยะ (Industrial Packaging Costing)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            เริ่มต้นคิดราคางานใหม่ หรือค้นหาดึงประวัติสเปกลูกค้าเดิม
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            หน้าต่างสะอาดพร้อมเริ่มงานทันที เลือกลูกค้าเพื่อดูประวัติราคาเดิม นำเข้าใบสั่งงาน (Job Ticket) คำนวณขนาดตัดกระดาษจริง หรือสร้างสเปกกล่องใหม่ได้ในคลิกเดียว
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartNewBox}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>➕ สร้างงานคิดราคาใหม่ (New Job / Custom Box)</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomerDirectory}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>🏢 ค้นหาฐานข้อมูลลูกค้า ({customers.length} บริษัท)</span>
            </button>

            {onOpenDataImport && (
              <button
                type="button"
                onClick={onOpenDataImport}
                className="px-5 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-black text-sm flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>📥 นำเข้า & แปลงไฟล์ Excel ลูกค้าเดิม (Auto Mapper)</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 2. Three Main Quick-Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Select Active Customer */}
        <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">เลือกลูกค้า & ดูชีตราคาเดิม</h3>
            <p className="text-xs text-slate-400">
              ลูกค้าปัจจุบัน: <strong className="text-amber-300">{activeCustomer.name}</strong> ({activeCustomerSavedBoxes.length} กล่องที่เคยบันทึก)
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400">ลูกค้ายอดนิยม:</div>
            <div className="flex flex-wrap gap-1.5">
              {customers.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCustomer(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    c.id === activeCustomer.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Box Shape Templates */}
        <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">แม่แบบทรงกล่องมาตรฐาน (Templates)</h3>
            <p className="text-xs text-slate-400">
              เลือกทรงกล่องยอดนิยม (ฝาเสียบหัวท้าย, ก้นขัด, ก้นออโต้, ลังลูกฟูก RSC, กล่องสไลด์) เพื่อเริ่มคำนวณ
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-1.5">
              {MASTER_BOX_PRESETS.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset(p)}
                  className="p-2 rounded-lg bg-slate-800/70 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-bold text-left truncate transition-colors"
                >
                  {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Real Factory Job Ticket Importer */}
        <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">คำนวณสั่งตัด & ออกใบสั่งงาน (Job Ticket)</h3>
            <p className="text-xs text-slate-400">
              คำนวณขนาดกางออก (Flat Blank), จำนวนอัปต่อแผ่น (8-Up), แผ่นพิมพ์รวม และออกใบสั่งงานผลิตจริง 1:1
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onStartNewBox}
              className="w-full py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-black transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>เข้าสู่หน้าคำนวณขนาดตัดกระดาษ</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};


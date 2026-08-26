import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Search,
  CheckCircle2,
  Table,
  Box as BoxIcon,
  Sliders,
  Layers,
  TrendingUp,
  History,
  Sparkles,
  FileText,
  Lock,
  Unlock,
  Building2,
  Printer,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Compass,
  FileSpreadsheet,
  Workflow,
  BookMarked,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'menumap' | 'workflows' | 'locking' | 'terms'>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div
        className="bg-[#0f172a] text-slate-100 rounded-2xl border-2 border-slate-700 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  คู่มือการใช้งานระบบคำนวณราคากล่อง (User Manual & Workflow Guide)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  v2.5 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">
                สรุปภาพรวมเมนู ขั้นตอนการทำงานจริง และคำอธิบายศัพท์เทคนิคงานพิมพ์บรรจุภัณฑ์
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section Tabs */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 pt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('quickstart')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t-2 ${
              activeSection === 'quickstart'
                ? 'bg-[#0f172a] text-amber-400 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>เริ่มต้นใช้งานด่วน (Quick Start)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('menumap')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t-2 ${
              activeSection === 'menumap'
                ? 'bg-[#0f172a] text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>แผนผังเมนู & หน้าที่ของแต่ละแท็บ (Menu Map)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('workflows')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t-2 ${
              activeSection === 'workflows'
                ? 'bg-[#0f172a] text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>สถานการณ์การใช้งานจริง (4 Common Workflows)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('locking')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t-2 ${
              activeSection === 'locking'
                ? 'bg-[#0f172a] text-indigo-400 border-indigo-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>ระบบล็อกราคา & Revision (Price Protection)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('terms')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t-2 ${
              activeSection === 'terms'
                ? 'bg-[#0f172a] text-purple-400 border-purple-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>พจนานุกรมศัพท์เทคนิคโรงพิมพ์ (Glossary)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* SECTION 1: QUICK START (4 EASY STEPS) */}
          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-transparent p-4 rounded-xl border border-amber-500/30">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>ขั้นตอนการคิดราคาและออกใบเสนอราคาอย่างง่าย (4 ขั้นตอนใน 2 นาที)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  ไม่จำเป็นต้องจำสูตรคำนวณทั้งหมด ระบบจะคิดค่ากระดาษ, ค่าพิมพ์, ค่าเคลือบ, ค่าไดคัท และกำไรให้อัตโนมัติ เพียงทำตาม 4 ขั้นตอนนี้:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border-2 border-slate-800 hover:border-amber-500/50 transition-all space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">CUSTOMER & TEMPLATE</span>
                  </div>
                  <h4 className="text-sm font-black text-white">เลือกลูกค้า & ชนิดกล่อง</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ที่แถบด้านบนสุด ให้เลือกลูกค้าที่ต้องการคิดราคา (หรือกดเพิ่มลูกค้าใหม่) จากนั้นเลือกทรงกล่องมาตรฐาน เช่น <strong>กล่องฝาเสียบหัว-ท้าย, ฝาก้นขัด, หรือฝาก้นล็อก</strong>
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border-2 border-slate-800 hover:border-cyan-500/50 transition-all space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">DIMENSIONS & 3D</span>
                  </div>
                  <h4 className="text-sm font-black text-white">กรอกขนาดกล่อง (ยาว × กว้าง × สูง มม.)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ใส่ขนาดสำเร็จ <strong className="text-emerald-400">L</strong> × <strong className="text-amber-400">W</strong> × <strong className="text-cyan-400">H</strong> ระบบจะวาดพิมพ์เขียวและคำนวณ <strong>ขนาดกางแผ่นพิมพ์ (Dieline Spread)</strong> ให้ทันที
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border-2 border-slate-800 hover:border-emerald-500/50 transition-all space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      3
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">PAPER & FINISHING</span>
                  </div>
                  <h4 className="text-sm font-black text-white">เลือกกระดาษ, ระบบพิมพ์ และงานเคลือบ</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    เลือกชนิดกระดาษ (อาร์ตการ์ด, กล่องแป้ง, คราฟท์) พร้อมแกรม และเลือกงานเคลือบ (เช่น เคลือบเงา UV, ด้าน, ปั๊มฟอยล์ทอง, ปั๊มนูน)
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border-2 border-slate-800 hover:border-purple-500/50 transition-all space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-purple-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      4
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">QUOTE & EXPORT</span>
                  </div>
                  <h4 className="text-sm font-black text-white">ตรวจสอบราคา & กดออกใบเสนอราคา</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ระบบจะคำนวณราคาต่อใบ (Cost/Box) และกำไรสุทธิ กดปุ่ม <strong className="text-amber-400">"ออกใบเสนอราคา (PDF)"</strong> เพื่อพิมพ์หรือส่งให้ลูกค้าทันที
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: MENU MAP & TAB BREAKDOWN */}
          {activeSection === 'menumap' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                ระบบแบ่งหน้าจอออกเป็น <strong>8 แท็บหลัก</strong> ตามลักษณะงานที่ต้องการใช้ ดังนี้:
              </p>

              <div className="space-y-3">
                {/* Tab 0: Factory 3 Sheets */}
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-blue-300">
                          0. ตารางราคาเดิมลูกค้า & เปรียบเทียบปรับราคา (Customer Legacy Benchmark)
                        </h4>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          MULTI-CUSTOMER
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ระบบจัดการตารางประวัติราคาเดิมรายลูกค้า (เช่น บริษัท นิโปร ที่มี 3 ชีต IFU / Duplex / Medical, คอลเกต, ยูนิลีเวอร์ ฯลฯ) เพื่อใช้เป็น <strong>Benchmark เปรียบเทียบกับต้นทุนจริงปัจจุบันจากสูตร BOM</strong> วิเคราะห์ผลต่างกำไร (Variance) และจำลองปรับราคายกชุดสำหรับลูกค้ารายนั้นๆ
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('factory_3sheets');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <span>ไปที่แท็บนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab 1 */}
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-400/20 text-amber-400 shrink-0">
                      <Table className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-amber-300">
                        1. ตารางคำนวณโรงงาน (Master Excel Sheet)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ตารางสรุปราคาแบบ Matrix หลายสเปกพร้อมกัน เหมือนไฟล์ Excel ของโรงงาน ค้นหา Part No. และกดซิงก์เข้าหน้าสเปกได้ใน 1 คลิก
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('excel_matrix');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-1"
                    >
                      <span>ไปที่แท็บนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab 2 */}
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-400/20 text-cyan-400 shrink-0">
                      <BoxIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-cyan-300">
                        2. 3D Visual Studio & พิมพ์เขียว CAD
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ดูโมเดลกล่อง 3 มิติ หมุน 360°, สลับดูภาพแปลนพิมพ์เขียวบอกขนาด L×W×H และแผ่นกางพิมพ์ (Dieline) พร้อมทดลองเปิด-ปิดฝากล่อง
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('3d_studio');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-1"
                    >
                      <span>ไปที่แท็บนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab 3 */}
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-400/20 text-blue-400 shrink-0">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-blue-300">
                        3. ปรับสเปก & ตารางเรทราคา (Rate Matrix & Specs)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        หัวใจหลักของการกำหนดสเปก: ปรับราคากระดาษ, ค่าเพลท, ค่าพิมพ์สี, ค่าเคลือบเงา/ด้าน, ค่าไดคัท และกำไร (Margin %)
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('specs');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-1"
                    >
                      <span>ไปที่แท็บนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab 4 */}
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-400/20 text-indigo-400 shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-indigo-300">
                        4. ต้นทุนแยกชิ้นส่วน (BOM Cost Sheet)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        แจกแจงโครงสร้างต้นทุน Bill of Materials ว่าราคา 1 ใบ ประกอบด้วยค่ากระดาษกี่บาท, ค่าพิมพ์กี่บาท, ค่าแปรรูปกี่บาท
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('bom');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-1"
                    >
                      <span>ไปที่แท็บนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab 5 */}
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-300">
                        5. เปรียบเทียบเรทจำนวนผลิต (Quantity Tiers)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ดูตารางเปรียบเทียบราคาตั้งแต่ 500, 1,000, 3,000 จนถึง 50,000 ใบ เพื่อนำไปเสนอทางเลือกลดต้นทุนต่อหน่วยให้ลูกค้า
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('tiers');
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-1"
                    >
                      <span>ไปที่แท็บนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab 6 & 7 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800">
                    <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-400" />
                      <span>6. ประวัติราคา & Revision</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ดูประวัติใบเสนอราคาที่เคยออกให้ลูกค้าเจ้านี้ ย้อนดูราคาเดิม และบันทึกเวอร์ชันใหม่ (Rev. 1, 2, 3)
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800">
                    <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>7. ผู้ช่วย AI วิเคราะห์ต้นทุน (AI Advisor)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ให้ AI ช่วยตรวจเช็กความคุ้มค่า เช่น แนะนำการวางเลย์แผ่นพิมพ์, ลด %Waste, หรือเลือกแกรมกระดาษที่ประหยัดงบ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: COMMON WORKFLOWS */}
          {activeSection === 'workflows' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Workflow 1 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>กรณีที่ 1: ลูกค้าขอราคาสำหรับกล่องสินค้าใหม่</span>
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>กดปุ่ม <strong>"+ สร้างกล่องใหม่"</strong> ที่แถบด้านบน</li>
                    <li>เลือกรูปทรงกล่อง และใส่ขนาด กว้าง × ยาว × สูง</li>
                    <li>ปรับจำนวนผลิตที่ลูกค้าต้องการ (เช่น 3,000 ใบ)</li>
                    <li>ตรวจสอบราคาต่อใบที่มุมขวาล่าง และกด <strong>"ออกใบเสนอราคา (PDF)"</strong></li>
                  </ol>
                </div>

                {/* Workflow 2 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-cyan-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>กรณีที่ 2: ลูกค้าเก่าสั่งผลิตซ้ำ (Re-order)</span>
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>เลือกลูกค้าในช่อง <strong>Active Customer</strong></li>
                    <li>คลิกเลือกกล่องเดิมในเมนู <strong>Active Box Record</strong></li>
                    <li>ระบบจะโหลดสเปกและราคาเดิมที่เคยตกลงกันไว้ทันที</li>
                    <li>กดปุ่ม <strong>"ออกใบเสนอราคา"</strong> ได้ทันทีโดยไม่ต้องคำนวณใหม่</li>
                  </ol>
                </div>

                {/* Workflow 3 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>กรณีที่ 3: เลือกเทียบราคาจาก Master Sheet โรงงาน</span>
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>ไปที่แท็บ <strong>"ตารางคำนวณโรงงาน"</strong></li>
                    <li>พิมพ์ค้นหา Part No. หรือชื่อกล่องในช่องค้นหา</li>
                    <li>กดปุ่ม <strong>"ซิงก์เข้าหน้าสเปก"</strong> ที่แถวกล่องนั้น</li>
                    <li>ระบบจะดึงมิติและราคามาใส่ในหน้าทำงานหลักให้ทันที</li>
                  </ol>
                </div>

                {/* Workflow 4 */}
                <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-purple-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>กรณีที่ 4: เสนอทางเลือกจำนวนเพื่อเพิ่มยอดขาย</span>
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>คลิกไปที่แท็บ <strong>"เปรียบเทียบเรทจำนวนผลิต"</strong></li>
                    <li>ดูราคาต่อหน่วยที่ลดลงเมื่อผลิตมากขึ้น (เช่น 1,000 ใบ = 8.5฿ vs 5,000 ใบ = 4.2฿)</li>
                    <li>ติ๊กเลือกเรทจำนวนที่ต้องการให้ปรากฏในใบเสนอราคา</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: LOCKING & REVISION EXPLANATION */}
          {activeSection === 'locking' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-300">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black text-white">
                    ทำไมระบบถึงควรล็อกราคาของลูกค้าไว้ (Price Protection & Integrity)?
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  เมื่อคุณโหลดข้อมูลกล่องของลูกค้าขึ้นมา ระบบจะช่วย **ปกป้องราคาเดิม** เพื่อป้องกันไม่ให้เผลอคลิกเปลี่ยนตัวเลข หรือเลื่อนเมาส์เปลี่ยนค่าแกรมกระดาษโดยไม่ตั้งใจ ซึ่งอาจทำให้ราคาคลาดเคลื่อนจากสัญญาที่เคยตกลงไว้
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#0b0f19] rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-bold block text-xs">🔒 โหมดล็อก (Locked)</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      เปิดดูข้อมูลและพิมพ์ใบเสนอราคาได้อย่างปลอดภัย ข้อมูลไม่ขยับแน่นอน
                    </p>
                  </div>

                  <div className="p-3 bg-[#0b0f19] rounded-lg border border-slate-800">
                    <span className="text-blue-400 font-bold block text-xs">🔓 ปลดล็อกแก้ไข (Unlock)</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      เมื่อต้องการปรับราคากระดาษหรือขนาดกล่อง ให้กดปลดล็อกเพื่อแก้ไข
                    </p>
                  </div>

                  <div className="p-3 bg-[#0b0f19] rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block text-xs">💾 บันทึกเป็น Rev ใหม่</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      เซฟเป็น Rev. 2, Rev. 3 เพื่อเก็บประวัติเปรียบเทียบราคาเก่า-ใหม่
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: GLOSSARY / PACKAGING TERMS */}
          {activeSection === 'terms' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-amber-400 block font-mono">Ups / Sheet (จำนวนตัวต่อแผ่น)</strong>
                  <p className="text-slate-300">
                    จำนวนชิ้นงานกล่องที่สามารถวางพิมพ์ได้ในกระดาษ 1 แผ่นใหญ่ ยิ่งวางได้เยอะ ต้นทุนกระดาษต่อใบจะยิ่งถูกลง
                  </p>
                </div>

                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-cyan-400 block font-mono">% Waste (อัตราเผื่อตัดเจียน/เผื่อเสีย)</strong>
                  <p className="text-slate-300">
                    เปอร์เซ็นต์กระดาษที่เผื่อสำหรับตั้งเครื่องพิมพ์ ตั้งเครื่องไดคัท และตัดเจียนขอบ (มาตรฐานอยู่ที่ 8% - 10%)
                  </p>
                </div>

                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-mono">GSM (แกรมกระดาษ / แกรมมาจ)</strong>
                  <p className="text-slate-300">
                    น้ำหนักกระดาษต่อ 1 ตารางเมตร บ่งบอกความหนาของกล่อง (เช่น 300g, 350g, 400g)
                  </p>
                </div>

                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-purple-400 block font-mono">Dieline Spread (ขนาดกางแผ่นพิมพ์)</strong>
                  <p className="text-slate-300">
                    ขนาดพื้นที่คลี่กางออกของกล่องรวมลิ้นกาวและฝาเสียบ ใช้สำหรับคำนวณขนาดกระดาษและทำบล็อกไดคัท
                  </p>
                </div>

                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-indigo-400 block font-mono">BOM (Bill of Materials)</strong>
                  <p className="text-slate-300">
                    ตารางแจกแจงต้นทุนวัตถุดิบและค่าแรงทุกขั้นตอนอย่างละเอียด เช่น ค่ากระดาษ, ค่าพิมพ์, ค่าเคลือบ, ค่าปะกาว
                  </p>
                </div>

                <div className="p-3.5 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-rose-400 block font-mono">Finishing (งานตกแต่งหลังพิมพ์)</strong>
                  <p className="text-slate-300">
                    กระบวนการเพิ่มความสวยงาม เช่น เคลือบเงา/ด้าน UV, ปั๊มฟอยล์ทอง/เงิน (Hot Stamping), ปั๊มนูน (Embossing)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>สามารถเปิดดูคู่มือนี้ได้ตลอดเวลาจากปุ่ม <strong>"คู่มือการใช้งาน"</strong> ด้านบน</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-colors shadow-md"
          >
            เข้าใจแล้ว / ปิดหน้าต่างคู่มือ
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuideModal;

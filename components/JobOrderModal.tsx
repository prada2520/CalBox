import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Scissors,
  CheckCircle2,
  Calendar,
  Building2,
  Layers,
  Sparkles,
  AlertTriangle,
  Download,
  Share2,
  X,
  Zap,
  Info,
  Clock,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  Customer,
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  CostBreakdown,
  BoxCategory,
} from '../types';
import { CutSheetOptimizationResult } from '../utils/cutSheetOptimizer';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface JobOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  boxName: string;
  category: BoxCategory;
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  costBreakdown: CostBreakdown;
  sheetOptimizer: CutSheetOptimizationResult;
}

export const JobOrderModal: React.FC<JobOrderModalProps> = ({
  isOpen,
  onClose,
  customer,
  boxName,
  category,
  dimensions,
  paper,
  printing,
  finishing,
  converting,
  production,
  costBreakdown,
  sheetOptimizer,
}) => {
  const [poNumber, setPoNumber] = useState('4503211405');
  const [itemCode, setItemCode] = useState('FG-CP-P15211904');
  const [machineNo, setMachineNo] = useState('HB-8-01 (Offset 6 Colors)');
  const [jobOrderNo] = useState(() => `24${Math.floor(10000 + Math.random() * 90000)}`);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear() + 543}`;
  }, []);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const safeBox = boxName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    const fileName = `JobOrder_${jobOrderNo}_${safeBox}.pdf`;

    const success = await downloadElementAsPdf({
      elementId: 'printable-job-ticket-document',
      fileName,
      title: `ใบสั่งงานผลิต ${boxName}`,
    });

    setIsGeneratingPdf(false);
    if (success) {
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Action Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>ใบสั่งงานผลิตจริง (Factory Job Ticket)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold">
                  #{jobOrderNo}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                จำลองและออกใบสั่งงานผลิตมาตรฐานโรงพิมพ์ 1:1 ถอดแบบจากข้อมูลจริง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all animate-pulse"
              title="ดาวน์โหลดไฟล์ PDF คุณภาพสูงลงเครื่องทันที"
            >
              {isGeneratingPdf ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>ดาวน์โหลด PDF สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>บันทึก PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold items-center gap-2 border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Job Ticket Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 text-slate-900 font-sans print:p-0 print:bg-white">
          
          <div id="printable-job-ticket-document" className="bg-white border-2 border-slate-800 rounded-xl p-6 shadow-md max-w-3xl mx-auto space-y-4 print:border-none print:shadow-none">
            
            {/* 1. Header Box */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <div className="text-xs font-black tracking-widest text-slate-600 uppercase">
                  บริษัท โรงพิมพ์สยามแพคเกจจิ้ง (1994) จำกัด
                </div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                  ใบสั่งงาน (JOB ORDER)
                </h1>
                <div className="text-xs text-slate-700 mt-1 space-y-0.5">
                  <div><strong>ชื่อลูกค้า:</strong> {customer.name} ({customer.code})</div>
                  <div><strong>รหัสสินค้า (Item Code):</strong> <span className="font-mono">{itemCode}</span></div>
                  <div><strong>ชื่อสินค้า:</strong> {boxName}</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs text-slate-600 font-mono">เลขที่ใบสั่งงาน:</div>
                <div className="text-2xl font-black text-amber-800 font-mono tracking-wider">
                  *{jobOrderNo}*
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <div><strong>วันที่บันทึก:</strong> {todayStr}</div>
                  <div><strong>วันที่กำหนดส่ง:</strong> {deliveryDate}</div>
                  <div><strong>แท่นพิมพ์:</strong> <span className="font-mono font-bold text-blue-700">{machineNo}</span></div>
                </div>
              </div>
            </div>

            {/* 2. Target Quantities Summary */}
            <div className="grid grid-cols-4 gap-2 bg-amber-50/80 p-3 rounded-lg border border-amber-300 text-center">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">จำนวนส่งมอบจริง</div>
                <div className="text-base font-black text-slate-950 font-mono">
                  {production.quantity.toLocaleString()} ชิ้น
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">การวางเลย์เอาต์ (Ups)</div>
                <div className="text-base font-black text-blue-800 font-mono">
                  {sheetOptimizer.boxesPerSheet} ตัว/แผ่น ({sheetOptimizer.orientation})
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">จำนวนแผ่นพิมพ์รวม</div>
                <div className="text-base font-black text-purple-800 font-mono">
                  {sheetOptimizer.requiredSheetsGross.toLocaleString()} แผ่น
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">% เผื่อเสีย (Wastage)</div>
                <div className="text-base font-black text-emerald-700 font-mono">
                  {sheetOptimizer.spoilagePercentage}%
                </div>
              </div>
            </div>

            {/* 3. Detailed Step-by-Step Production Routing (6 ขั้นตอนตามใบสั่งงานจริง) */}
            <div className="border-2 border-slate-900 rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white px-3 py-1.5 text-xs font-black tracking-wide flex items-center justify-between">
                <span>รายละเอียดขั้นตอนการผลิต (PRODUCTION ROUTING)</span>
                <span className="font-mono">PO: {poNumber}</span>
              </div>

              <div className="divide-y divide-slate-300 text-xs text-slate-900">
                
                {/* ขั้นที่ 1: ตัดกระดาษ */}
                <div className="p-3 bg-white space-y-1">
                  <div className="font-black text-slate-950 flex items-center justify-between">
                    <span className="text-blue-900">ขั้นที่ 1: แผนกตัดกระดาษ (Paper Cutting)</span>
                    <span className="text-[11px] font-mono text-slate-600">
                      ตัดได้: {sheetOptimizer.boxesPerSheet} แบบ / แผ่น
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <strong>ชนิดกระดาษ:</strong> {paper.materialType} {paper.gsm}g
                    </div>
                    <div>
                      <strong>ขนาดตัดจริง:</strong> <span className="font-mono font-bold bg-yellow-200 px-1 rounded">{sheetOptimizer.sheetWidthInch} × {sheetOptimizer.sheetLengthInch} นิ้ว</span> ({sheetOptimizer.sheetWidthMm.toFixed(0)} × {sheetOptimizer.sheetLengthMm.toFixed(0)} mm)
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 bg-slate-100 p-1.5 rounded flex items-center justify-between">
                    <span>
                      จำนวนแผ่นตัด: <strong>{sheetOptimizer.requiredSheetsGross.toLocaleString()} แผ่น</strong> × {sheetOptimizer.boxesPerSheet} ตัว = <strong>{sheetOptimizer.grossRequiredBoxes.toLocaleString()} กล่อง</strong>
                    </span>
                    <span className="text-emerald-700 font-bold">
                      Wastage เผื่อเสีย: {sheetOptimizer.spoilagePercentage}% (สุทธิ {production.quantity.toLocaleString()} ชิ้น)
                    </span>
                  </div>
                </div>

                {/* ขั้นที่ 2: พิมพ์ */}
                <div className="p-3 bg-slate-50 space-y-1">
                  <div className="font-black text-slate-950 flex items-center justify-between">
                    <span className="text-blue-900">ขั้นที่ 2: แผนกพิมพ์ออฟเซ็ต (Offset Printing)</span>
                    <span className="font-mono text-slate-600">แท่น: {machineNo}</span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>ระบบพิมพ์:</strong> พิมพ์ {printing.type === 'offset_cmyk' ? '4 สี CMYK' : 'ตามสเปก'}
                    {printing.pantoneColorsCount > 0 && ` + ${printing.pantoneColorsCount} สีพิเศษ (เช่น CP RED, REFLEX BLUE)`}
                    {finishing.coatingType !== 'none' && ` + ${finishing.coatingType.toUpperCase()} ขัดเงา Waterbase`}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>รายการหมึก/เพลท:</strong> Black GS, Cyan, Magenta, Yellow {printing.pantoneColorsCount > 0 ? '+ Spot Colors' : ''} (เพลทพร้อมตรวจเช็ค)
                  </div>
                </div>

                {/* ขั้นที่ 3-6: หลังพิมพ์ */}
                <div className="p-3 bg-white space-y-2">
                  <div className="font-black text-slate-950 text-blue-900">
                    ขั้นตอนหลังพิมพ์ (Post-Press & Converting)
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">
                      <div className="font-bold text-slate-900">ขั้นที่ 3: ขัดเงา/เคลือบ</div>
                      <div className="text-slate-600 mt-0.5">
                        {finishing.coatingType !== 'none' ? finishing.coatingType : 'ไม่เคลือบ'}
                        {finishing.hasSpotUv && ' + Spot UV'}
                        {finishing.hasFoilStamping && ' + ฟอยล์เคทอง'}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-100 border border-slate-200">
                      <div className="font-bold text-slate-900">ขั้นที่ 4: ปั๊มไดคัท (Die-cut)</div>
                      <div className="text-slate-600 mt-0.5 font-mono">
                        บล็อก {category.toUpperCase()} {sheetOptimizer.boxesPerSheet} ตัว/บล็อก
                        {finishing.hasEmbossing && ' + ปั๊มนูน'}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-100 border border-slate-200">
                      <div className="font-bold text-slate-900">ขั้นที่ 5: ติดกาว (Gluing)</div>
                      <div className="text-slate-600 mt-0.5">
                        {converting.gluingType === 'auto_side' ? 'ปะกาวข้างอัตโนมัติ' : converting.gluingType}
                        {converting.hasWindowPatching && ' + ปะหน้าต่างฟิล์ม'}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-100 border border-slate-200">
                      <div className="font-bold text-slate-900">ขั้นที่ 6: บรรจุ (Packing)</div>
                      <div className="text-slate-600 mt-0.5">
                        มัดละ 50/100 ใบ บรรจุกล่องลูกฟูก รัดสายพร้อมส่ง
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 4. Inspection & Sign-off Block */}
            <div className="pt-2 border-t border-slate-300 grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2 border border-slate-300 rounded space-y-4">
                <div className="font-bold text-slate-700">ผู้ออกใบสั่งงาน</div>
                <div className="border-b border-dotted border-slate-400 pb-1 text-slate-500">
                  ฝ่ายขาย / ประมาณราคา
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{todayStr}</div>
              </div>

              <div className="p-2 border border-slate-300 rounded space-y-4">
                <div className="font-bold text-slate-700">ตรวจสอบสเปก</div>
                <div className="border-b border-dotted border-slate-400 pb-1 text-slate-500">
                  หัวหน้าแผนกวางแผน
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{todayStr}</div>
              </div>

              <div className="p-2 border border-slate-300 rounded space-y-4">
                <div className="font-bold text-slate-700">ความพร้อมกระดาษ/เพลท</div>
                <div className="border-b border-dotted border-slate-400 pb-1 text-slate-500">
                  [✓] กระดาษ [✓] เพลท
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{todayStr}</div>
              </div>

              <div className="p-2 border border-slate-300 rounded space-y-4">
                <div className="font-bold text-slate-700">ผู้อนุมัติผลิต</div>
                <div className="border-b border-dotted border-slate-400 pb-1 text-slate-500">
                  ผู้จัดการโรงงาน
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{todayStr}</div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

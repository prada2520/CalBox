import React, { useState } from 'react';
import {
  CostBreakdown,
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  QuantityTier,
  Customer,
} from '../types';
import { Printer, X, CheckCircle2, FileSpreadsheet, Building2, User, Phone, Mail, ShieldCheck, Download, Loader2, Check } from 'lucide-react';
import { exportCostingToExcel } from '../utils/exportUtils';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  boxName: string;
  categoryName: string;
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  result: CostBreakdown;
  tiers: QuantityTier[];
}

const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  customer,
  boxName,
  categoryName,
  dimensions,
  paper,
  printing,
  finishing,
  converting,
  production,
  result,
  tiers,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  if (!isOpen) return null;

  const quoteNo = `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const todayStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const safeCustomer = customer ? customer.name.replace(/[^a-zA-Z0-9ก-๙]/g, '_') : 'General';
    const safeBox = boxName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    const fileName = `Quotation_${quoteNo}_${safeCustomer}_${safeBox}.pdf`;

    const success = await downloadElementAsPdf({
      elementId: 'printable-quotation-document',
      fileName,
      title: `ใบเสนอราคา ${boxName}`,
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

  const handleExportExcel = () => {
    exportCostingToExcel({
      customer,
      boxName,
      categoryName,
      dimensions,
      paper,
      printing,
      finishing,
      converting,
      production,
      result,
      tiers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-xs sm:text-sm">ใบเสนอราคาบรรจุภัณฑ์ (Official Quotation)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">ส่งออก Excel (.xlsx)</span>
              <span className="sm:hidden">Excel</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white text-xs font-bold shadow-xs transition-all animate-pulse"
              title="ดาวน์โหลดไฟล์ PDF คุณภาพสูงลงเครื่องทันที"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="พิมพ์ผ่านเครื่องพิมพ์"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Content */}
        <div id="printable-quotation-document" className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-6 text-slate-800 font-sans bg-white">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                โรงพิมพ์ & บรรจุภัณฑ์ PackCalc Niyomkij
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ผู้นำด้านการผลิตกล่องบรรจุภัณฑ์ กล่องลูกฟูก และสื่อสิ่งพิมพ์ครบวงจร
              </p>
              <p className="text-xs text-slate-500">
                โทร: 02-555-0199 | Email: sales@packcalc-niyomkij.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                ใบเสนอราคา / QUOTATION
              </span>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                เลขที่: <span className="font-semibold text-slate-900">{quoteNo}</span>
              </p>
              <p className="text-xs text-slate-500">
                วันที่: <span className="font-semibold text-slate-900">{todayStr}</span>
              </p>
            </div>
          </div>

          {/* Customer & Job Info Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                ข้อมูลลูกค้า (Customer Details)
              </span>
              <p className="font-semibold text-slate-800 text-sm">
                {customer ? customer.name : 'ลูกค้าทั่วไป'}
              </p>
              {customer?.code && (
                <p className="text-slate-500 font-mono">รหัสลูกค้า: {customer.code}</p>
              )}
              {customer?.contactPerson && (
                <p className="text-slate-600">ผู้ติดต่อ: {customer.contactPerson}</p>
              )}
              {customer?.phone && (
                <p className="text-slate-600">โทร: {customer.phone} {customer.email ? `| Email: ${customer.email}` : ''}</p>
              )}
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-sm">รายละเอียดงาน & มิติกล่อง (Job & Dimension Details)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <p><span className="text-slate-500">ชื่องาน:</span> <span className="font-bold text-slate-900">{boxName}</span></p>
                  <p><span className="text-slate-500">ขนาดพับสำเร็จ:</span> <span className="font-mono font-bold text-indigo-700">{dimensions.length} × {dimensions.width} × {dimensions.height} มม.</span></p>
                  <p><span className="text-slate-500">วัสดุกระดาษ:</span> <span className="font-medium">{paper.materialType} ({paper.gsm} GSM)</span></p>
                  <p><span className="text-slate-500">ระบบพิมพ์ & เคลือบ:</span> <span className="font-medium">{printing.type.toUpperCase()} • {finishing.coatingType}</span></p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ความจุ: ~{Math.round((dimensions.length * dimensions.width * dimensions.height) / 1000)} cc | กางแผ่น: {Math.round(result.spreadWidthMm)}×{Math.round(result.spreadHeightMm)} mm
                  </p>
                </div>

                {/* Illustrated Mini Isometric Blueprint */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 160 100" className="w-full max-w-[140px] h-auto">
                    {/* Top Face */}
                    <polygon points="80,18 120,32 80,46 40,32" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
                    {/* Right Face (L) */}
                    <polygon points="80,46 120,32 120,74 80,88" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
                    {/* Left Face (W) */}
                    <polygon points="80,46 40,32 40,74 80,88" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
                    {/* Labels */}
                    <text x="106" y="64" fill="#0f172a" fontSize="7.5" fontWeight="bold" fontFamily="monospace">L:{dimensions.length}</text>
                    <text x="54" y="64" fill="#0f172a" fontSize="7.5" fontWeight="bold" fontFamily="monospace">W:{dimensions.width}</text>
                    <text x="130" y="55" fill="#2563eb" fontSize="7.5" fontWeight="bold" fontFamily="monospace">H:{dimensions.height}</text>
                  </svg>
                  <span className="text-[9px] text-slate-500 font-mono">ยาว {dimensions.length} × กว้าง {dimensions.width} × สูง {dimensions.height} mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Table (Primary Volume) */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. สรุปราคาตามยอดสั่งผลิตที่เลือก (Primary Order)</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">รายการ</th>
                    <th className="py-2.5 px-3 text-right">จำนวนสั่ง (ใบ)</th>
                    <th className="py-2.5 px-3 text-right">ราคาต่อใบ (บาท)</th>
                    <th className="py-2.5 px-3 text-right">ยอดรวมทั้งสิ้น (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="font-medium">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{boxName}</div>
                      <div className="text-[11px] text-slate-500">
                        {dimensions.length}×{dimensions.width}×{dimensions.height} มม. | {paper.materialType} {paper.gsm}g | {printing.type}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {production.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700 text-sm">
                      {result.sellingPricePerUnit.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {result.totalOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-Tier Quantity Option Table */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. ตารางเปรียบเทียบราคาตามจำนวน (Volume Pricing Options)</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">จำนวน (ใบ)</th>
                    <th className="py-2 px-3 text-right">ราคาต่อใบ (บาท)</th>
                    <th className="py-2 px-3 text-right">ยอดรวมสุทธิ (บาท)</th>
                    <th className="py-2 px-3 text-center">ความคุ้มค่า</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {tiers.map((t) => {
                    const isSelected = t.quantity === production.quantity;
                    return (
                      <tr key={t.quantity} className={isSelected ? 'bg-indigo-50/50 font-bold' : ''}>
                        <td className="py-2 px-3">
                          {t.quantity.toLocaleString()} ใบ {isSelected && ' (ยอดที่เลือก)'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-indigo-700">
                          {t.suggestedPricePerUnit.toFixed(2)} ฿
                        </td>
                        <td className="py-2 px-3 text-right text-slate-900">
                          {t.totalOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </td>
                        <td className="py-2 px-3 text-center font-sans text-[11px] text-emerald-600">
                          {t.quantity >= 5000 ? '⭐ ประหยัดสูงสุด' : t.quantity >= 2000 ? 'ประหยัดดี' : 'ปกติ'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions & Signature */}
          <div className="border-t border-slate-200 pt-4 space-y-4 text-[11px] text-slate-500">
            <div>
              <span className="font-bold text-slate-700 block mb-1">เงื่อนไขการสั่งผลิต:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>ราคายังไม่รวมภาษีมูลค่าเพิ่ม (VAT 7%)</li>
                <li>ระยะเวลาผลิตประมาณ 7-14 วันทำการหลังยืนยันแบบ Proof และลงนามใบสั่งซื้อ</li>
                <li>เงื่อนไขการชำระเงิน: มัดจำ 50% เมื่อสั่งผลิต และชำระส่วนที่เหลือก่อนส่งมอบสินค้า</li>
                <li>ใบเสนอราคานี้มีผลบังคับใช้ 30 วันนับจากวันที่ออกเอกสาร</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="border-t border-slate-300 pt-2">
                <p className="font-semibold text-slate-800">ผู้จัดทำใบเสนอราคา</p>
                <p className="text-slate-400 mt-6">( ............................................................ )</p>
                <p className="text-[10px] text-slate-400 mt-1">วันที่ ..... / ..... / .........</p>
              </div>

              <div className="border-t border-slate-300 pt-2">
                <p className="font-semibold text-slate-800">ผู้อนุมัติสั่งซื้อ (ลูกค้า)</p>
                <p className="text-slate-400 mt-6">( ............................................................ )</p>
                <p className="text-[10px] text-slate-400 mt-1">วันที่ ..... / ..... / .........</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuotationModal;

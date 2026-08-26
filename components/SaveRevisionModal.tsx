import React, { useState } from 'react';
import { Customer, CostBreakdown, ProductionSpecs } from '../types';
import { Save, Sparkles, Tag, ArrowUpRight, ArrowDownRight, CheckCircle2, X } from 'lucide-react';

interface SaveRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  currentBoxName: string;
  result: CostBreakdown;
  production: ProductionSpecs;
  onConfirmSave: (boxName: string, reason: string) => void;
}

const QUICK_REASONS = [
  '📈 ราคากระดาษในตลาดปรับขึ้น (+5-10%)',
  '📉 ลูกค้าร้องขอส่วนลดพิเศษสั่งผลิตล็อตใหญ่',
  '✨ ปรับเปลี่ยนสเปกงานเคลือบ/ตกแต่งผิวใหม่',
  '📐 ปรับขนาดและสัดส่วนกล่องตามสินค้าจริง',
  '🎁 ราคาโปรโมชั่นพิเศษประจำไตรมาส',
  '🏷️ ราคาเสนอครั้งแรก (Initial Quotation)',
];

const SaveRevisionModal: React.FC<SaveRevisionModalProps> = ({
  isOpen,
  onClose,
  customer,
  currentBoxName,
  result,
  production,
  onConfirmSave,
}) => {
  const [boxName, setBoxName] = useState(currentBoxName);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boxName.trim()) return;
    onConfirmSave(boxName.trim(), reason.trim() || 'บันทึกราคาปกติ');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-800 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                บันทึกประวัติการทำราคา (Save Price Revision)
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกเข้าสู่ประวัติของลูกค้า: <span className="font-semibold text-slate-700">{customer.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Snapshot Card */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs grid grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500 block text-[11px]">ยอดผลิตคำนวณ</span>
            <span className="font-bold font-mono text-slate-900">{production.quantity.toLocaleString()} ใบ</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">ราคาเสนอขาย/ใบ</span>
            <span className="font-bold font-mono text-indigo-700 text-sm">
              {result.sellingPricePerUnit.toFixed(2)} บาท
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">ต้นทุนรวมเฉลี่ย/ใบ</span>
            <span className="font-mono text-slate-800">{result.totalCostPerUnit.toFixed(2)} บาท</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">กำไรรวมทั้งออเดอร์</span>
            <span className="font-mono text-emerald-600 font-bold">
              +{result.totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Box Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่องาน / ชื่อกล่อง <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              placeholder="เช่น กล่องยาสีฟัน 150g, ลังลูกฟูก 40x30x25cm"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Revision Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>เหตุผลในการทำราคา / ปรับราคา (Reason for Revision)</span>
              <span className="text-[11px] font-normal text-indigo-600">สำคัญสำหรับใช้อ้างอิงประวัติ</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น ราคากระดาษ KA ปรับขึ้น 5%, ลูกค้าขอส่วนลดสั่ง 10,000 ใบ, ปรับเปลี่ยนงานเคลือบ"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Quick Reason Chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">คลิกเพื่อเลือกเหตุผลด่วน:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REASONS.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReason(r.replace(/^[^\s]+\s/, ''))}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors border border-slate-200"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              ยืนยันบันทึกประวัติ Revision
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SaveRevisionModal;

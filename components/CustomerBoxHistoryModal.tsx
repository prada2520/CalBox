import React, { useState } from 'react';
import { Customer, CustomerBoxRecord, PriceRevision } from '../types';
import {
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  Download,
  FileSpreadsheet,
  Printer,
  X,
  CheckCircle2,
  GitCompare,
  RotateCcw,
  Sparkles,
  DollarSign,
  Tag,
  Building2,
} from 'lucide-react';
import { exportCostingToExcel } from '../utils/exportUtils';

interface CustomerBoxHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  records: CustomerBoxRecord[];
  onLoadRevision: (revision: PriceRevision) => void;
}

const CustomerBoxHistoryModal: React.FC<CustomerBoxHistoryModalProps> = ({
  isOpen,
  onClose,
  customer,
  records,
  onLoadRevision,
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string>(records[0]?.id || '');
  const [compareRevIds, setCompareRevIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare_side_by_side' | 'volume_tiers_comparison'>('timeline');

  if (!isOpen) return null;

  const currentRecord = records.find((r) => r.id === selectedBoxId) || records[0];
  const revisions = currentRecord ? currentRecord.revisions : [];

  const toggleCompareRev = (revId: string) => {
    if (compareRevIds.includes(revId)) {
      setCompareRevIds(compareRevIds.filter((id) => id !== revId));
    } else {
      if (compareRevIds.length >= 3) {
        setCompareRevIds([...compareRevIds.slice(1), revId]);
      } else {
        setCompareRevIds([...compareRevIds, revId]);
      }
    }
  };

  // Selected revisions for comparison
  const comparedRevisions = revisions.filter((r) =>
    compareRevIds.length > 0 ? compareRevIds.includes(r.id) : true
  );

  const handleExportHistoryToExcel = () => {
    if (!currentRecord || revisions.length === 0) return;
    const latest = revisions[revisions.length - 1];
    exportCostingToExcel({
      customer,
      boxName: currentRecord.boxName,
      categoryName: currentRecord.boxCategory,
      dimensions: latest.dimensions,
      paper: latest.paper,
      printing: latest.printing,
      finishing: latest.finishing,
      converting: latest.converting,
      production: latest.production,
      result: latest.result,
      tiers: latest.quantityTiers,
      revisions: revisions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/40 text-indigo-300 border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  ประวัติการทำราคา & บันทึกเหตุผลการปรับราคา
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                  {customer.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ลูกค้า: <span className="text-white font-medium">{customer.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportHistoryToExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="ส่งออกประวัติและราคาเป็น Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ส่งออก Excel</span>
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

        {/* Box Tabs Selector (Filtered strictly for this customer) */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-slate-600 px-1 whitespace-nowrap">
              รายการกล่อง ({records.length}):
            </span>
            {records.map((r) => {
              const isSelected = r.id === (currentRecord?.id || '');
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedBoxId(r.id);
                    setCompareRevIds([]);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{r.boxName}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                    {r.revisions.length} revs
                  </span>
                </button>
              );
            })}
            {records.length === 0 && (
              <span className="text-xs text-slate-400">ยังไม่มีประวัติกล่องสำหรับลูกค้ารายนี้</span>
            )}
          </div>

          {/* View Tab Buttons */}
          <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ไทม์ไลน์
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compare_side_by_side')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'compare_side_by_side'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เปรียบเทียบ Revisions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('volume_tiers_comparison')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'volume_tiers_comparison'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เปรียบเทียบตามยอดผลิต
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: TIMELINE VIEW */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    ประวัติไทม์ไลน์การปรับราคา: {currentRecord?.boxName || '-'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    บันทึกการปรับราคาและเหตุผลความจำเป็นในการปรับราคาย้อนหลัง
                  </p>
                </div>
              </div>

              {revisions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                  ยังไม่มีประวัติการทำราคาสำหรับกล่องนี้ กดปุ่ม "บันทึกประวัติการทำราคา" ที่หน้าหลักเพื่อบันทึก
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
                  {revisions.slice().reverse().map((rev, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={rev.id} className="relative group">
                        {/* Timeline Node Icon */}
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            isLatest
                              ? 'bg-indigo-600 border-white text-white ring-4 ring-indigo-100 shadow-xs'
                              : 'bg-white border-slate-400 text-slate-600'
                          }`}
                        >
                          {rev.revisionNo}
                        </div>

                        {/* Revision Card */}
                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isLatest
                              ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-indigo-900 px-2 py-0.5 bg-indigo-100 rounded-md">
                                Revision {rev.revisionNo}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {rev.formattedDate}
                              </span>
                              {isLatest && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                  ราคาปัจจุบัน (Latest)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Price Diff Badge */}
                              {rev.priceDiffFromPrevious !== undefined && (
                                <div
                                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                                    rev.priceDiffFromPrevious > 0
                                      ? 'bg-rose-100 text-rose-800'
                                      : rev.priceDiffFromPrevious < 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {rev.priceDiffFromPrevious > 0 ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : rev.priceDiffFromPrevious < 0 ? (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  ) : null}
                                  <span>
                                    {rev.priceDiffFromPrevious > 0 ? '+' : ''}
                                    {rev.priceDiffFromPrevious.toFixed(2)} ฿ / ใบ ({rev.percentDiffFromPrevious && rev.percentDiffFromPrevious > 0 ? '+' : ''}{rev.percentDiffFromPrevious}%)
                                  </span>
                                </div>
                              )}

                              {/* Load Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  onLoadRevision(rev);
                                  onClose();
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                ดึงสเปกนี้มาใช้
                              </button>
                            </div>
                          </div>

                          {/* REASON HIGHLIGHT (Requested Feature) */}
                          <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200/80 shadow-2xs">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-amber-900 shrink-0 flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-amber-600" />
                                เหตุผลในการปรับราคา:
                              </span>
                              <span className="text-xs text-slate-800 font-medium leading-relaxed">
                                {rev.reason}
                              </span>
                            </div>
                          </div>

                          {/* Snapshot Specs Table */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 block">ขนาดกล่อง</span>
                              <span className="font-semibold text-slate-800 font-mono">
                                {rev.dimensions.length}×{rev.dimensions.width}×{rev.dimensions.height} mm
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">ชนิดกระดาษ / แกรม</span>
                              <span className="font-semibold text-slate-800 truncate block">
                                {rev.paper.materialType} ({rev.paper.gsm} GSM)
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">ยอดสั่งคำนวณ</span>
                              <span className="font-semibold text-slate-800 font-mono">
                                {rev.production.quantity.toLocaleString()} ใบ
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">ราคาขายที่เสนอ</span>
                              <span className="font-bold text-indigo-700 font-mono text-sm">
                                {rev.sellingPrice.toFixed(2)} บาท/ใบ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIDE-BY-SIDE REVISION COMPARISON */}
          {activeTab === 'compare_side_by_side' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <GitCompare className="w-4 h-4 text-indigo-600" />
                    ตารางเปรียบเทียบต้นทุนข้าม Revisions
                  </h4>
                  <p className="text-xs text-slate-500">
                    เปรียบเทียบสเปก กระดาษ ค่าพิมพ์ งานเคลือบ และราคาต่อใบของแต่ละรอบการปรับราคา
                  </p>
                </div>

                {/* Compare Checkboxes Selector */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-slate-500">เลือกเปรียบเทียบ:</span>
                  {revisions.map((rev) => {
                    const isChecked = compareRevIds.length === 0 || compareRevIds.includes(rev.id);
                    return (
                      <button
                        key={rev.id}
                        type="button"
                        onClick={() => toggleCompareRev(rev.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Rev {rev.revisionNo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-48">รายการองค์ประกอบ / สเปก</th>
                      {comparedRevisions.map((rev) => (
                        <th key={rev.id} className="py-3 px-3 min-w-[200px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-900">Revision {rev.revisionNo}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{rev.formattedDate}</span>
                          </div>
                          <div className="text-[11px] text-amber-700 font-normal mt-0.5 line-clamp-1">
                            {rev.reason}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Reason */}
                    <tr className="bg-amber-50/40 font-medium">
                      <td className="py-2.5 px-3 text-slate-800">เหตุผลการปรับราคา</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 text-amber-900 text-xs">
                          {r.reason}
                        </td>
                      ))}
                    </tr>

                    {/* Quantity */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">จำนวนสั่งผลิตหลัก</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {r.production.quantity.toLocaleString()} ใบ
                        </td>
                      ))}
                    </tr>

                    {/* Paper */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">ชนิดกระดาษ / แกรม</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 text-slate-800">
                          {r.paper.materialType} ({r.paper.gsm} GSM) @ {r.paper.pricePerUnit} บ.
                        </td>
                      ))}
                    </tr>

                    {/* Material Cost / Unit */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">1. ค่ากระดาษต่อใบ</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                          {(r.result?.materialCostPerUnit ?? r.unitCost ?? 0).toFixed(2)} ฿
                        </td>
                      ))}
                    </tr>

                    {/* Printing */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">2. งานพิมพ์ & แม่พิมพ์</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 text-slate-800">
                          {r.printing?.type ? r.printing.type.toUpperCase() : 'OFFSET'} (เพลท {r.printing?.plateFixedCost ?? 0} ฿ + ค่าแรง {r.printing?.printCostPerUnit ?? 0} ฿)
                        </td>
                      ))}
                    </tr>

                    {/* Finishing */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">3. งานเคลือบผิว & ตกแต่ง</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 text-slate-800">
                          {r.finishing?.coatingType || 'none'}
                          {r.finishing?.hasSpotUv ? ' + สปอต UV' : ''}
                          {r.finishing?.hasFoilStamping ? ' + ปั๊มฟอยล์' : ''}
                          {r.finishing?.hasEmbossing ? ' + ปั๊มนูน' : ''}
                        </td>
                      ))}
                    </tr>

                    {/* Converting */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">4. ไดคัท & ปะกาว</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 text-slate-800">
                          บล็อกไดคัท {r.converting?.dieCutPlateFixedCost ?? 0} ฿ | {r.converting?.gluingType || 'auto_side'}
                        </td>
                      ))}
                    </tr>

                    {/* Total Cost / Unit */}
                    <tr className="bg-slate-50 font-bold">
                      <td className="py-2.5 px-3 text-slate-900">ต้นทุนรวมเฉลี่ยต่อใบ (Cost)</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 font-mono text-slate-900">
                          {(r.unitCost ?? r.result?.totalCostPerUnit ?? 0).toFixed(2)} ฿
                        </td>
                      ))}
                    </tr>

                    {/* Markup */}
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">Margin / กำไรที่บวก</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 font-mono text-emerald-700">
                          +{r.production?.markupPercent ?? 0}%
                        </td>
                      ))}
                    </tr>

                    {/* Suggested Selling Price */}
                    <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-200">
                      <td className="py-3 px-3 text-emerald-950 text-sm">ราคาขายเสนอต่อใบ (Price)</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-3 px-3 font-mono text-emerald-900 text-base">
                          {(r.sellingPrice ?? r.result?.sellingPricePerUnit ?? 0).toFixed(2)} บาท / ใบ
                        </td>
                      ))}
                    </tr>

                    {/* Total Order Value */}
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">ยอดรวมทั้งออเดอร์</td>
                      {comparedRevisions.map((r) => (
                        <td key={r.id} className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {(r.result?.totalOrderValue ?? (r.sellingPrice * r.production.quantity) ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VOLUME TIERS COMPARISON ACROSS REVISIONS */}
          {activeTab === 'volume_tiers_comparison' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  ตารางเปรียบเทียบราคาตามจำนวนสั่งผลิต (Volume Tiers Comparison)
                </h4>
                <p className="text-xs text-slate-500">
                  ดูการลดลงของราคาตามยอดผลิต (Economies of Scale) เปรียบเทียบข้ามแต่ละ Revision
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">จำนวนผลิต (ใบ)</th>
                      {comparedRevisions.map((rev) => (
                        <th key={rev.id} className="py-3 px-3 text-right">
                          <div>Rev {rev.revisionNo}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{rev.formattedDate}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {[500, 1000, 2000, 3000, 5000, 10000].map((qty) => (
                      <tr key={qty} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {qty.toLocaleString()} ใบ
                        </td>
                        {comparedRevisions.map((rev) => {
                          const tier = rev.quantityTiers?.find((t) => t.quantity === qty);
                          return (
                            <td key={rev.id} className="py-2.5 px-3 text-right font-bold text-emerald-700">
                              {tier ? `${(tier.suggestedPricePerUnit ?? 0).toFixed(2)} ฿` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CustomerBoxHistoryModal;

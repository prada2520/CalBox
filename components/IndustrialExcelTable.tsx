import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Copy,
  Download,
  Info,
  CheckCircle2,
  Calculator,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Search,
  Box as BoxIcon,
} from 'lucide-react';
import { IndustrialExcelItem } from '../types';
import { calculateIndustrialRow } from '../utils/calculator';
import { exportCostingToExcel } from '../utils/exportUtils';
import { BoxDiagramWithSpecs } from './BoxDiagramWithSpecs';

interface IndustrialExcelTableProps {
  rows: IndustrialExcelItem[];
  onChangeRows: (newRows: IndustrialExcelItem[]) => void;
  onApplyRowToActiveSpecs: (row: IndustrialExcelItem) => void;
}

export const IndustrialExcelTable: React.FC<IndustrialExcelTableProps> = ({
  rows,
  onChangeRows,
  onApplyRowToActiveSpecs,
}) => {
  const [selectedRowId, setSelectedRowId] = useState<string>(rows[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const selectedRow = rows.find((r) => r.id === selectedRowId) || rows[0];

  const handleCellChange = (
    id: string,
    field: keyof IndustrialExcelItem,
    value: any
  ) => {
    const updated = rows.map((row) => {
      if (row.id !== id) return row;
      const updatedRow = { ...row, [field]: value };
      return calculateIndustrialRow(updatedRow);
    });
    onChangeRows(updated);
  };

  const handleAddRow = () => {
    const newNo = rows.length + 1;
    const newRow = calculateIndustrialRow({
      id: `ind_${Date.now()}_${newNo}`,
      no: newNo,
      symbol: `P154${Math.floor(1000 + Math.random() * 9000)}`,
      description: `CTN NEW PRODUCT ${newNo}`,
      quotation: "Q3'19",
      fyVolume: 5000000,
      moq: 500000,
      runSize: 500000,
      dimensionsStr: '30 x 120 x 28',
      lengthMm: 120,
      widthMm: 30,
      heightMm: 28,
      boardDiecutted: '4 สี',
      boardGsmQuoted: 310,
      boardGsmCalculated: 300,
      sheetWidthInch: 25.25,
      sheetLengthInch: 31.00,
      pricePerKgOriginal: 25.70,
      pricePerKgNew: 25.55,
      paperMassFactor: 3100,
      paperBoxYield: 2372,
      boxesPerSheetQuoted: 32,
      boxesPerSheetCalculated: 32,
      paperWastePercent: 4.50,
      productionWastePercent: 3.5,
      printingColors: '4 สี',
      conversionCostPerBox: 0.1085,
      spotUvPerBox: 0.0005,
      mattedUvPerBox: 0.0015,
      embossedPerBox: 0.0003,
      waterBasePerBox: 0,
      waterBaseDiscount: 0,
    });
    const nextList = [...rows, newRow];
    onChangeRows(nextList);
    setSelectedRowId(newRow.id);
  };

  const handleDeleteRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rows.length <= 1) return;
    const filtered = rows.filter((r) => r.id !== id).map((r, idx) => ({ ...r, no: idx + 1 }));
    onChangeRows(filtered);
    if (selectedRowId === id) {
      setSelectedRowId(filtered[0]?.id || '');
    }
  };

  const handleDuplicateRow = (row: IndustrialExcelItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const dupNo = rows.length + 1;
    const dup = calculateIndustrialRow({
      ...row,
      id: `ind_${Date.now()}_${dupNo}`,
      no: dupNo,
      symbol: `${row.symbol}-COPY`,
      description: `${row.description} (สำเนา)`,
    });
    onChangeRows([...rows, dup]);
  };

  const filteredRows = rows.filter(
    (r) =>
      r.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dimensionsStr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  ตารางคำนวณราคาต้นทุนอุตสาหกรรม (Industrial Excel Master Costing Matrix)
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                  Official FMCG Standard
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                โครงสร้างคำนวณตรงตามแม่แบบไฟล์ Excel จริงของโรงงานพิมพ์: คำนวณจากขนาดแผ่นพิมพ์ (Sheet Size), จำนวนตัวต่อแผ่น (Ups/Sheet), ราคากระดาษ/กก., ค่าแรงแปรรูป (Conversion), และเทคนิคผิว (Spot UV / Matted UV / Emboss)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShow3DModal(!show3DModal)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                show3DModal
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30'
              }`}
            >
              <BoxIcon className="w-4 h-4 text-blue-400" />
              <span>{show3DModal ? 'ซ่อนโมเดล 3D' : 'ดู 3D กล่องนี้ (Live 3D)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>ดูสูตรคำนวณ</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มแถวสินค้า (Add Item)</span>
            </button>
          </div>
        </div>

        {/* Selected Row Quick Cockpit Highlight */}
        {selectedRow && (
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-amber-500/30 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono block">Selected Part No</span>
                <span className="font-bold text-amber-400 text-sm font-mono">{selectedRow.symbol}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Description</span>
                <span className="font-bold text-slate-200 truncate block">{selectedRow.description}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ups / Sheet</span>
                <span className="font-bold text-blue-400 font-mono text-sm">{selectedRow.boxesPerSheetCalculated} ตัว/แผ่น</span>
              </div>
              <div>
                <span className="text-slate-500 block">Paper Cost / Box</span>
                <span className="font-bold text-slate-300 font-mono text-sm">{selectedRow.paperPricePerBox.toFixed(4)} ฿</span>
              </div>
              <div>
                <span className="text-slate-500 block">Conversion / Box</span>
                <span className="font-bold text-indigo-400 font-mono text-sm">{selectedRow.conversionCostPerBox.toFixed(4)} ฿</span>
              </div>
              <div>
                <span className="text-slate-500 block">PRICE' / BOX (สุทธิ)</span>
                <span className="font-black text-amber-400 font-mono text-base">{selectedRow.pricePerBox.toFixed(4)} ฿</span>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => onApplyRowToActiveSpecs(selectedRow)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow transition-colors flex items-center justify-center gap-1"
                >
                  <span>ซิงก์เข้าหน้าสเปก</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Embedded 3D & Technical Diagram Box for the selected row when toggled */}
            {show3DModal && (
              <div className="pt-2 border-t border-slate-800">
                <BoxDiagramWithSpecs
                  dimensions={{
                    length: selectedRow.lengthMm || 107,
                    width: selectedRow.widthMm || 29,
                    height: selectedRow.heightMm || 25,
                  }}
                  boxName={`${selectedRow.symbol} ${selectedRow.description}`}
                />
              </div>
            )}
          </div>
        )}

        {/* Search filter */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัส Symbol, Description, หรือขนาด Dimension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            แสดง {filteredRows.length} จาก {rows.length} รายการ (คลิกที่เซลล์ในตารางเพื่อแก้ไขค่าได้สด)
          </div>
        </div>
      </div>

      {/* The Master Excel Table mirroring the reference screenshot */}
      <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse text-slate-200 whitespace-nowrap select-none font-sans">
            {/* Header Row Styled exactly like the Excel reference (High-contrast clean industrial format) */}
            <thead>
              <tr className="bg-slate-900/95 text-slate-300 font-bold border-b border-slate-700 text-center sticky top-0 z-20 shadow-md">
                <th className="py-2.5 px-2 border-r border-slate-700 w-10">No</th>
                <th className="py-2.5 px-3 border-r border-slate-700">Symbol</th>
                <th className="py-2.5 px-4 border-r border-slate-700 text-left min-w-[140px]">Description</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Quotation</th>
                <th className="py-2.5 px-3 border-r border-slate-700">F/Y volume</th>
                <th className="py-2.5 px-3 border-r border-slate-700">MOQ/3 AW</th>
                <th className="py-2.5 px-3 border-r border-slate-700">Run Size</th>
                <th className="py-2.5 px-3 border-r border-slate-700">Dimension</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Board Diecutted</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Board ใช้เสนอ</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Board คำนวณ</th>
                <th className="py-2.5 px-3 border-r border-slate-700">WIDTH X LENGTH</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">ราคา / KG - เดิม</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">กระดาษ ราคา/KG</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">มวลกระดาษ</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Paper Box นำไป</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Box ใช้เสนอ</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700 bg-blue-900/30 text-blue-300">Box ใช้คำนวณ</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">ค่ากระดาษไม่รวมWaste</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">+Waste 4.50%</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Production Waste%</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700 bg-emerald-900/30 text-emerald-300">Paper Price / Box</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">Printing / Diecutted</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700 bg-indigo-900/30 text-indigo-300">ค่า Conversion</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">CC/รีม</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">PLATE (30k/6k)</th>
                <th className="py-2.5 px-2.5 border-r border-slate-700">ค่าหน้าปั๊ม</th>
                <th className="py-2.5 px-2 border-r border-slate-700">SPOT UV/BOX</th>
                <th className="py-2.5 px-2 border-r border-slate-700">MATTED UV/BOX</th>
                <th className="py-2.5 px-2 border-r border-slate-700">EMBOSSED/BOX</th>
                <th className="py-2.5 px-2 border-r border-slate-700">วอเตอร์เบส</th>
                <th className="py-2.5 px-2 border-r border-slate-700">ส่วนลด</th>
                <th className="py-2.5 px-4 bg-amber-400 text-black font-black uppercase tracking-wider text-xs">
                  PRICE' /BOX
                </th>
                <th className="py-2.5 px-2.5 text-center">จัดการ</th>
              </tr>
            </thead>

            {/* Table Body with Yellow Highlighted row matching the Excel image */}
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredRows.map((row, idx) => {
                const isSelected = row.id === selectedRowId;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRowId(row.id)}
                    className={`transition-colors cursor-pointer text-center ${
                      idx === 0
                        ? 'bg-[#ffe600] text-black font-bold hover:bg-[#fff04d]' // Highlighted Yellow row like reference
                        : isSelected
                        ? 'bg-blue-600/15 text-white hover:bg-blue-600/25'
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    {/* No */}
                    <td className="py-2 px-2 border-r border-slate-700/50 font-bold">
                      {row.no}
                    </td>

                    {/* Symbol */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50 font-bold">
                      <input
                        type="text"
                        value={row.symbol}
                        onChange={(e) => handleCellChange(row.id, 'symbol', e.target.value)}
                        className={`bg-transparent text-center font-bold outline-none w-20 ${
                          idx === 0 ? 'text-black' : 'text-amber-400'
                        }`}
                      />
                    </td>

                    {/* Description */}
                    <td className="py-2 px-3 border-r border-slate-700/50 text-left">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleCellChange(row.id, 'description', e.target.value)}
                        className={`bg-transparent outline-none w-36 font-sans font-semibold ${
                          idx === 0 ? 'text-black' : 'text-slate-100'
                        }`}
                      />
                    </td>

                    {/* Quotation */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="text"
                        value={row.quotation}
                        onChange={(e) => handleCellChange(row.id, 'quotation', e.target.value)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* F/Y Volume */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.fyVolume}
                        onChange={(e) => handleCellChange(row.id, 'fyVolume', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-24"
                      />
                    </td>

                    {/* MOQ */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.moq || ''}
                        placeholder="-"
                        onChange={(e) => handleCellChange(row.id, 'moq', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-20"
                      />
                    </td>

                    {/* Run Size */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.runSize}
                        onChange={(e) => handleCellChange(row.id, 'runSize', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-24 font-bold"
                      />
                    </td>

                    {/* Dimension */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50">
                      <input
                        type="text"
                        value={row.dimensionsStr}
                        onChange={(e) => handleCellChange(row.id, 'dimensionsStr', e.target.value)}
                        className="bg-transparent text-center outline-none w-28 font-sans"
                      />
                    </td>

                    {/* Board Diecutted */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="text"
                        value={row.boardDiecutted}
                        onChange={(e) => handleCellChange(row.id, 'boardDiecutted', e.target.value)}
                        className="bg-transparent text-center outline-none w-16"
                      />
                    </td>

                    {/* Board ใช้เสนอ */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.boardGsmQuoted}
                        onChange={(e) => handleCellChange(row.id, 'boardGsmQuoted', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-12"
                      />
                    </td>

                    {/* Board คำนวณ */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.boardGsmCalculated}
                        onChange={(e) => handleCellChange(row.id, 'boardGsmCalculated', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-12 font-bold"
                      />
                    </td>

                    {/* WIDTH X LENGTH */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={row.sheetWidthInch}
                          onChange={(e) => handleCellChange(row.id, 'sheetWidthInch', parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-right outline-none w-12"
                        />
                        <span>x</span>
                        <input
                          type="number"
                          step="0.01"
                          value={row.sheetLengthInch}
                          onChange={(e) => handleCellChange(row.id, 'sheetLengthInch', parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-left outline-none w-12"
                        />
                      </div>
                    </td>

                    {/* ราคา / KG เดิม */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.01"
                        value={row.pricePerKgOriginal}
                        onChange={(e) => handleCellChange(row.id, 'pricePerKgOriginal', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-14 opacity-80"
                      />
                    </td>

                    {/* กระดาษ ราคาใหม่/KG */}
                    <td className="py-2 px-2 border-r border-slate-700/50 font-bold">
                      <input
                        type="number"
                        step="0.01"
                        value={row.pricePerKgNew}
                        onChange={(e) => handleCellChange(row.id, 'pricePerKgNew', parseFloat(e.target.value) || 0)}
                        className={`bg-transparent text-center outline-none w-14 font-bold ${
                          idx === 0 ? 'text-black' : 'text-emerald-400'
                        }`}
                      />
                    </td>

                    {/* มวลกระดาษ */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.paperMassFactor}
                        onChange={(e) => handleCellChange(row.id, 'paperMassFactor', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* Paper Box นำไป */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.paperBoxYield}
                        onChange={(e) => handleCellChange(row.id, 'paperBoxYield', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-16"
                      />
                    </td>

                    {/* Box ใช้เสนอ */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        value={row.boxesPerSheetQuoted}
                        onChange={(e) => handleCellChange(row.id, 'boxesPerSheetQuoted', parseInt(e.target.value) || 1)}
                        className="bg-transparent text-center outline-none w-10"
                      />
                    </td>

                    {/* Box ใช้คำนวณ (Ups/Sheet) */}
                    <td className="py-2 px-2 border-r border-slate-700/50 font-bold">
                      <input
                        type="number"
                        value={row.boxesPerSheetCalculated}
                        onChange={(e) => handleCellChange(row.id, 'boxesPerSheetCalculated', parseInt(e.target.value) || 1)}
                        className={`bg-transparent text-center outline-none w-10 font-bold ${
                          idx === 0 ? 'text-black font-black' : 'text-blue-400'
                        }`}
                      />
                    </td>

                    {/* ค่ากระดาษไม่รวมWaste */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.paperCostNoWaste}
                        onChange={(e) => handleCellChange(row.id, 'paperCostNoWaste', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-16"
                      />
                    </td>

                    {/* +Waste 4.50% */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.paperWasteCost}
                        onChange={(e) => handleCellChange(row.id, 'paperWasteCost', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* Production Waste% */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.1"
                        value={row.productionWastePercent}
                        onChange={(e) => handleCellChange(row.id, 'productionWastePercent', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-10"
                      />
                    </td>

                    {/* Paper Price / Box */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50 font-bold">
                      {row.paperPricePerBox.toFixed(4)}
                    </td>

                    {/* Printing / Diecutted */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="text"
                        value={row.printingColors}
                        onChange={(e) => handleCellChange(row.id, 'printingColors', e.target.value)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* ค่า Conversion */}
                    <td className="py-2 px-2.5 border-r border-slate-700/50 font-bold">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.conversionCostPerBox}
                        onChange={(e) => handleCellChange(row.id, 'conversionCostPerBox', parseFloat(e.target.value) || 0)}
                        className={`bg-transparent text-center outline-none w-16 font-bold ${
                          idx === 0 ? 'text-black' : 'text-indigo-400'
                        }`}
                      />
                    </td>

                    {/* CC/รีม */}
                    <td className="py-2 px-2 border-r border-slate-700/50 text-slate-500">
                      -
                    </td>

                    {/* Plate */}
                    <td className="py-2 px-2 border-r border-slate-700/50 text-slate-500">
                      -
                    </td>

                    {/* ค่าหน้าปั๊ม */}
                    <td className="py-2 px-2 border-r border-slate-700/50 text-slate-500">
                      -
                    </td>

                    {/* Spot UV */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.spotUvPerBox}
                        onChange={(e) => handleCellChange(row.id, 'spotUvPerBox', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* Matted UV */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.mattedUvPerBox}
                        onChange={(e) => handleCellChange(row.id, 'mattedUvPerBox', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* Emboss */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.embossedPerBox}
                        onChange={(e) => handleCellChange(row.id, 'embossedPerBox', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-14"
                      />
                    </td>

                    {/* Water-based */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.waterBasePerBox}
                        onChange={(e) => handleCellChange(row.id, 'waterBasePerBox', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-12"
                      />
                    </td>

                    {/* Water-based Discount */}
                    <td className="py-2 px-2 border-r border-slate-700/50">
                      <input
                        type="number"
                        step="0.0001"
                        value={row.waterBaseDiscount}
                        onChange={(e) => handleCellChange(row.id, 'waterBaseDiscount', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-center outline-none w-12"
                      />
                    </td>

                    {/* PRICE' /BOX */}
                    <td className={`py-2 px-3 font-black text-sm text-center ${
                      idx === 0
                        ? 'bg-amber-300 text-black font-mono'
                        : 'bg-amber-500/20 text-amber-300 font-mono'
                    }`}>
                      {row.pricePerBox.toFixed(4)}
                    </td>

                    {/* Row Actions */}
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateRow(row, e)}
                          title="คัดลอกแถวนี้"
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRow(row.id, e)}
                          title="ลบแถวนี้"
                          className="p-1 rounded bg-rose-900/30 hover:bg-rose-800 text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Breakdown Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Calculator className="w-5 h-5" />
                <span>สูตรคณิตศาสตร์การคิดราคาตามแบบไฟล์ Excel จริง</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1.5 font-mono text-xs">
                <span className="text-amber-400 font-bold">1. คำนวณน้ำหนักกระดาษต่อแผ่นพิมพ์ (Sheet Weight kg):</span>
                <p className="text-slate-300 pl-3">
                  = [ (กว้างนิ้ว × 0.0254) × (ยาวนิ้ว × 0.0254) × GSM แกรมคำนวณ ] ÷ 1,000
                </p>
                <p className="text-slate-400 pl-3 text-[11px]">
                  ตัวอย่าง: แผ่น 25.25" × 31" กระดาษ 300 GSM = 0.1515 กก./แผ่น
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1.5 font-mono text-xs">
                <span className="text-blue-400 font-bold">2. ต้นทุนกระดาษต่อใบ (ไม่รวม Waste):</span>
                <p className="text-slate-300 pl-3">
                  = (น้ำหนักต่อแผ่น kg × ราคากระดาษ/กก. ใหม่) ÷ จำนวนตัวต่อแผ่น (Box ใช้คำนวณ 32 ตัว)
                </p>
                <p className="text-slate-400 pl-3 text-[11px]">
                  ตัวอย่าง: (0.1857 kg × 25.55 บาท) ÷ 32 = 0.1483 บาท/ใบ
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1.5 font-mono text-xs">
                <span className="text-emerald-400 font-bold">3. ราคากระดาษสุทธิรวม Waste (Paper Price / Box):</span>
                <p className="text-slate-300 pl-3">
                  = ต้นทุนกระดาษไม่รวม Waste (0.1483) + เผื่อสูญเสีย 4.5% (0.0052) = 0.1535 บาท/ใบ
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1.5 font-mono text-xs">
                <span className="text-purple-400 font-bold">4. ราคาเสนอขายสุทธิต่อใบ (PRICE' /BOX):</span>
                <p className="text-slate-300 pl-3">
                  = ราคากระดาษรวม Waste (0.1535) + ค่า Conversion แปรรูปพิมพ์ไดคัท (0.1085) + Spot UV (0.0005) + Matted UV (0.0015) + Emboss (0.0003) = 0.2632 บาท/ใบ
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                เข้าใจแล้ว (ปิดหน้าต่าง)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialExcelTable;

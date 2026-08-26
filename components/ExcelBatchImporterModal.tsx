import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  FileText,
  HelpCircle,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FactoryMatrixItem, FactoryMatrixTier, FACTORY_QTY_TIERS, createTierList } from '../data/factory3SheetsData';

interface ExcelBatchImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerId: string;
  sheetName: string;
  sheetId: string;
  onImportItems: (items: FactoryMatrixItem[]) => void;
}

export const ExcelBatchImporterModal: React.FC<ExcelBatchImporterModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerId,
  sheetName,
  sheetId,
  onImportItems,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewItems, setPreviewItems] = useState<FactoryMatrixItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process and parse uploaded Excel / CSV file
  const processUploadedFile = (uploadedFile: File) => {
    setErrorMsg(null);
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setErrorMsg('ไม่พบข้อมูลในไฟล์ หรือรูปแบบแถวว่างเปล่า');
          setIsProcessing(false);
          return;
        }

        setParsedRows(rawJson);

        // Convert raw rows to FactoryMatrixItem
        const convertedItems: FactoryMatrixItem[] = rawJson.map((row, index) => {
          // Normalize column names
          const mapic = String(row['MAPIC No'] || row['Mapic'] || row['Symbol'] || row['รหัสสินค้า'] || `ITEM-${index + 1}`).trim();
          const block = String(row['Block No'] || row['Block'] || row['บล็อก'] || '-').trim();
          const desc = String(row['Description'] || row['ชื่อรายการ'] || row['ชื่อกล่อง'] || row['Item Name'] || `รายการ ${index + 1}`).trim();
          const gsm = Number(row['GSM'] || row['แกรม'] || row['Board GSM'] || 350) || 350;
          const dimStr = String(row['Dimensions'] || row['ขนาด (L x W x H)'] || row['Dimension'] || '150 x 100 x 40').trim();
          
          // Parse dimensions
          const parts = dimStr.split(/[xX*×\s]+/).filter(Boolean).map((n) => Number(n.trim()));
          const lengthMm = parts[0] || 150;
          const widthMm = parts[1] || 100;
          const heightMm = parts[2] || 40;

          const colorsProcess = String(row['Colors & Process'] || row['พิมพ์และเทคนิค'] || row['Process'] || 'Offset 4 สี + เคลือบเงา + ไดคัทปะกาว').trim();
          const paperType = String(row['Paper Type'] || row['ประเภทกระดาษ'] || 'กระดาษกล่องแป้งหลังเทา (Duplex Board)').trim();
          const notes = String(row['Notes'] || row['หมายเหตุ'] || 'นำเข้าจากไฟล์ Excel').trim();

          // Build Tier Price map from row columns (e.g., '1000', 'Qty 1000', '1,000', '5000', '10000', etc.)
          const tierPriceMap: { [qty: number]: { p2556?: number; p2565?: number; pCurrent?: number } } = {};
          
          FACTORY_QTY_TIERS.forEach((qty) => {
            // Find possible column headers
            const possibleKeys = [
              String(qty),
              `Qty ${qty}`,
              `Tier ${qty}`,
              qty.toLocaleString(),
              `ราคา ${qty}`,
              `Price ${qty}`,
              `P_${qty}`,
            ];

            let matchedVal: number | null = null;
            for (const key of possibleKeys) {
              if (row[key] !== undefined && row[key] !== '') {
                const num = parseFloat(String(row[key]).replace(/,/g, ''));
                if (!isNaN(num) && num > 0) {
                  matchedVal = num;
                  break;
                }
              }
            }

            if (matchedVal !== null) {
              tierPriceMap[qty] = {
                p2556: Number((matchedVal * 0.95).toFixed(2)),
                p2565: matchedVal,
                pCurrent: Number((matchedVal * 1.04).toFixed(2)),
              };
            }
          });

          // Fallback if no specific tier column found: construct reasonable tier curve from base price
          if (Object.keys(tierPriceMap).length === 0) {
            const basePrice = Number(row['Price'] || row['ราคา'] || row['Base Price'] || 5.0) || 5.0;
            tierPriceMap[1000] = { p2556: basePrice * 0.95, p2565: basePrice, pCurrent: basePrice * 1.04 };
            tierPriceMap[3000] = { p2556: basePrice * 0.88, p2565: basePrice * 0.92, pCurrent: basePrice * 0.96 };
            tierPriceMap[5000] = { p2556: basePrice * 0.80, p2565: basePrice * 0.84, pCurrent: basePrice * 0.88 };
            tierPriceMap[10000] = { p2556: basePrice * 0.72, p2565: basePrice * 0.76, pCurrent: basePrice * 0.80 };
          }

          const standardTiers = createTierList(tierPriceMap);

          return {
            id: `import_${Date.now()}_${index}`,
            sheetType: sheetId,
            sheetTitle: sheetName,
            mapicNo: mapic,
            blockNo: block,
            description: desc,
            gsm,
            dimensionsStr: dimStr,
            lengthMm,
            widthMm,
            heightMm,
            colorsAndProcess: colorsProcess,
            paperType,
            standardTiers,
            notes,
            lastUpdated: new Date().toLocaleDateString('th-TH'),
            activeRevisionNo: 1,
          };
        });

        setPreviewItems(convertedItems);
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Error parsing excel file:', err);
        setErrorMsg('เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบว่าเป็นไฟล์ .xlsx, .xls หรือ .csv ที่ถูกต้อง');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Download standard Excel template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'MAPIC No': 'P1541749',
        'Block No': 'PSN 1725',
        'Description': 'กล่องบรรจุภัณฑ์ตัวอย่าง 1 (Sample Box 1)',
        'GSM': 350,
        'Dimensions': '120 x 85 x 40',
        'Paper Type': 'กระดาษกล่องแป้งหลังเทา (Duplex Board Grey Back)',
        'Colors & Process': 'Offset 4 สี + อาบเงา UV + ไดคัทปะกาวข้าง',
        '1000': 6.50,
        '3000': 5.40,
        '5000': 4.80,
        '10000': 4.20,
        'Notes': 'ตัวอย่างข้อมูลสำหรับนำเข้าตารางราคา',
      },
      {
        'MAPIC No': 'P1541750',
        'Block No': 'PSN 2149',
        'Description': 'กล่องบรรจุภัณฑ์ตัวอย่าง 2 (Sample Box 2)',
        'GSM': 380,
        'Dimensions': '80 x 50 x 185',
        'Paper Type': 'กระดาษกล่องแป้งหลังขาว (Duplex Board White Back)',
        'Colors & Process': '4 สี + เคลือบลามิเนตด้าน + สปอตยูวี + ปะกาวก้นออโต้ล็อค',
        '1000': 8.20,
        '3000': 6.90,
        '5000': 6.10,
        '10000': 5.40,
        'Notes': 'ตัวอย่างนำเข้ากล่องพรีเมียม',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Packaging_Legacy_Import_Template.xlsx`);
  };

  const handleConfirmImport = () => {
    if (previewItems.length === 0) return;
    onImportItems(previewItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-[#0b0f19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>นำเข้าข้อมูลประวัติราคาจาก Excel (.xlsx / .csv)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  BATCH IMPORTER
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ลูกค้า: <strong className="text-blue-300">{customerName}</strong> | ชีตปลายทาง: <strong className="text-amber-300">{sheetName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างนำเข้า"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Top Info & Template Download */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-blue-200">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                รองรับไฟล์ตารางราคา Excel ที่มีคอลัมน์มาตรฐาน: <strong>MAPIC No, Description, GSM, Dimensions, Paper Type, Colors & Process</strong> และคอลัมน์ราคาตามจำนวน (เช่น <strong>1000, 3000, 5000, 10000</strong>)
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดเทมเพลต Excel</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                : 'border-slate-700 hover:border-emerald-500/60 bg-[#0b0f19]/80 hover:bg-[#0b0f19]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processUploadedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Upload className="w-7 h-7" />
              </div>
              <div className="font-bold text-white text-sm">
                คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ Excel / CSV มาวางที่นี่
              </div>
              <p className="text-xs text-slate-400 font-mono">
                รองรับ .XLSX, .XLS, .CSV ขนาดสูงสุด 15MB
              </p>
              {file && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 mt-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {previewItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>ตัวอย่างข้อมูลที่ตรวจพบ ({previewItems.length} รายการ)</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  พร้อมนำเข้าสู่ชีต "{sheetName}"
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b0f19]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">MAPIC / รหัส</th>
                      <th className="p-2.5">ชื่อรายการ / สเปก</th>
                      <th className="p-2.5">ขนาด (mm)</th>
                      <th className="p-2.5">แกรม</th>
                      <th className="p-2.5">ประเภทกระดาษ</th>
                      <th className="p-2.5 text-right">ราคา 1,000 ใบ</th>
                      <th className="p-2.5 text-right">ราคา 5,000 ใบ</th>
                      <th className="p-2.5 text-right">ราคา 10,000 ใบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {previewItems.slice(0, 8).map((item, idx) => {
                      const p1000 = item.standardTiers.find((t) => t.qty === 1000)?.price2565;
                      const p5000 = item.standardTiers.find((t) => t.qty === 5000)?.price2565;
                      const p10000 = item.standardTiers.find((t) => t.qty === 10000)?.price2565;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-amber-300">{item.mapicNo}</td>
                          <td className="p-2.5 font-medium text-white max-w-[200px] truncate">{item.description}</td>
                          <td className="p-2.5 font-mono text-cyan-300">{item.dimensionsStr}</td>
                          <td className="p-2.5 font-mono text-slate-400">{item.gsm}g</td>
                          <td className="p-2.5 text-slate-400 max-w-[150px] truncate">{item.paperType}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-200">
                            {p1000 ? `${p1000.toFixed(2)} ฿` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                            {p5000 ? `${p5000.toFixed(2)} ฿` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-blue-400">
                            {p10000 ? `${p10000.toFixed(2)} ฿` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {previewItems.length > 8 && (
                <div className="text-center text-xs text-slate-500 font-mono">
                  และอีก {previewItems.length - 8} รายการ...
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0b0f19] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={previewItems.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ยืนยันนำเข้า {previewItems.length} รายการเข้าสู่ชีต</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Database,
  Building2,
  Table,
  Check,
  X,
  Layers,
  HelpCircle,
  Download,
  Sliders,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Customer, CustomerBoxRecord, BoxCategory } from '../types';

interface CustomerDataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  activeCustomer: Customer;
  onImportComplete: (newBoxes: CustomerBoxRecord[], targetCustomer: Customer) => void;
}

// Pre-defined sample raw Excel datasets from legacy customer systems
const SAMPLE_LEGACY_EXCEL_FILES = [
  {
    id: 'colgate_raw_excel',
    name: 'Colgate_Packaging_Master_Nov2024.xlsx',
    customerName: 'บริษัท คอลเกต-ปาล์มโอลีฟ (ประเทศไทย) จำกัด',
    customerCode: 'COLGATE-TH',
    rowCount: 6,
    rawHeaders: ['MAPIC_CODE', 'DESCRIPTION', 'DIE_CUT_SIZE_MM', 'PAPER_SPEC', 'COLORS_PRINT', 'BLOCK_NO', 'UNIT_PRICE_BHT', 'MOQ_PCS'],
    rawRows: [
      {
        MAPIC_CODE: 'FG-CP-P15211904',
        DESCRIPTION: 'CTN CDC TP GRF 150g Twin new violator 23 P15211904',
        DIE_CUT_SIZE_MM: '190 x 48 x 78',
        PAPER_SPEC: 'DBS กล่องแป้งหลังน้ำตาล 400g',
        COLORS_PRINT: '6 Colors (CMYK + CP RED + REFLEX BLUE) + Waterbase',
        BLOCK_NO: 'HB-8-01',
        UNIT_PRICE_BHT: '2.45',
        MOQ_PCS: '60,300',
      },
      {
        MAPIC_CODE: 'FG-CP-P15211905',
        DESCRIPTION: 'CTN CDC Total Whitening 150g Promo Pack',
        DIE_CUT_SIZE_MM: '195 x 50 x 80',
        PAPER_SPEC: 'DBS กล่องแป้งหลังน้ำตาล 400g',
        COLORS_PRINT: '6 Colors (CMYK + CP RED + GLOSS BLUE) + Calendering',
        BLOCK_NO: 'HB-8-02',
        UNIT_PRICE_BHT: '2.52',
        MOQ_PCS: '50,000',
      },
      {
        MAPIC_CODE: 'FG-CP-P15211910',
        DESCRIPTION: 'CTN Plax Peppermint Mouthwash 500ml Outer Box',
        DIE_CUT_SIZE_MM: '220 x 85 x 85',
        PAPER_SPEC: 'DUPLEX แป้งหลังขาว 350g',
        COLORS_PRINT: '4 Colors CMYK + OPV เงา',
        BLOCK_NO: 'HB-4-11',
        UNIT_PRICE_BHT: '3.80',
        MOQ_PCS: '30,000',
      },
      {
        MAPIC_CODE: 'FG-CP-P15211912',
        DESCRIPTION: 'CTN Colgate Optic White O2 85g Premium Holo',
        DIE_CUT_SIZE_MM: '175 x 42 x 65',
        PAPER_SPEC: 'METALLIZED กระดาษฟอยล์เงินเงา 350g',
        COLORS_PRINT: '6 Colors UV + Drip Off + Emboss',
        BLOCK_NO: 'HB-UV-05',
        UNIT_PRICE_BHT: '5.90',
        MOQ_PCS: '25,000',
      },
    ],
  },
  {
    id: 'lion_raw_csv',
    name: 'Lion_Tsubaki_Shokubutsu_Boxes.csv',
    customerName: 'บริษัท ไลอ้อน (ประเทศไทย) จำกัด',
    customerCode: 'LION-TH',
    rowCount: 4,
    rawHeaders: ['ITEM_ID', 'BOX_NAME_TH', 'DIMENSIONS_LXWXH', 'BOARD_GRADE', 'PRINT_SPEC', 'DIE_NO', 'CONTRACT_PRICE', 'LOT_SIZE'],
    rawRows: [
      {
        ITEM_ID: 'LN-SHOK-200G',
        BOX_NAME_TH: 'กล่องสบู่โชกุบุสซึ กลิ่นส้มยูซุ 200g (Japan Pack)',
        DIMENSIONS_LXWXH: '110 x 40 x 85',
        BOARD_GRADE: 'แป้งหลังขาว เกรด A 350 GSM',
        PRINT_SPEC: '5 สี (CMYK + Orange Pantone) + เคลือบด้าน Waterbase',
        DIE_NO: 'LN-DK-102',
        CONTRACT_PRICE: '1.85',
        LOT_SIZE: '100,000',
      },
      {
        ITEM_ID: 'LN-KODOMO-GIFT',
        BOX_NAME_TH: 'ชุดของขวัญโคโดโมะ Giftset Happy Baby Box',
        DIMENSIONS_LXWXH: '300 x 220 x 80',
        BOARD_GRADE: 'ลูกฟูก E-Flute ปะกล่องแป้ง 300g',
        PRINT_SPEC: '4 สี CMYK + เคลือบลามิเนตเงา',
        DIE_NO: 'LN-DK-205',
        CONTRACT_PRICE: '14.20',
        LOT_SIZE: '10,000',
      },
    ],
  },
];

// Target Schema Fields in our Database
interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  description: string;
  fallbackKeywords: string[];
}

const TARGET_SCHEMA_FIELDS: TargetFieldDef[] = [
  {
    key: 'boxName',
    label: 'ชื่อกล่อง / รายละเอียดสินค้า (Box Name / Description)',
    required: true,
    description: 'ชื่อสินค้า เช่น CTN CDC TP GRF 150g Twin',
    fallbackKeywords: ['description', 'name', 'box_name', 'item_name', 'ชื่อสินค้า', 'รายละเอียด', 'product'],
  },
  {
    key: 'code',
    label: 'รหัสสินค้า / รหัส MAPIC (Item Code)',
    required: false,
    description: 'เช่น FG-CP-P15211904, LN-SHOK-200G',
    fallbackKeywords: ['code', 'mapic', 'item_id', 'sku', 'รหัส', 'item_code'],
  },
  {
    key: 'dimensions',
    label: 'ขนาดกล่อง L × W × H มม. (Dimensions mm)',
    required: true,
    description: 'เช่น 190 x 48 x 78 หรือ 190*48*78',
    fallbackKeywords: ['dimension', 'size', 'die_cut', 'ขนาด', 'l_w_h', 'dimensions_lxwxh'],
  },
  {
    key: 'paperType',
    label: 'ชนิดและแกรมกระดาษ (Paper Grade & GSM)',
    required: true,
    description: 'เช่น DBS แป้งหลังน้ำตาล 400g, 350 GSM',
    fallbackKeywords: ['paper', 'board', 'material', 'gsm', 'กระดาษ', 'board_grade', 'paper_spec'],
  },
  {
    key: 'printingSpec',
    label: 'ระบบพิมพ์และจำนวนสี (Printing & Colors)',
    required: false,
    description: 'เช่น 6 สี (CMYK + CP RED), 4 สี CMYK',
    fallbackKeywords: ['print', 'colors', 'color', 'พิมพ์', 'colors_print', 'print_spec'],
  },
  {
    key: 'blockNo',
    label: 'รหัสบล็อก / แท่นพิมพ์ (Die-cut Block / Machine)',
    required: false,
    description: 'เช่น HB-8-01, LN-DK-102',
    fallbackKeywords: ['block', 'die', 'machine', 'บล็อก', 'block_no', 'die_no'],
  },
  {
    key: 'price',
    label: 'ราคาประวัติเดิม (Legacy Price THB)',
    required: false,
    description: 'เช่น 2.45 บาท',
    fallbackKeywords: ['price', 'cost', 'unit_price', 'ราคา', 'contract_price', 'unit_price_bht'],
  },
  {
    key: 'moq',
    label: 'ยอดผลิตมาตรฐาน (Standard MOQ / Lot)',
    required: false,
    description: 'เช่น 60,300 หรือ 50,000 ชิ้น',
    fallbackKeywords: ['moq', 'qty', 'lot', 'quantity', 'จำนวน', 'moq_pcs', 'lot_size'],
  },
];

export const CustomerDataImportModal: React.FC<CustomerDataImportModalProps> = ({
  isOpen,
  onClose,
  customers,
  activeCustomer,
  onImportComplete,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(activeCustomer);
  const [activeFilePreset, setActiveFilePreset] = useState<string>('colgate_raw_excel');
  const [uploadedFileName, setUploadedFileName] = useState<string>('Colgate_Packaging_Master_Nov2024.xlsx');
  const [rawHeaders, setRawHeaders] = useState<string[]>(SAMPLE_LEGACY_EXCEL_FILES[0].rawHeaders);
  const [rawRows, setRawRows] = useState<any[]>(SAMPLE_LEGACY_EXCEL_FILES[0].rawRows);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('mapping');

  // Mapping state: { [targetSchemaKey]: selectedRawHeaderName }
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>(() => {
    return autoMatchFields(SAMPLE_LEGACY_EXCEL_FILES[0].rawHeaders);
  });

  // Auto-match function using heuristics
  function autoMatchFields(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    TARGET_SCHEMA_FIELDS.forEach((target) => {
      const match = headers.find((h) => {
        const lowerH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        return target.fallbackKeywords.some((kw) => {
          const lowerKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
          return lowerH.includes(lowerKw) || lowerKw.includes(lowerH);
        });
      });
      if (match) {
        mappings[target.key] = match;
      }
    });
    return mappings;
  }

  // Handle choosing a preset sample file
  const handleSelectSample = (presetId: string) => {
    const found = SAMPLE_LEGACY_EXCEL_FILES.find((f) => f.id === presetId);
    if (found) {
      setActiveFilePreset(presetId);
      setUploadedFileName(found.name);
      setRawHeaders(found.rawHeaders);
      setRawRows(found.rawRows);
      const newMappings = autoMatchFields(found.rawHeaders);
      setFieldMappings(newMappings);
      
      // Auto-match customer if matching code
      const matchedCust = customers.find((c) => c.code === found.customerCode);
      if (matchedCust) setSelectedCustomer(matchedCust);
    }
  };

  // Simulated drag-and-drop file upload
  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setIsProcessing(true);
      setTimeout(() => {
        // Fallback or dynamic parse
        const defaultSample = SAMPLE_LEGACY_EXCEL_FILES[0];
        setRawHeaders(defaultSample.rawHeaders);
        setRawRows(defaultSample.rawRows);
        setFieldMappings(autoMatchFields(defaultSample.rawHeaders));
        setIsProcessing(false);
        setStep('mapping');
      }, 600);
    }
  };

  // Convert raw rows into formatted CustomerBoxRecord items based on current mappings
  const convertedRecords: CustomerBoxRecord[] = useMemo(() => {
    return rawRows.map((row, idx) => {
      const nameVal = row[fieldMappings['boxName']] || `Imported Box #${idx + 1}`;
      const codeVal = row[fieldMappings['code']] || `IMP-${idx + 1001}`;
      const dimVal = row[fieldMappings['dimensions']] || '150 x 100 x 50';
      const paperVal = row[fieldMappings['paperType']] || 'กล่องแป้งหลังขาว 350g';
      const printVal = row[fieldMappings['printingSpec']] || 'Offset 4 Colors CMYK';
      const blockVal = row[fieldMappings['blockNo']] || 'DK-01';
      const priceVal = parseFloat(row[fieldMappings['price']] || '2.50');
      const moqVal = parseInt((row[fieldMappings['moq']] || '10000').toString().replace(/,/g, ''), 10);

      // Parse dimensions (e.g. "190 x 48 x 78" or "190*48*78")
      const dimParts = dimVal.toString().split(/[xX*×\s,]+/).filter(Boolean).map(Number);
      const length = dimParts[0] || 150;
      const width = dimParts[1] || 100;
      const height = dimParts[2] || 50;

      // Parse GSM from paper spec if present
      const gsmMatch = paperVal.toString().match(/(\d{3})\s*(g|gsm|แกรม)/i);
      const gsm = gsmMatch ? parseInt(gsmMatch[1], 10) : 350;

      return {
        id: `imp_${Date.now()}_${idx}`,
        customerId: selectedCustomer.id,
        boxName: nameVal,
        category: 'tuck_end' as BoxCategory,
        dimensions: { length, width, height },
        paper: {
          materialType: paperVal.toString().replace(/\d+g|\d+\s*gsm/gi, '').trim() || 'กล่องแป้งหลังขาว',
          gsm: gsm,
          pricingUnit: 'per_kg',
          pricePerUnit: 35.0,
        },
        printing: {
          type: 'offset_cmyk',
          sides: 'single_side',
          pantoneColorsCount: printVal.toLowerCase().includes('6') ? 2 : 0,
        },
        finishing: {
          coatingType: printVal.toLowerCase().includes('waterbase') ? 'waterbase_gloss' : 'none',
          hasFoilStamping: false,
          hasEmbossing: printVal.toLowerCase().includes('emboss'),
          hasSpotUv: false,
        },
        converting: {
          gluingType: 'auto_side',
          hasWindowPatching: false,
        },
        production: {
          quantity: isNaN(moqVal) ? 10000 : moqVal,
          markupPercent: 20,
          targetMarginPercent: 20,
          shippingPerPiece: 0.15,
        },
        activeRevisionId: 'rev_1',
        revisions: [
          {
            id: 'rev_1',
            revisionNumber: 1,
            label: 'Imported v1.0',
            savedAt: new Date().toISOString(),
            reason: `นำเข้าอัตโนมัติจากไฟล์ ${uploadedFileName} (รหัส ${codeVal} • บล็อก ${blockVal})`,
            unitCost: priceVal * 0.8,
            sellingPrice: priceVal,
            profitMarginPercent: 20,
            productionQuantity: isNaN(moqVal) ? 10000 : moqVal,
            specsSnapshot: {
              boxName: nameVal,
              category: 'tuck_end',
              dimensions: { length, width, height },
              paper: { materialType: paperVal, gsm, pricingUnit: 'per_kg', pricePerUnit: 35 },
              printing: { type: 'offset_cmyk', sides: 'single_side', pantoneColorsCount: 0 },
              finishing: { coatingType: 'waterbase_gloss', hasFoilStamping: false, hasEmbossing: false, hasSpotUv: false },
              converting: { gluingType: 'auto_side', hasWindowPatching: false },
              production: { quantity: moqVal, markupPercent: 20, targetMarginPercent: 20, shippingPerPiece: 0.15 },
            },
          },
        ],
      };
    });
  }, [rawRows, fieldMappings, selectedCustomer, uploadedFileName]);

  if (!isOpen) return null;

  const handleCommitImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onImportComplete(convertedRecords, selectedCustomer);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-[#0f172a] text-slate-100 rounded-3xl border-2 border-blue-500/40 max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>ระบบนำเข้า & แปลงข้อมูลลูกค้าเดิม (Customer File Importer & Auto Mapper)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                  SMART CONVERTER
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                แปลงไฟล์ Excel / CSV จากฐานข้อมูลเดิมของลูกค้า และจับคู่ฟิลด์อัตโนมัติลงฐานข้อมูลระบบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Wizard Navigation Bar */}
        <div className="bg-[#111c38] px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                step === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>1. เลือกไฟล์ Excel / CSV</span>
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep('mapping')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                step === 'mapping' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>2. ตรวจสอบการจับคู่ฟิลด์ (Field Mapping)</span>
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                step === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>3. พรีวิวข้อมูลก่อนนำเข้า ({convertedRecords.length} กล่อง)</span>
            </button>
          </div>

          {/* Target Customer Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">นำเข้าให้ลูกค้า:</span>
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                if (found) setSelectedCustomer(found);
              }}
              className="bg-[#0b0f19] border border-blue-500/50 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1 & PRESETS BAR: Always visible for quick switching */}
          <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ตัวอย่างไฟล์ข้อมูลของลูกค้าจริง (กดเพื่อทดลองนำเข้าและแปลงทันที):</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ไฟล์ที่เลือก: <strong className="text-emerald-400">{uploadedFileName}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_LEGACY_EXCEL_FILES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample.id)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                    activeFilePreset === sample.id
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                      : 'bg-[#111726] hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">{sample.name}</div>
                      <div className="text-[10px] text-slate-400">{sample.customerName} ({sample.rowCount} รายการ)</div>
                    </div>
                  </div>
                  {activeFilePreset === sample.id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Drag and Drop Custom File Area */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>หรือ<strong>คลิกอัปโหลดไฟล์ Excel / CSV</strong> ของท่านเองจากเครื่องคอมพิวเตอร์</span>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  className="hidden"
                  onChange={handleFileUploadSimulated}
                />
              </label>
            </div>
          </div>

          {/* STEP 2: Field Mapping Table (Intelligent Column Matcher) */}
          {(step === 'mapping' || step === 'upload') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>ตารางจับคู่ฟิลด์อัตโนมัติ (Intelligent Field Mapping)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ระบบวิเคราะห์หัวคอลัมน์ในไฟล์ Excel และจับคู่ลงช่องข้อมูลระบบ ท่านสามารถปรับเปลี่ยนดรอปดาวน์ได้อิสระ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFieldMappings(autoMatchFields(rawHeaders))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>รีเซ็ตการจับคู่ (Auto-Match)</span>
                </button>
              </div>

              {/* Mapping Grid Table */}
              <div className="bg-[#0b0f19] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                      <th className="py-2.5 px-4">ฟิลด์ในระบบ (Target Field)</th>
                      <th className="py-2.5 px-4">คอลัมน์ในไฟล์ Excel (Source Column)</th>
                      <th className="py-2.5 px-4">ตัวอย่างข้อมูลจริง (Sample Value)</th>
                      <th className="py-2.5 px-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {TARGET_SCHEMA_FIELDS.map((target) => {
                      const matchedCol = fieldMappings[target.key] || '';
                      const sampleVal = rawRows[0] && matchedCol ? rawRows[0][matchedCol] : '-';
                      const isMatched = !!matchedCol;

                      return (
                        <tr key={target.key} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Target Field Info */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{target.label}</span>
                              {target.required && (
                                <span className="text-rose-400 text-[10px]">*จำเป็น</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{target.description}</div>
                          </td>

                          {/* Source Column Dropdown */}
                          <td className="py-3 px-4">
                            <select
                              value={matchedCol}
                              onChange={(e) => {
                                setFieldMappings({
                                  ...fieldMappings,
                                  [target.key]: e.target.value,
                                });
                              }}
                              className={`w-full text-xs font-mono font-bold rounded-lg py-1.5 px-2.5 border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                isMatched
                                  ? 'bg-[#162038] border-blue-500/60 text-blue-200'
                                  : 'bg-[#111726] border-slate-700 text-slate-400'
                              }`}
                            >
                              <option value="">-- ไม่เลือก / ข้ามฟิลด์นี้ --</option>
                              {rawHeaders.map((hdr) => (
                                <option key={hdr} value={hdr}>
                                  คอลัมน์: {hdr}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Real Sample Preview Value */}
                          <td className="py-3 px-4 font-mono text-slate-300 truncate max-w-xs">
                            <span className="bg-slate-900/90 px-2 py-1 rounded text-[11px] border border-slate-800 inline-block truncate max-w-full">
                              {sampleVal}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4 text-center">
                            {isMatched ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>จับคู่แล้ว</span>
                              </span>
                            ) : target.required ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ยังไม่เลือก</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">เว้นว่าง</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Live Preview Table of Converted Boxes */}
          {(step === 'preview' || step === 'mapping') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>พรีวิวข้อมูลที่จะนำเข้าสู่ประวัติกล่องของ {selectedCustomer.name} ({convertedRecords.length} รายการ):</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">พร้อมใช้งานใน Step 1 และ Step 2 ทันที</span>
              </div>

              <div className="bg-[#0b0f19] rounded-xl border border-slate-800 overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-800 sticky top-0 z-10">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">ชื่อสินค้า (Box Name)</th>
                      <th className="py-2 px-3">ขนาด L×W×H</th>
                      <th className="py-2 px-3">กระดาษ</th>
                      <th className="py-2 px-3">ระบบพิมพ์</th>
                      <th className="py-2 px-3 text-right">ราคาเดิม</th>
                      <th className="py-2 px-3 text-right">MOQ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    {convertedRecords.map((box, i) => (
                      <tr key={box.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono text-slate-500">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-white truncate max-w-[220px]">
                          {box.boxName}
                        </td>
                        <td className="py-2 px-3 font-mono text-cyan-300">
                          {box.dimensions.length}×{box.dimensions.width}×{box.dimensions.height} mm
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {box.paper.materialType} {box.paper.gsm}g
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {box.printing.pantoneColorsCount > 0 ? '6 สี + Spot' : '4 สี CMYK'}
                        </td>
                        <td className="py-2 px-3 font-mono text-amber-300 text-right font-bold">
                          ฿{box.revisions[0]?.sellingPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400 text-right">
                          {box.production.quantity.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>เมื่อกดนำเข้า ข้อมูลกล่องจะถูกบันทึกและพร้อมให้ค้นหา ดึงสเปก และคิดราคาทันที</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full sm:w-auto"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleCommitImport}
              disabled={isProcessing || convertedRecords.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all w-full sm:w-auto active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>⚡ นำเข้าสู่ฐานข้อมูล ({convertedRecords.length} กล่อง)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

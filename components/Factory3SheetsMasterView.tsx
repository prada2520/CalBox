import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Search,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  Box as BoxIcon,
  Filter,
  Save,
  Trash2,
  ExternalLink,
  Users,
  Building2,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Upload,
  RefreshCw,
  Info,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  FolderPlus,
  UserPlus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  CUSTOMER_LEGACY_DATASETS,
  CustomerLegacyDataset,
  CustomerLegacySheet,
  FactoryMatrixItem,
  FACTORY_QTY_TIERS,
  estimateItemCurrentBomCost,
  createTierList,
} from '../data/factory3SheetsData';
import { INITIAL_CUSTOMERS } from '../data/customerData';
import { exportCustomerLegacySheetsToExcel } from '../utils/exportUtils';
import { BoxCategory, BoxDimensions, PaperSpecs, PrintingSpecs, FinishingSpecs, ConvertingSpecs } from '../types';
import { ExcelBatchImporterModal } from './ExcelBatchImporterModal';

interface Factory3SheetsMasterViewProps {
  currentCustomerId?: string;
  onSelectCustomer?: (customerId: string) => void;
  onApplyToActiveSpecs?: (specs: {
    name: string;
    category: BoxCategory;
    dimensions: BoxDimensions;
    paper: Partial<PaperSpecs>;
    printing: Partial<PrintingSpecs>;
    finishing: Partial<FinishingSpecs>;
    converting: Partial<ConvertingSpecs>;
    notes?: string;
  }) => void;
  onNavigateToCalculator?: () => void;
}

export const Factory3SheetsMasterView: React.FC<Factory3SheetsMasterViewProps> = ({
  currentCustomerId,
  onSelectCustomer,
  onApplyToActiveSpecs,
  onNavigateToCalculator,
}) => {
  // Master state for all customer datasets
  const [datasets, setDatasets] = useState<CustomerLegacyDataset[]>(CUSTOMER_LEGACY_DATASETS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    currentCustomerId && CUSTOMER_LEGACY_DATASETS.some((d) => d.customerId === currentCustomerId)
      ? currentCustomerId
      : 'colgate'
  );

  // Synchronize when parent changes customer
  useEffect(() => {
    if (currentCustomerId && datasets.some((d) => d.customerId === currentCustomerId)) {
      setSelectedCustomerId(currentCustomerId);
    }
  }, [currentCustomerId, datasets]);

  // Active dataset
  const activeDataset = datasets.find((d) => d.customerId === selectedCustomerId) || datasets[0];

  // Active sheet within customer
  const [activeSheetId, setActiveSheetId] = useState<string>(
    activeDataset?.sheets[0]?.sheetId || 'sheet1_ifu'
  );

  // If customer changes and sheet not found, fallback to first sheet
  useEffect(() => {
    if (activeDataset && !activeDataset.sheets.some((s) => s.sheetId === activeSheetId)) {
      setActiveSheetId(activeDataset.sheets[0]?.sheetId || '');
    }
  }, [activeDataset, activeSheetId]);

  const activeSheet = activeDataset?.sheets.find((s) => s.sheetId === activeSheetId) || activeDataset?.sheets[0];

  // View Mode: 'matrix' (ตารางราคาเดิม) vs 'comparison' (เปรียบเทียบต้นทุนจริง & แนะนำการปรับราคา)
  const [viewMode, setViewMode] = useState<'matrix' | 'comparison'>('matrix');

  // Filters & Controls
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [gsmFilter, setGsmFilter] = useState<string>('all');
  const [isLocked, setIsLocked] = useState(true); // Default Read-Only Mode
  const [selectedBenchmarkQty, setSelectedBenchmarkQty] = useState<number>(3000); // 3,000 pcs standard
  const [selectedItemForInspect, setSelectedItemForInspect] = useState<FactoryMatrixItem | null>(null);

  // Modals State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchPercent, setBatchPercent] = useState<number>(4.0);
  const [batchTarget, setBatchTarget] = useState<'current_sheet' | 'all_customer_sheets'>('current_sheet');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showNewSheetModal, setShowNewSheetModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FactoryMatrixItem | null>(null);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustCode, setNewCustCode] = useState('');
  const [newCustIndustry, setNewCustIndustry] = useState('สินค้าอุปโภคบริโภค (FMCG)');
  const [newCustInitialSheet, setNewCustInitialSheet] = useState('ชีต 1: กล่องแป้งพิมพ์ 4 สี');

  // New Sheet Form State
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetDesc, setNewSheetDesc] = useState('');

  // Toast feedback
  const triggerToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filter items in active sheet
  const filteredItems = (activeSheet?.items || []).filter((item) => {
    const matchSearch =
      item.mapicNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.blockNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dimensionsStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.colorsAndProcess.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.paperType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGsm = gsmFilter === 'all' || item.gsm.toString() === gsmFilter;
    return matchSearch && matchGsm;
  });

  // Available GSMs
  const availableGsms = Array.from(new Set((activeSheet?.items || []).map((i) => i.gsm))).sort((a, b) => a - b);

  // Filtered customer list for quick picker
  const filteredCustomerList = datasets.filter(
    (d) =>
      d.customerName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      d.customerCode.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      d.industry.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  // Handle switching customer
  const handleCustomerChange = (newCustId: string) => {
    setSelectedCustomerId(newCustId);
    if (onSelectCustomer) {
      onSelectCustomer(newCustId);
    }
    const found = datasets.find((d) => d.customerId === newCustId);
    if (found && found.sheets.length > 0) {
      setActiveSheetId(found.sheets[0].sheetId);
    }
    setSelectedItemForInspect(null);
  };

  // Create new customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const custId = `cust_${Date.now()}`;
    const code = newCustCode.trim() || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const sheetId = `sheet_${Date.now()}`;

    const newDataset: CustomerLegacyDataset = {
      customerId: custId,
      customerName: newCustName.trim(),
      customerCode: code,
      industry: newCustIndustry,
      sheets: [
        {
          sheetId,
          sheetName: newCustInitialSheet.trim() || 'ชีต 1: กล่องบรรจุภัณฑ์หลัก',
          sheetDescription: 'ตารางบันทึกราคาและสเปกกล่องเริ่มต้น',
          baseYearLabel: 'ราคาฐานเดิม',
          previousRevisionLabel: 'ราคาปรับรอบก่อน',
          currentRevisionLabel: 'ราคาเสนอเป้าหมาย',
          items: [
            {
              id: `item_${Date.now()}_1`,
              sheetType: sheetId,
              sheetTitle: newCustInitialSheet.trim() || 'ชีต 1',
              mapicNo: 'ITEM-001',
              blockNo: 'BLK-01',
              description: 'กล่องตัวอย่างเริ่มต้น (Sample Box 1)',
              gsm: 350,
              dimensionsStr: '150 x 100 x 45',
              lengthMm: 150,
              widthMm: 100,
              heightMm: 45,
              colorsAndProcess: 'Offset 4 สี + เคลือบเงา + ไดคัทปะกาวข้าง',
              paperType: 'กระดาษกล่องแป้งหลังขาว 350g',
              standardTiers: createTierList({
                1000: { p2556: 6.5, p2565: 6.8, pCurrent: 7.2 },
                3000: { p2556: 5.5, p2565: 5.8, pCurrent: 6.1 },
                5000: { p2556: 4.8, p2565: 5.1, pCurrent: 5.4 },
                10000: { p2556: 4.2, p2565: 4.5, pCurrent: 4.8 },
              }),
              notes: 'รายการเริ่มต้น',
              lastUpdated: new Date().toLocaleDateString('th-TH'),
              activeRevisionNo: 1,
            },
          ],
        },
      ],
    };

    setDatasets([newDataset, ...datasets]);
    setSelectedCustomerId(custId);
    setActiveSheetId(sheetId);
    setShowNewCustomerModal(false);
    triggerToast(`เพิ่มลูกค้ารายใหม่ "${newCustName.trim()}" เข้าระบบเรียบร้อยแล้ว`);

    // Reset Form
    setNewCustName('');
    setNewCustCode('');
  };

  // Create new sheet
  const handleCreateNewSheet = () => {
    if (!newSheetName.trim() || !activeDataset) return;
    const newSheet: CustomerLegacySheet = {
      sheetId: `sheet_${Date.now()}`,
      sheetName: newSheetName.trim(),
      sheetDescription: newSheetDesc.trim() || 'ชีตรายการสินค้าใหม่',
      baseYearLabel: 'ราคาฐานเดิม',
      previousRevisionLabel: 'ราคาปรับรอบก่อน',
      currentRevisionLabel: 'ราคาเสนอเป้าหมาย',
      items: [],
    };

    const updatedSheets = [...activeDataset.sheets, newSheet];
    const updatedDatasets = datasets.map((d) =>
      d.customerId === activeDataset.customerId ? { ...d, sheets: updatedSheets } : d
    );

    setDatasets(updatedDatasets);
    setActiveSheetId(newSheet.sheetId);
    setShowNewSheetModal(false);
    setNewSheetName('');
    setNewSheetDesc('');
    triggerToast(`สร้างชีตใหม่ "${newSheet.sheetName}" สำเร็จ`);
  };

  // Batch import items from Excel
  const handleBatchImportItems = (importedItems: FactoryMatrixItem[]) => {
    if (!activeDataset || !activeSheet) return;

    const updatedItems = [...activeSheet.items, ...importedItems];
    const updatedSheets = activeDataset.sheets.map((s) =>
      s.sheetId === activeSheet.sheetId ? { ...s, items: updatedItems } : s
    );

    const updatedDatasets = datasets.map((d) =>
      d.customerId === activeDataset.customerId ? { ...d, sheets: updatedSheets } : d
    );

    setDatasets(updatedDatasets);
    triggerToast(`นำเข้าข้อมูลสำเร็จ ${importedItems.length} รายการเข้าสู่ชีต "${activeSheet.sheetName}"`);
  };

  // Save edited or newly added item
  const handleSaveEditedItem = (itemToSave: FactoryMatrixItem) => {
    if (!activeDataset || !activeSheet) return;

    const existingIndex = activeSheet.items.findIndex((i) => i.id === itemToSave.id);
    let updatedItems: FactoryMatrixItem[];

    if (existingIndex >= 0) {
      updatedItems = activeSheet.items.map((i) => (i.id === itemToSave.id ? itemToSave : i));
      triggerToast(`บันทึกการแก้ไข "${itemToSave.description}" เรียบร้อย`);
    } else {
      updatedItems = [itemToSave, ...activeSheet.items];
      triggerToast(`เพิ่มรายการสินค้า "${itemToSave.description}" เข้าระบบเรียบร้อย`);
    }

    const updatedSheets = activeDataset.sheets.map((s) =>
      s.sheetId === activeSheet.sheetId ? { ...s, items: updatedItems } : s
    );

    const updatedDatasets = datasets.map((d) =>
      d.customerId === activeDataset.customerId ? { ...d, sheets: updatedSheets } : d
    );

    setDatasets(updatedDatasets);
    setEditingItem(null);
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    if (!activeDataset || !activeSheet) return;
    const item = activeSheet.items.find((i) => i.id === itemId);
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${item?.description || 'รายการนี้'}"?`)) return;

    const updatedItems = activeSheet.items.filter((i) => i.id !== itemId);
    const updatedSheets = activeDataset.sheets.map((s) =>
      s.sheetId === activeSheet.sheetId ? { ...s, items: updatedItems } : s
    );

    const updatedDatasets = datasets.map((d) =>
      d.customerId === activeDataset.customerId ? { ...d, sheets: updatedSheets } : d
    );

    setDatasets(updatedDatasets);
    if (selectedItemForInspect?.id === itemId) {
      setSelectedItemForInspect(null);
    }
    triggerToast(`ลบรายการสำเร็จ`);
  };

  // Apply batch price revision (+%)
  const handleApplyBatchRevision = () => {
    if (!activeDataset) return;
    const factor = 1 + batchPercent / 100;

    let updatedSheets: CustomerLegacySheet[];

    if (batchTarget === 'current_sheet' && activeSheet) {
      updatedSheets = activeDataset.sheets.map((sheet) => {
        if (sheet.sheetId !== activeSheet.sheetId) return sheet;
        const newItems = sheet.items.map((item) => ({
          ...item,
          standardTiers: item.standardTiers.map((tier) => ({
            ...tier,
            priceCurrent: Number(((tier.price2565 || tier.price2556 || 0) * factor).toFixed(2)),
          })),
          lastUpdated: new Date().toLocaleDateString('th-TH'),
        }));
        return {
          ...sheet,
          currentRevisionLabel: `ราคาปรับใหม่ +${batchPercent}%`,
          items: newItems,
        };
      });
    } else {
      updatedSheets = activeDataset.sheets.map((sheet) => {
        const newItems = sheet.items.map((item) => ({
          ...item,
          standardTiers: item.standardTiers.map((tier) => ({
            ...tier,
            priceCurrent: Number(((tier.price2565 || tier.price2556 || 0) * factor).toFixed(2)),
          })),
          lastUpdated: new Date().toLocaleDateString('th-TH'),
        }));
        return {
          ...sheet,
          currentRevisionLabel: `ราคาปรับใหม่ +${batchPercent}%`,
          items: newItems,
        };
      });
    }

    const updatedDatasets = datasets.map((d) =>
      d.customerId === activeDataset.customerId ? { ...d, sheets: updatedSheets } : d
    );

    setDatasets(updatedDatasets);
    setShowBatchModal(false);
    triggerToast(
      `คำนวณและปรับราคา +${batchPercent}% ${
        batchTarget === 'current_sheet' ? `เฉพาะชีต ${activeSheet?.sheetName}` : 'ทุกชีตของลูกค้านี้'
      } สำเร็จ`
    );
  };

  // Synchronize item specs to Step 2 Calculator
  const handleSyncToCalculator = (item: FactoryMatrixItem) => {
    if (!onApplyToActiveSpecs) return;

    let category: BoxCategory = 'tuck_end';
    const lowerDesc = item.description.toLowerCase();
    const lowerProcess = item.colorsAndProcess.toLowerCase();

    if (lowerDesc.includes('ฝาครอบ') || lowerDesc.includes('set-up')) {
      category = 'lid_base';
    } else if (lowerDesc.includes('สไลด์') || lowerDesc.includes('ลิ้นชัก') || lowerDesc.includes('ถาด')) {
      category = 'sleeve_tray';
    } else if (lowerDesc.includes('ก้นล็อก') || lowerDesc.includes('auto lock')) {
      category = 'auto_bottom';
    } else if (lowerDesc.includes('ก้นขัด') || lowerDesc.includes('snap lock')) {
      category = 'snap_bottom';
    } else {
      category = 'tuck_end';
    }

    let pType = 'กระดาษกล่องแป้งหลังขาว (Duplex Board White Back)';
    if (item.paperType.includes('เทา')) {
      pType = 'กระดาษกล่องแป้งหลังเทา (Duplex Board Grey Back)';
    } else if (item.paperType.includes('คราฟท์') || item.paperType.includes('ลูกฟูก')) {
      pType = 'กระดาษคราฟท์ KA (Kraft Board)';
    } else if (item.paperType.includes('อาร์ต')) {
      pType = 'กระดาษอาร์ตการ์ด 1 หน้า (Art Card C1S)';
    } else if (item.paperType.includes('ปอนด์')) {
      pType = 'กระดาษปอนด์ขาว (Woodfree Paper)';
    }

    let colorCount = 4;
    if (lowerProcess.includes('5 สี')) colorCount = 5;
    if (lowerProcess.includes('6 สี')) colorCount = 6;
    if (lowerProcess.includes('1 สี') || lowerProcess.includes('พิมพ์ 1 สี')) colorCount = 1;
    if (lowerProcess.includes('2 สี')) colorCount = 2;

    const specs = {
      name: `${item.description} (${item.mapicNo})`,
      category,
      dimensions: {
        length: item.lengthMm || 150,
        width: item.widthMm || 100,
        height: item.heightMm || 40,
      },
      paper: {
        type: pType,
        gsm: item.gsm || 350,
      },
      printing: {
        colorsFront: colorCount,
        colorsBack: item.colorsAndProcess.includes('2 หน้า') ? 1 : 0,
      },
      finishing: {
        coating: item.colorsAndProcess.includes('ลามิเนต')
          ? ('opp_matte' as const)
          : item.colorsAndProcess.includes('อาบเงา') || item.colorsAndProcess.includes('UV')
          ? ('uv_varnish' as const)
          : ('none' as const),
        foiling: item.colorsAndProcess.includes('ฟอยล์'),
        embossing: item.colorsAndProcess.includes('ปั๊มนูน'),
        spotUv: item.colorsAndProcess.includes('สปอต'),
      },
      converting: {
        gluingType: item.colorsAndProcess.includes('ติดกาว')
          ? ('side_seam' as const)
          : ('none' as const),
      },
      notes: `อ้างอิงจากตารางราคาเดิมลูกค้า: ${activeDataset?.customerName} [MAPIC: ${item.mapicNo}, BLOCK: ${item.blockNo}]`,
    };

    onApplyToActiveSpecs(specs);
    triggerToast(`ดึงสเปก "${item.description}" เข้าสู่หน้าคิดราคา & 3D เรียบร้อยแล้ว`);
    
    if (onNavigateToCalculator) {
      onNavigateToCalculator();
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!activeDataset) return;
    exportCustomerLegacySheetsToExcel(
      activeDataset.customerName,
      activeDataset.customerCode,
      activeDataset.sheets
    );
    triggerToast(`ส่งออกไฟล์ Excel ตารางราคาเดิมของ ${activeDataset.customerName} เรียบร้อยแล้ว`);
  };

  // Calculate summary stats for comparison mode
  const comparisonStats = (activeSheet?.items || []).map((item) => {
    const tier = item.standardTiers.find((t) => t.qty === selectedBenchmarkQty);
    const legacyPrice = tier?.price2565 || tier?.price2556 || 0;
    const bomEst = estimateItemCurrentBomCost(item, selectedBenchmarkQty);
    const diffBaht = bomEst.unitPriceWithMargin - legacyPrice;
    const diffPct = legacyPrice > 0 ? (diffBaht / legacyPrice) * 100 : 0;
    return {
      item,
      legacyPrice,
      currentBomCost: bomEst.unitCost,
      recommendedPrice: bomEst.unitPriceWithMargin,
      diffBaht,
      diffPct,
      needAdjustment: diffPct > 5,
    };
  });

  const urgentAdjustCount = comparisonStats.filter((c) => c.diffPct > 10).length;
  const moderateAdjustCount = comparisonStats.filter((c) => c.diffPct > 3 && c.diffPct <= 10).length;
  const okCount = comparisonStats.filter((c) => c.diffPct <= 3).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASCADING FILTER LAYER 1: CUSTOMER LEVEL (แบ่งตามลูกค้าเป็นหลัก) */}
      {/* ========================================================================= */}
      <div className="bg-[#0f172a] p-4 sm:p-6 rounded-3xl border-2 border-slate-800 shadow-xl space-y-4">
        
        {/* Layer 1 Header & Active Customer Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>ขั้นที่ 1: เลือกลูกค้า (Customer Level)</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
                {datasets.length} ลูกค้าในระบบ
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="relative min-w-[240px] sm:min-w-[320px]">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  aria-label="เลือกลูกค้าสำหรับดูตารางราคาเดิม"
                  className="w-full appearance-none bg-[#1e293b] text-white text-sm sm:text-base font-black px-4 py-2.5 pr-10 rounded-2xl border-2 border-blue-500 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {datasets.map((ds) => (
                    <option key={ds.customerId} value={ds.customerId}>
                      🏢 {ds.customerName} ({ds.customerCode})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setShowNewCustomerModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white text-xs font-black border border-slate-700 hover:border-blue-400 transition-all flex items-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ เพิ่มลูกค้าใหม่</span>
              </button>

              <div className="text-xs text-slate-300 flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>อุตสาหกรรม: <strong className="text-amber-300">{activeDataset?.industry}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Tools & Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="bg-[#1e293b] p-1 rounded-2xl border border-slate-700 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ตารางกริดราคาเดิม</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('comparison')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'comparison'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-300" />
                <span>เปรียบเทียบต้นทุน & ปรับราคา</span>
              </button>
            </div>

            {/* Read-Only Mode / Edit Mode Indicator */}
            <button
              type="button"
              onClick={() => {
                setIsLocked(!isLocked);
                triggerToast(isLocked ? 'ปลดล็อกโหมดแก้ไขข้อมูล' : 'เปิดโหมดล็อกอ่านอย่างเดียว (Read-Only Mode)');
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-black border transition-all flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title={isLocked ? 'คลิกเพื่อปลดล็อกแก้ไข' : 'คลิกเพื่อล็อกป้องกันการแก้ไข'}
            >
              {isLocked ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>🔒 โหมดวิว (Read-Only)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-amber-400" />
                  <span>✏️ โหมดแก้ไข</span>
                </>
              )}
            </button>

            {/* Import Excel / CSV Button */}
            <button
              type="button"
              onClick={() => setShowExcelImportModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 border border-emerald-400/40 flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-200" />
              <span>นำเข้า Excel / CSV</span>
            </button>

            {/* Batch Revise Button */}
            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 border border-indigo-400/40 flex items-center gap-1.5 transition-all"
            >
              <Percent className="w-4 h-4 text-indigo-200" />
              <span>จำลองปรับราคา +%</span>
            </button>

            {/* Export Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </div>

        {/* Quick Customer Badges for Instant Switching */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 mr-1">เลือกลูกค้าด่วน:</span>
          {datasets.map((d) => {
            const isSelected = d.customerId === selectedCustomerId;
            return (
              <button
                key={d.customerId}
                type="button"
                onClick={() => handleCustomerChange(d.customerId)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 font-black'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{d.customerName.split(' ')[1] || d.customerName}</span>
                <span className="text-[10px] opacity-70 font-mono">({d.customerCode})</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* CASCADING FILTER LAYER 2: CATEGORY / SHEET LEVEL (เลือกประเภทกล่อง/ชีต) */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>ขั้นที่ 2: เลือกประเภทกล่อง / ชีตงาน (Category / Sheet Level)</span>
              </span>
              <span className="text-xs text-slate-400">
                ของ <strong>{activeDataset?.customerName}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowNewSheetModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-dashed border-amber-500/40 transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ เพิ่มประเภทกล่อง/ชีตใหม่</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(activeDataset?.sheets || []).map((sheet) => {
              const isActive = sheet.sheetId === activeSheetId;
              return (
                <button
                  key={sheet.sheetId}
                  type="button"
                  onClick={() => {
                    setActiveSheetId(sheet.sheetId);
                    setSelectedItemForInspect(null);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 border-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-500/25 font-black scale-[1.02]'
                      : 'bg-[#1e293b]/80 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <BoxIcon className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{sheet.sheetName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {sheet.items.length} รายการ
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CASCADING FILTER LAYER 3: BOX SEARCH & GSM FILTER */}
      {/* ========================================================================= */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          
          {/* Step 3 Badge */}
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
            <Search className="w-3.5 h-3.5" />
            <span>ขั้นที่ 3: เลือกรหัสกล่อง / ค้นหาสเปก</span>
          </span>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อกล่อง, MAPIC, BLOCK, ขนาด (mm), ชนิดกระดาษ..."
              className="w-full bg-[#1e293b] text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* GSM Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>แกรม:</span>
            <select
              value={gsmFilter}
              onChange={(e) => setGsmFilter(e.target.value)}
              aria-label="กรองตามแกรมกระดาษ"
              className="bg-[#1e293b] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            >
              <option value="all">ทั้งหมด ({availableGsms.length} แกรม)</option>
              {availableGsms.map((g) => (
                <option key={g} value={g.toString()}>
                  {g}g
                </option>
              ))}
            </select>
          </div>

          {/* If Comparison mode, benchmark qty selector */}
          {viewMode === 'comparison' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/50">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>ยอดสั่งผลิตวิเคราะห์:</span>
              <select
                value={selectedBenchmarkQty}
                onChange={(e) => setSelectedBenchmarkQty(Number(e.target.value))}
                aria-label="เลือกยอดสั่งผลิตสำหรับวิเคราะห์ต้นทุน"
                className="bg-[#1e293b] text-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-emerald-600 focus:outline-none"
              >
                {[500, 1000, 3000, 5000, 10000, 20000, 30000, 50000].map((q) => (
                  <option key={q} value={q}>
                    {q.toLocaleString()} ชิ้น
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Add single item button */}
        {!isLocked && (
          <button
            type="button"
            onClick={() => {
              if (!activeSheet) return;
              const newItem: FactoryMatrixItem = {
                id: `item_${Date.now()}`,
                sheetType: activeSheet.sheetId,
                sheetTitle: activeSheet.sheetName,
                mapicNo: '',
                blockNo: '',
                description: '',
                gsm: 350,
                dimensionsStr: '150 x 100 x 40',
                lengthMm: 150,
                widthMm: 100,
                heightMm: 40,
                colorsAndProcess: '4 สี + เคลือบเงา + ปั๊มไดคัท',
                paperType: 'กล่องแป้งหลังขาว 350g',
                standardTiers: FACTORY_QTY_TIERS.map((qty) => ({
                  qty,
                  label: `${qty.toLocaleString()}`,
                  price2556: 3.5,
                  price2565: 3.65,
                  priceCurrent: 3.8,
                })),
              };
              setEditingItem(newItem);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มรายการกล่อง</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* READ-ONLY / GRID VIEW DISPLAY (การแสดงผลกริดวิว โหมดอ่านอย่างเดียว) */}
      {/* ========================================================================= */}
      {viewMode === 'matrix' && activeSheet && (
        <div className="bg-[#0f172a] rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Grid Title Bar & Legends */}
          <div className="p-4 sm:p-5 bg-[#141e33] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  <span>{activeSheet.sheetName}</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  🔒 โหมดดูข้อมูลประวัติ (View-Only Grid)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{activeSheet.sheetDescription}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                <span>{activeSheet.baseYearLabel}</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>{activeSheet.previousRevisionLabel}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>{activeSheet.currentRevisionLabel}</span>
              </span>
            </div>
          </div>

          {/* Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {/* Level 1 Group Headers */}
                <tr className="bg-[#1e293b] text-slate-300 font-bold border-b border-slate-700">
                  <th colSpan={6} className="p-3 border-r border-slate-700 text-center bg-slate-900/60 font-black">
                    ข้อมูลสเปกสินค้าและแม่พิมพ์ (Specifications & Dimensions)
                  </th>
                  <th colSpan={5} className="p-3 border-r border-slate-700 text-center bg-blue-950/40 text-blue-300 font-black">
                    {activeSheet.baseYearLabel} (บาท/ชิ้น)
                  </th>
                  <th colSpan={5} className="p-3 border-r border-slate-700 text-center bg-amber-950/40 text-amber-300 font-black">
                    {activeSheet.previousRevisionLabel} (บาท/ชิ้น)
                  </th>
                  <th colSpan={4} className="p-3 border-r border-slate-700 text-center bg-emerald-950/40 text-emerald-300 font-black">
                    {activeSheet.currentRevisionLabel} (บาท/ชิ้น)
                  </th>
                  <th className="p-3 text-center bg-slate-900/80 font-black">การทำงาน</th>
                </tr>

                {/* Level 2 Column Headers */}
                <tr className="bg-[#172033] text-slate-400 text-[11px] font-mono border-b border-slate-700 whitespace-nowrap">
                  <th className="p-3 font-sans font-bold text-slate-300">MAPIC / รหัส</th>
                  <th className="p-3">BLOCK NO</th>
                  <th className="p-3 font-sans font-bold text-slate-300 min-w-[220px]">DESCRIPTION รายการกล่อง</th>
                  <th className="p-3 text-center">แกรม</th>
                  <th className="p-3 text-center">ขนาด (L×W×H)</th>
                  <th className="p-3 border-r border-slate-700 min-w-[200px]">พิมพ์ & เทคนิคหลังพิมพ์</th>
                  
                  {/* Base Year Tiers */}
                  <th className="p-2 text-right">500</th>
                  <th className="p-2 text-right">1,000</th>
                  <th className="p-2 text-right">3,000</th>
                  <th className="p-2 text-right">5,000</th>
                  <th className="p-2 text-right border-r border-slate-700">10,000</th>

                  {/* Previous Revision Tiers */}
                  <th className="p-2 text-right text-amber-300 font-bold">500</th>
                  <th className="p-2 text-right text-amber-300 font-bold">1,000</th>
                  <th className="p-2 text-right text-amber-300 font-bold">3,000</th>
                  <th className="p-2 text-right text-amber-300 font-bold">5,000</th>
                  <th className="p-2 text-right text-amber-300 font-bold border-r border-slate-700">10,000</th>

                  {/* Current / Target Tiers */}
                  <th className="p-2 text-right text-emerald-300 font-bold">1,000</th>
                  <th className="p-2 text-right text-emerald-300 font-bold">3,000</th>
                  <th className="p-2 text-right text-emerald-300 font-bold">5,000</th>
                  <th className="p-2 text-right text-emerald-300 font-bold border-r border-slate-700">10,000</th>

                  <th className="p-3 text-center">แอ็กชัน</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={22} className="p-10 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileSpreadsheet className="w-8 h-8 text-slate-600" />
                        <div>ไม่พบรายการกล่องที่ตรงกับคำค้นหา "{searchQuery}"</div>
                        <button
                          type="button"
                          onClick={() => setShowExcelImportModal(true)}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline font-bold"
                        >
                          คลิกที่นี่เพื่อนำเข้าไฟล์ Excel สเปกกล่อง
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItemForInspect?.id === item.id;
                    const tierMap: { [qty: number]: any } = {};
                    item.standardTiers.forEach((t) => {
                      tierMap[t.qty] = t;
                    });

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItemForInspect(item)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/60 ring-1 ring-blue-500'
                            : 'hover:bg-blue-950/30'
                        }`}
                      >
                        {/* Identifiers */}
                        <td className="p-3 font-mono text-[11px] font-bold text-blue-300 whitespace-nowrap">
                          {item.mapicNo || '-'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {item.blockNo || '-'}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{item.description}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                            )}
                          </div>
                          {item.notes && <div className="text-[10px] text-slate-500 mt-0.5">{item.notes}</div>}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-300">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] font-bold">
                            {item.gsm}g
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono text-[11px] text-cyan-300 whitespace-nowrap font-bold">
                          {item.dimensionsStr || `${item.lengthMm} x ${item.widthMm} x ${item.heightMm}`}
                        </td>
                        <td className="p-3 border-r border-slate-800 text-[11px] text-slate-300">
                          {item.colorsAndProcess}
                        </td>

                        {/* Base Year Tiers */}
                        <td className="p-2 text-right font-mono text-slate-400">
                          {tierMap[500]?.price2556 !== undefined && tierMap[500]?.price2556 !== null
                            ? tierMap[500].price2556.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-400">
                          {tierMap[1000]?.price2556 !== undefined && tierMap[1000]?.price2556 !== null
                            ? tierMap[1000].price2556.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-400">
                          {tierMap[3000]?.price2556 !== undefined && tierMap[3000]?.price2556 !== null
                            ? tierMap[3000].price2556.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-400">
                          {tierMap[5000]?.price2556 !== undefined && tierMap[5000]?.price2556 !== null
                            ? tierMap[5000].price2556.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-400 border-r border-slate-800">
                          {tierMap[10000]?.price2556 !== undefined && tierMap[10000]?.price2556 !== null
                            ? tierMap[10000].price2556.toFixed(2)
                            : '-'}
                        </td>

                        {/* Previous Revision Tiers */}
                        <td className="p-2 text-right font-mono text-amber-300 font-bold bg-amber-950/10">
                          {tierMap[500]?.price2565 !== undefined && tierMap[500]?.price2565 !== null
                            ? tierMap[500].price2565.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-amber-300 font-bold bg-amber-950/10">
                          {tierMap[1000]?.price2565 !== undefined && tierMap[1000]?.price2565 !== null
                            ? tierMap[1000].price2565.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-amber-300 font-bold bg-amber-950/10">
                          {tierMap[3000]?.price2565 !== undefined && tierMap[3000]?.price2565 !== null
                            ? tierMap[3000].price2565.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-amber-300 font-bold bg-amber-950/10">
                          {tierMap[5000]?.price2565 !== undefined && tierMap[5000]?.price2565 !== null
                            ? tierMap[5000].price2565.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-amber-300 font-bold bg-amber-950/10 border-r border-slate-800">
                          {tierMap[10000]?.price2565 !== undefined && tierMap[10000]?.price2565 !== null
                            ? tierMap[10000].price2565.toFixed(2)
                            : '-'}
                        </td>

                        {/* Current / Target Tiers */}
                        <td className="p-2 text-right font-mono text-emerald-400 font-black bg-emerald-950/15">
                          {tierMap[1000]?.priceCurrent !== undefined && tierMap[1000]?.priceCurrent !== null
                            ? tierMap[1000].priceCurrent.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-400 font-black bg-emerald-950/15">
                          {tierMap[3000]?.priceCurrent !== undefined && tierMap[3000]?.priceCurrent !== null
                            ? tierMap[3000].priceCurrent.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-400 font-black bg-emerald-950/15">
                          {tierMap[5000]?.priceCurrent !== undefined && tierMap[5000]?.priceCurrent !== null
                            ? tierMap[5000].priceCurrent.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-400 font-black bg-emerald-950/15 border-r border-slate-800">
                          {tierMap[10000]?.priceCurrent !== undefined && tierMap[10000]?.priceCurrent !== null
                            ? tierMap[10000].priceCurrent.toFixed(2)
                            : '-'}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSyncToCalculator(item)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all scale-100 hover:scale-105"
                              title="ดึงสเปกไปคิดราคาต้นทุน BOM และโมเดล 3D"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>ดึงคิดราคา</span>
                            </button>

                            {!isLocked && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(item)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="แก้ไขสเปกและราคา"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-800 text-red-400"
                                  title="ลบรายการ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Row Inspection Detail Footer if a row is selected */}
          {selectedItemForInspect && (
            <div className="p-4 sm:p-5 bg-[#0b0f19] border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <BoxIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono text-blue-300 font-bold">
                    {selectedItemForInspect.mapicNo} | BLOCK: {selectedItemForInspect.blockNo}
                  </div>
                  <h4 className="text-sm font-black text-white">{selectedItemForInspect.description}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ขนาด: <strong className="text-cyan-300">{selectedItemForInspect.dimensionsStr} มม.</strong> | กระดาษ: <strong className="text-slate-300">{selectedItemForInspect.paperType} ({selectedItemForInspect.gsm}g)</strong> | พิมพ์: <strong className="text-slate-300">{selectedItemForInspect.colorsAndProcess}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedItemForInspect(null)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  ปิดพรีวิว
                </button>

                <button
                  type="button"
                  onClick={() => handleSyncToCalculator(selectedItemForInspect)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>⚡ ดึงสเปกนี้เข้าสู่การคำนวณราคา & โมเดล 3D ทันที</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPARISON & VARIANCE ANALYSIS VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'comparison' && activeSheet && (
        <div className="space-y-4">
          
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#0f172a] rounded-2xl border border-red-500/30 flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs text-slate-400 font-bold">ต้นทุนขึ้นเกิน 10% (ต้องปรับราคาด่วน)</p>
                <h4 className="text-2xl font-black text-red-400 mt-0.5">{urgentAdjustCount} <span className="text-xs font-normal text-slate-400">รายการ</span></h4>
              </div>
              <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-[#0f172a] rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs text-slate-400 font-bold">กำไรบางลง 3-10% (ควรเจรจาปรับ)</p>
                <h4 className="text-2xl font-black text-amber-400 mt-0.5">{moderateAdjustCount} <span className="text-xs font-normal text-slate-400">รายการ</span></h4>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-[#0f172a] rounded-2xl border border-emerald-500/30 flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs text-slate-400 font-bold">ราคาเดิมยังเหมาะสม (Margin ปลอดภัย)</p>
                <h4 className="text-2xl font-black text-emerald-400 mt-0.5">{okCount} <span className="text-xs font-normal text-slate-400">รายการ</span></h4>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 bg-[#141e33] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>ตารางเปรียบเทียบ: ราคาเดิม vs ต้นทุนจริงปัจจุบัน (ที่ยอด {selectedBenchmarkQty.toLocaleString()} ชิ้น)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  วิเคราะห์ผลต่างกำไร (Margin Variance) เพื่อดูว่าสินค้าตัวไหนควรเสนอราคาใหม่ให้กับลูกค้า <strong>{activeDataset.customerName}</strong>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] text-slate-300 font-bold border-b border-slate-700">
                    <th className="p-3">MAPIC / รหัส</th>
                    <th className="p-3 min-w-[200px]">รายการสินค้า</th>
                    <th className="p-3 text-center">แกรม & สเปก</th>
                    <th className="p-3 text-right bg-slate-900/60 text-slate-400">ราคาขายเดิม (บาท)</th>
                    <th className="p-3 text-right bg-blue-950/40 text-blue-300">ต้นทุนผลิตปัจจุบัน (บาท)</th>
                    <th className="p-3 text-right bg-emerald-950/40 text-emerald-300">ราคาแนะนำใหม่ (Target 25%)</th>
                    <th className="p-3 text-right">ส่วนต่างต้นทุน</th>
                    <th className="p-3 text-center">สถานะ & ข้อแนะนำ</th>
                    <th className="p-3 text-center">แอ็กชัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {comparisonStats.map(({ item, legacyPrice, currentBomCost, recommendedPrice, diffBaht, diffPct }) => {
                    const isUrgent = diffPct > 10;
                    const isModerate = diffPct > 3 && diffPct <= 10;

                    return (
                      <tr key={item.id} className="hover:bg-blue-950/20 transition-colors">
                        <td className="p-3 font-mono text-[11px] font-bold text-blue-300">
                          {item.mapicNo || item.blockNo || '-'}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-100">{item.description}</div>
                          <div className="text-[10px] text-slate-400">{item.paperType} | {item.colorsAndProcess}</div>
                        </td>
                        <td className="p-3 text-center font-mono text-[11px] text-slate-400">
                          {item.gsm}g ({item.dimensionsStr || `${item.lengthMm}x${item.widthMm}`})
                        </td>
                        
                        {/* Legacy Selling Price */}
                        <td className="p-3 text-right font-mono font-bold text-slate-300 bg-slate-900/40">
                          ฿{legacyPrice > 0 ? legacyPrice.toFixed(2) : '-'}
                        </td>

                        {/* Current BOM Unit Cost */}
                        <td className="p-3 text-right font-mono font-bold text-blue-300 bg-blue-950/20">
                          ฿{currentBomCost.toFixed(2)}
                        </td>

                        {/* Recommended Price with 25% target margin */}
                        <td className="p-3 text-right font-mono font-black text-emerald-400 bg-emerald-950/20">
                          ฿{recommendedPrice.toFixed(2)}
                        </td>

                        {/* Variance */}
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={`inline-flex items-center gap-0.5 ${
                            diffBaht > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {diffBaht > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {diffBaht > 0 ? `+${diffBaht.toFixed(2)}` : diffBaht.toFixed(2)} ฿
                            <span className="text-[10px] opacity-80">({diffPct > 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`})</span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 text-center">
                          {isUrgent ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>ต้องปรับราคา (+{diffPct.toFixed(0)}%)</span>
                            </span>
                          ) : isModerate ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>ควรพิจารณาปรับ</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>กำไรเหมาะสม</span>
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSyncToCalculator(item)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1 shadow-sm transition-all"
                          >
                            <span>คิดราคาเต็ม</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXCEL BATCH IMPORTER MODAL */}
      {/* ========================================================================= */}
      {activeDataset && activeSheet && (
        <ExcelBatchImporterModal
          isOpen={showExcelImportModal}
          onClose={() => setShowExcelImportModal(false)}
          customerName={activeDataset.customerName}
          customerId={activeDataset.customerId}
          sheetName={activeSheet.sheetName}
          sheetId={activeSheet.sheetId}
          onImportItems={handleBatchImportItems}
        />
      )}

      {/* ========================================================================= */}
      {/* ADD NEW CUSTOMER MODAL */}
      {/* ========================================================================= */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl border-2 border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <Building2 className="w-5 h-5" />
                <h3 className="text-base font-black">เพิ่มลูกค้าใหม่เข้าระบบ (Add New Customer)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ชื่อบริษัท / แบรนด์ลูกค้า <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="เช่น บริษัท โอสถสภา จำกัด (มหาชน)..."
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">รหัสลูกค้า (Customer Code)</label>
                  <input
                    type="text"
                    value={newCustCode}
                    onChange={(e) => setNewCustCode(e.target.value)}
                    placeholder="เช่น CUST-OSP06"
                    className="w-full bg-[#1e293b] text-white font-mono px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">กลุ่มอุตสาหกรรม</label>
                  <select
                    value={newCustIndustry}
                    onChange={(e) => setNewCustIndustry(e.target.value)}
                    className="w-full bg-[#1e293b] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="สินค้าอุปโภคบริโภค (FMCG)">สินค้าอุปโภคบริโภค (FMCG)</option>
                    <option value="ยาและเวชภัณฑ์ (Pharma & Medical)">ยาและเวชภัณฑ์ (Pharma & Medical)</option>
                    <option value="เครื่องสำอาง & สกินแคร์ (Cosmetics)">เครื่องสำอาง & สกินแคร์ (Cosmetics)</option>
                    <option value="อาหารและเครื่องดื่ม (Food & Beverage)">อาหารและเครื่องดื่ม (Food & Beverage)</option>
                    <option value="อิเล็กทรอนิกส์ & อุตสาหกรรม (Industrial)">อิเล็กทรอนิกส์ & อุตสาหกรรม (Industrial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ชื่อประเภทกล่อง / ชีตเริ่มต้น</label>
                <input
                  type="text"
                  value={newCustInitialSheet}
                  onChange={(e) => setNewCustInitialSheet(e.target.value)}
                  placeholder="เช่น ชีต 1: กล่องแป้งพิมพ์ 4 สี"
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!newCustName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>บันทึกเพิ่มลูกค้า</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH PRICE REVISION MODAL */}
      {/* ========================================================================= */}
      {showBatchModal && activeDataset && activeSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <Percent className="w-5 h-5" />
                <h3 className="text-base font-black">จำลองปรับราคายกชุด (Batch Simulation)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ร้อยละการปรับราคา (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={batchPercent}
                    onChange={(e) => setBatchPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1e293b] text-white text-base font-bold font-mono px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                {/* Preset quick buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[3.0, 4.0, 5.0, 7.5, 10.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setBatchPercent(pct)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        batchPercent === pct
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ขอบเขตที่ต้องการนำไปใช้
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="batchTarget"
                      checked={batchTarget === 'current_sheet'}
                      onChange={() => setBatchTarget('current_sheet')}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="font-bold text-white block">เฉพาะชีตปัจจุบัน: {activeSheet.sheetName}</span>
                      <span className="text-[10px] text-slate-400">คำนวณและบันทึกลงในคอลัมน์ราคาปัจจุบันของชีตนี้</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="batchTarget"
                      checked={batchTarget === 'all_customer_sheets'}
                      onChange={() => setBatchTarget('all_customer_sheets')}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="font-bold text-white block">ทุกชีตของลูกค้า ({activeDataset.customerName})</span>
                      <span className="text-[10px] text-slate-400">ปรับราคายกชุดทั้ง {activeDataset.sheets.length} ชีตพร้อมกัน</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleApplyBatchRevision}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>คำนวณและบันทึกราคา</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW SHEET / CATEGORY MODAL */}
      {/* ========================================================================= */}
      {showNewSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <FolderPlus className="w-5 h-5" />
                <h3 className="text-base font-black">เพิ่มประเภทกล่อง / ชีตข้อมูลใหม่</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSheetModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ชื่อประเภทกล่อง / ชีต (เช่น กล่องลูกฟูกขนส่ง / กล่องเซรั่มพรีเมียม)
                </label>
                <input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder="กรอกชื่อประเภทกล่องหรือชีต..."
                  className="w-full bg-[#1e293b] text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  คำอธิบาย / รายละเอียดรอบราคา
                </label>
                <input
                  type="text"
                  value={newSheetDesc}
                  onChange={(e) => setNewSheetDesc(e.target.value)}
                  placeholder="เช่น ตารางราคาเดิมรอบปี 2565..."
                  className="w-full bg-[#1e293b] text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewSheetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleCreateNewSheet}
                disabled={!newSheetName.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 shadow-md"
              >
                สร้างชีต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / ADD SINGLE ITEM MODAL */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-black">แก้ไขข้อมูลสินค้า & ตารางราคา</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300">
              <div>
                <label className="block font-bold text-slate-300 mb-1">MAPIC NO / รหัสสินค้า</label>
                <input
                  type="text"
                  value={editingItem.mapicNo}
                  onChange={(e) => setEditingItem({ ...editingItem, mapicNo: e.target.value })}
                  placeholder="เช่น P1541749"
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">BLOCK NO</label>
                <input
                  type="text"
                  value={editingItem.blockNo}
                  onChange={(e) => setEditingItem({ ...editingItem, blockNo: e.target.value })}
                  placeholder="เช่น PSN 1725"
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">DESCRIPTION รายการสินค้า</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="ชื่อกล่องบรรจุภัณฑ์..."
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">แกรมกระดาษ (GSM)</label>
                <input
                  type="number"
                  value={editingItem.gsm}
                  onChange={(e) => setEditingItem({ ...editingItem, gsm: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ขนาดกล่อง (L x W x H มม.)</label>
                <input
                  type="text"
                  value={editingItem.dimensionsStr}
                  onChange={(e) => setEditingItem({ ...editingItem, dimensionsStr: e.target.value })}
                  placeholder="เช่น 150 x 100 x 40"
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">ชนิดกระดาษ</label>
                <input
                  type="text"
                  value={editingItem.paperType}
                  onChange={(e) => setEditingItem({ ...editingItem, paperType: e.target.value })}
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">กระบวนการพิมพ์ & หลังพิมพ์</label>
                <input
                  type="text"
                  value={editingItem.colorsAndProcess}
                  onChange={(e) => setEditingItem({ ...editingItem, colorsAndProcess: e.target.value })}
                  className="w-full bg-[#1e293b] text-white px-3.5 py-2 rounded-xl border border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleSaveEditedItem(editingItem)}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-md"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

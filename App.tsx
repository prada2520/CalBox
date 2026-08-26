import React, { useState, useMemo, useEffect } from 'react';
import {
  BoxCategory,
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  BoxPreset,
  Customer,
  CustomerBoxRecord,
  PriceRevision,
  IndustrialExcelItem,
} from './types';
import { MASTER_BOX_PRESETS } from './data/boxPresets';
import { PAPER_CATALOG } from './data/paperCatalog';
import { INITIAL_INDUSTRIAL_EXCEL_ROWS } from './data/industrialPresets';
import { calculatePackagingCosts, calculateQuantityTiers } from './utils/calculator';
import {
  loadStoredCustomers,
  saveStoredCustomers,
  loadStoredBoxRecords,
  recordNewPriceRevision,
} from './utils/storage';
import { exportCostingToExcel } from './utils/exportUtils';
import EnterpriseSidebar from './components/EnterpriseSidebar';
import CustomerHeaderBar from './components/CustomerHeaderBar';
import CustomerBoxHistoryModal from './components/CustomerBoxHistoryModal';
import SaveRevisionModal from './components/SaveRevisionModal';
import ActiveSpecsCard from './components/ActiveSpecsCard';
import LiveRateMatrix from './components/LiveRateMatrix';
import IndustrialExcelTable from './components/IndustrialExcelTable';
import EditSpecsDrawer from './components/EditSpecsDrawer';
import NewBoxWizardModal from './components/NewBoxWizardModal';
import FloatingCostCockpit from './components/FloatingCostCockpit';
import ResultsChart from './components/ResultsChart';
import BOMTable from './components/BOMTable';
import QuantityTierComparison from './components/QuantityTierComparison';
import QuotationModal from './components/QuotationModal';
import AIAdvisor from './components/AIAdvisor';
import { UserGuideModal } from './components/UserGuideModal';
import { Factory3SheetsMasterView } from './components/Factory3SheetsMasterView';
import { Step2QuickFilterBar } from './components/Step2QuickFilterBar';
import { BoxDiagramWithSpecs } from './components/BoxDiagramWithSpecs';
import { Box3DViewer } from './components/Box3DViewer';
import { WorkflowStepper, MainWorkflowStep } from './components/WorkflowStepper';
import { StepFooterNavigation } from './components/StepFooterNavigation';
import { CutSheetOptimizerPanel } from './components/CutSheetOptimizerPanel';
import { JobOrderModal } from './components/JobOrderModal';
import { WelcomeCleanDashboard } from './components/WelcomeCleanDashboard';
import { CustomerDataImportModal } from './components/CustomerDataImportModal';
import { QuickEmailQuoteModal } from './components/QuickEmailQuoteModal';
import { calculateSheetOptimization } from './utils/cutSheetOptimizer';
import { downloadElementAsPdf } from './utils/pdfExport';
import { ShareAppModal } from './components/ShareAppModal';
import {
  PackageCheck,
  FileDown,
  Layers,
  Save,
  History,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Edit3,
  TrendingUp,
  SlidersHorizontal,
  Bell,
  Settings,
  ShieldCheck,
  Zap,
  Eye,
  Sliders,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Clock,
  Box as BoxIcon,
  Ruler,
  Building2,
  Package,
  FileText,
  LayoutGrid,
  Smartphone,
  Mail,
  MessageSquare,
  Menu,
  Share2,
} from 'lucide-react';

const App: React.FC = () => {
  // 1. Customer & Box Records Storage State
  const [customers, setCustomers] = useState<Customer[]>(() => loadStoredCustomers());
  const [activeCustomer, setActiveCustomer] = useState<Customer>(() => {
    const list = loadStoredCustomers();
    return list[0] || {
      id: 'colgate',
      name: 'บริษัท คอลเกต-ปาล์มโอลีฟ (ประเทศไทย) จำกัด',
      code: 'CUST-CLG01',
      contactPerson: 'คุณเกรียงไกร',
      phone: '02-225-0171',
      email: 'kriengkrai@colgate.co.th',
      favoriteCategory: 'tuck_end',
    };
  });

  const [boxRecords, setBoxRecords] = useState<CustomerBoxRecord[]>(() => loadStoredBoxRecords());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filtered box records strictly for the active customer
  const customerBoxes = useMemo(() => {
    return boxRecords.filter((r) => r.customerId === activeCustomer.id);
  }, [boxRecords, activeCustomer.id]);

  // Initial Box State
  const defaultPreset = MASTER_BOX_PRESETS[0]; // Tuck End
  const initialBox = customerBoxes[0];

  const [activePresetId, setActivePresetId] = useState<string>(
    initialBox ? initialBox.boxCategory : defaultPreset.id
  );
  const [activePreset, setActivePreset] = useState<BoxPreset>(
    () => MASTER_BOX_PRESETS.find((p) => p.category === (initialBox?.boxCategory || defaultPreset.category)) || defaultPreset
  );
  const [activeBoxName, setActiveBoxName] = useState<string>(
    initialBox ? initialBox.boxName : defaultPreset.name
  );

  const [category, setCategory] = useState<BoxCategory>(
    initialBox ? initialBox.boxCategory : defaultPreset.category
  );
  const [dimensions, setDimensions] = useState<BoxDimensions>(
    initialBox ? initialBox.latestSnapshot.dimensions : defaultPreset.defaultDimensions
  );
  const [paper, setPaper] = useState<PaperSpecs>(
    initialBox ? initialBox.latestSnapshot.paper : defaultPreset.defaultPaper
  );
  const [printing, setPrinting] = useState<PrintingSpecs>(
    initialBox ? initialBox.latestSnapshot.printing : defaultPreset.defaultPrinting
  );
  const [finishing, setFinishing] = useState<FinishingSpecs>(
    initialBox ? initialBox.latestSnapshot.finishing : defaultPreset.defaultFinishing
  );
  const [converting, setConverting] = useState<ConvertingSpecs>(
    initialBox ? initialBox.latestSnapshot.converting : defaultPreset.defaultConverting
  );
  const [production, setProduction] = useState<ProductionSpecs>(
    initialBox ? initialBox.latestSnapshot.production : defaultPreset.defaultProduction
  );

  // 4-Step Guided Workflow State
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<MainWorkflowStep>('step1_presets');
  const [step1SubTab, setStep1SubTab] = useState<'welcome_start' | 'legacy_matrix' | 'standard_presets' | 'excel_matrix'>('welcome_start');

  // Industrial Excel Master Costing Matrix Rows
  const [industrialRows, setIndustrialRows] = useState<IndustrialExcelItem[]>(INITIAL_INDUSTRIAL_EXCEL_ROWS);

  // Apply row from industrial excel table to active box workspace
  const handleApplyIndustrialRowToActiveSpecs = (row: IndustrialExcelItem) => {
    setActiveBoxName(`${row.symbol} ${row.description}`);
    setCategory('tuck_end');
    setDimensions({
      length: row.lengthMm,
      width: row.widthMm,
      height: row.heightMm,
    });
    setPaper({
      materialType: `Duplex Board (${row.boardGsmQuoted}/${row.boardGsmCalculated} GSM)`,
      gsm: row.boardGsmCalculated,
      pricingUnit: 'per_kg',
      pricePerUnit: row.pricePerKgNew,
      wastePercent: row.paperWastePercent,
    });
    setPrinting({
      type: 'offset_cmyk',
      plateFixedCost: row.plateCostTotal || 0,
      printCostPerUnit: Number((row.conversionCostPerBox * 0.7).toFixed(4)),
      pantoneColorsCount: row.boardDiecutted.includes('สีพิเศษ') ? 1 : 0,
      pantoneFixedCostPerColor: 0,
    });
    setFinishing({
      coatingType: 'uv_coat',
      coatingCostPerUnit: row.mattedUvPerBox || 0.0015,
      hasSpotUv: row.spotUvPerBox > 0,
      spotUvFixedCost: 0,
      spotUvCostPerUnit: row.spotUvPerBox,
      hasFoilStamping: false,
      foilAreaWidthMm: 0,
      foilAreaHeightMm: 0,
      foilFixedCost: 0,
      foilCostPerUnit: 0,
      hasEmbossing: row.embossedPerBox > 0,
      embossFixedCost: 0,
      embossCostPerUnit: row.embossedPerBox,
    });
    setConverting({
      dieCutPlateFixedCost: row.diecutToolingTotal || 0,
      dieCutCostPerUnit: Number((row.conversionCostPerBox * 0.3).toFixed(4)),
      gluingType: 'auto_side',
      gluingCostPerUnit: 0,
      hasWindowPatching: false,
      windowFixedCost: 0,
      windowCostPerUnit: 0,
    });
    setProduction({
      quantity: row.runSize,
      markupPercent: 0,
      packingCostPerUnit: 0,
      otherFixedCosts: 0,
    });
    setActiveWorkflowStep('step2_calculator');
    showToast(`ซิงก์สเปกจากรหัส "${row.symbol} ${row.description}" เข้าสู่หน้าคิดราคา & 3D เรียบร้อย`);
  };

  // Sync item from Customer Legacy Sheets to active packaging specs
  const handleApplyFactoryItemToActiveSpecs = (specs: {
    name: string;
    category: BoxCategory;
    dimensions: BoxDimensions;
    paper: Partial<PaperSpecs>;
    printing: Partial<PrintingSpecs>;
    finishing: Partial<FinishingSpecs>;
    converting: Partial<ConvertingSpecs>;
    notes?: string;
  }) => {
    const validCategory: BoxCategory = [
      'tuck_end',
      'auto_bottom',
      'snap_bottom',
      'lid_base',
      'sleeve_tray',
      'folding_tray',
      'custom',
    ].includes(specs.category)
      ? specs.category
      : 'tuck_end';

    const matchedPreset = MASTER_BOX_PRESETS.find((p) => p.category === validCategory) || MASTER_BOX_PRESETS[0];
    setActivePresetId(matchedPreset.id);
    setActivePreset(matchedPreset);

    setActiveBoxName(specs.name || 'กล่องบรรจุภัณฑ์');
    setCategory(validCategory);
    setDimensions({
      length: Math.max(10, Number(specs.dimensions?.length) || 150),
      width: Math.max(10, Number(specs.dimensions?.width) || 100),
      height: Math.max(10, Number(specs.dimensions?.height) || 40),
    });
    setPaper((prev) => ({
      ...prev,
      ...specs.paper,
      gsm: Math.max(100, Number(specs.paper?.gsm) || prev.gsm || 350),
      pricePerUnit: Math.max(1, Number(specs.paper?.pricePerUnit) || prev.pricePerUnit || 26),
    }));
    setPrinting((prev) => ({ ...prev, ...specs.printing }));
    setFinishing((prev) => ({ ...prev, ...specs.finishing }));
    setConverting((prev) => ({ ...prev, ...specs.converting }));
    setActiveWorkflowStep('step2_calculator');
    showToast(`ดึงสเปก "${specs.name}" เข้าสู่หน้าคำนวณต้นทุน & ดูแบบ 3 มิติเรียบร้อย`);
  };

  // UI Modals & Drawers States
  const [isEditSpecsOpen, setIsEditSpecsOpen] = useState(false);
  const [isNewBoxWizardOpen, setIsNewBoxWizardOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isJobOrderOpen, setIsJobOrderOpen] = useState(false);
  const [isDataImportOpen, setIsDataImportOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSaveRevisionModalOpen, setIsSaveRevisionModalOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isQuickEmailQuoteOpen, setIsQuickEmailQuoteOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPriceLocked, setIsPriceLocked] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle instant parsed specs from Email / LINE / Text
  const handleApplyParsedSpecs = (specs: {
    boxName: string;
    category: BoxCategory;
    dimensions: BoxDimensions;
    paper: PaperSpecs;
    printing: PrintingSpecs;
    finishing: FinishingSpecs;
    converting: ConvertingSpecs;
    production: ProductionSpecs;
  }) => {
    setActiveBoxName(specs.boxName);
    setCategory(specs.category);
    setDimensions(specs.dimensions);
    setPaper(specs.paper);
    setPrinting(specs.printing);
    setFinishing(specs.finishing);
    setConverting(specs.converting);
    setProduction(specs.production);
    setActiveWorkflowStep('step2_calculator');
    showToast(`⚡ ถอดสเปก "${specs.boxName}" พร้อมคำนวณและแสดงโมเดล 3D ทันที`);
  };

  // Custom Cut Sheet Size
  const [customSheetSize, setCustomSheetSize] = useState<{ widthInch: number; lengthInch: number }>({
    widthInch: 23,
    lengthInch: 38.5,
  });

  // Handle complete import from legacy Excel / CSV files
  const handleImportComplete = (newBoxes: CustomerBoxRecord[], targetCustomer: Customer) => {
    setBoxRecords((prev) => [...newBoxes, ...prev]);
    setActiveCustomer(targetCustomer);
    if (newBoxes.length > 0) {
      const first = newBoxes[0];
      setActiveBoxName(first.boxName);
      setCategory(first.category);
      setDimensions(first.dimensions);
      setPaper(first.paper);
      setPrinting(first.printing);
      setFinishing(first.finishing);
      setConverting(first.converting);
      setProduction(first.production);
      setActiveWorkflowStep('step2_calculator');
      showToast(`🎉 นำเข้าข้อมูลสำเร็จ ${newBoxes.length} รายการสำหรับ ${targetCustomer.name} เรียบร้อยแล้ว`);
    }
  };

  // Live formatted clock matching screenshot
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const datePart = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
      setCurrentTimeStr(`${timePart} ${datePart}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find active box record
  const activeBoxRecord = useMemo(() => {
    return customerBoxes.find((b) => b.boxName === activeBoxName);
  }, [customerBoxes, activeBoxName]);

  // Auto-load customer's latest box when customer changes
  const handleSelectCustomer = (cust: Customer) => {
    setActiveCustomer(cust);
    const existingBoxes = boxRecords.filter((r) => r.customerId === cust.id);
    if (existingBoxes.length > 0) {
      const targetBox = existingBoxes[0];
      handleLoadCustomerBox(targetBox);
      showToast(`โหลดกล่อง "${targetBox.boxName}" ของ ${cust.name} สำเร็จ`);
    } else {
      const preset = MASTER_BOX_PRESETS.find((p) => p.category === cust.favoriteCategory) || defaultPreset;
      handleSelectPreset(preset);
      setActiveBoxName(`${cust.name.split(' ')[0]} - กล่องมาตรฐาน`);
    }
  };

  const handleAddNewCustomer = (newCust: Customer) => {
    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveStoredCustomers(updated);
    showToast(`เพิ่มลูกค้า "${newCust.name}" เรียบร้อยแล้ว`);
  };

  // Load a full box record
  const handleLoadCustomerBox = (record: CustomerBoxRecord) => {
    setActiveBoxName(record.boxName);
    setCategory(record.boxCategory);
    const snap = record.latestSnapshot;
    setDimensions({ ...snap.dimensions });
    setPaper({ ...snap.paper });
    setPrinting({ ...snap.printing });
    setFinishing({ ...snap.finishing });
    setConverting({ ...snap.converting });
    setProduction({ ...snap.production });

    const matchedPreset = MASTER_BOX_PRESETS.find((p) => p.category === record.boxCategory);
    if (matchedPreset) {
      setActivePresetId(matchedPreset.id);
      setActivePreset(matchedPreset);
    }
    // Lock by default to prevent accidental data changes
    setIsPriceLocked(true);
    showToast(`🔒 โหลดราคากล่อง "${record.boxName}" (Rev.${record.currentRevisionNo}) สำเร็จ ข้อมูลถูกล็อกไว้เพื่อความปลอดภัย`);
  };

  // Load a specific historical revision
  const handleLoadRevision = (rev: PriceRevision) => {
    setActiveBoxName(rev.boxName);
    setCategory(rev.boxCategory);
    setDimensions({ ...rev.dimensions });
    setPaper({ ...rev.paper });
    setPrinting({ ...rev.printing });
    setFinishing({ ...rev.finishing });
    setConverting({ ...rev.converting });
    setProduction({ ...rev.production });

    const matchedPreset = MASTER_BOX_PRESETS.find((p) => p.category === rev.boxCategory);
    if (matchedPreset) {
      setActivePresetId(matchedPreset.id);
      setActivePreset(matchedPreset);
    }
    // Lock by default
    setIsPriceLocked(true);
    showToast(`🔒 ดึงสเปก Revision ${rev.revisionNo} (${rev.formattedDate}) เข้าสู่หน้าคำนวณแล้ว (สถานะ: ล็อกราคาปลอดภัย)`);
  };

  // Toggle Price Protection Lock
  const handleTogglePriceLock = () => {
    setIsPriceLocked((prev) => {
      const next = !prev;
      if (next) {
        showToast('🔒 ล็อกข้อมูลราคาแล้ว — ป้องกันการเผลอคลิกแก้ไขโดยไม่ตั้งใจ');
      } else {
        showToast('🔓 ปลดล็อกโหมดแก้ไขแล้ว — สามารถปรับแต่งสเปกและราคาได้อิสระ');
      }
      return next;
    });
  };

  // Preset Selection
  const handleSelectPreset = (preset: BoxPreset) => {
    setActivePresetId(preset.id);
    setActivePreset(preset);
    setActiveBoxName(preset.name);
    setCategory(preset.category);
    setDimensions({ ...preset.defaultDimensions });
    setPaper({ ...preset.defaultPaper });
    setPrinting({ ...preset.defaultPrinting });
    setFinishing({ ...preset.defaultFinishing });
    setConverting({ ...preset.defaultConverting });
    setProduction({ ...preset.defaultProduction });
  };

  const handleResetToPresetDefaults = () => {
    const preset = MASTER_BOX_PRESETS.find((p) => p.id === activePresetId) || defaultPreset;
    handleSelectPreset(preset);
    showToast(`รีเซ็ตค่ามาตรฐานของ ${preset.name} แล้ว`);
  };

  // Handle Quick New Box Creation from Wizard
  const handleCreateNewBoxFromWizard = (params: {
    boxName: string;
    preset: BoxPreset;
    length: number;
    width: number;
    height: number;
    paperCatalogId: string;
    printingType: 'offset_cmyk' | 'offset_1color' | 'flexo_2color' | 'none';
    coatingType: 'matte_lam' | 'gloss_lam' | 'uv_coat' | 'none';
    quantity: number;
  }) => {
    const selectedPaperCat = PAPER_CATALOG.find((p) => p.id === params.paperCatalogId) || PAPER_CATALOG[0];

    setActivePresetId(params.preset.id);
    setActivePreset(params.preset);
    setActiveBoxName(params.boxName);
    setCategory(params.preset.category);
    setDimensions({
      length: params.length,
      width: params.width,
      height: params.height,
    });

    setPaper({
      materialType: selectedPaperCat.name,
      gsm: selectedPaperCat.defaultGsm,
      pricingUnit: selectedPaperCat.pricingUnit,
      pricePerUnit: selectedPaperCat.defaultPricePerUnit,
      wastePercent: 8,
    });

    setPrinting({
      type: params.printingType,
      plateFixedCost: params.printingType === 'none' ? 0 : params.printingType === 'flexo_2color' ? 1200 : 2000,
      printCostPerUnit: params.printingType === 'none' ? 0 : params.printingType === 'offset_cmyk' ? 0.95 : 0.45,
      pantoneColorsCount: 0,
      pantoneFixedCostPerColor: 600,
    });

    setFinishing({
      coatingType: params.coatingType,
      coatingCostPerUnit: params.coatingType === 'none' ? 0 : params.coatingType === 'matte_lam' ? 0.75 : 0.65,
      hasSpotUv: false,
      spotUvFixedCost: 0,
      spotUvCostPerUnit: 0,
      hasFoilStamping: false,
      foilAreaWidthMm: 0,
      foilAreaHeightMm: 0,
      foilFixedCost: 0,
      foilCostPerUnit: 0,
      hasEmbossing: false,
      embossFixedCost: 0,
      embossCostPerUnit: 0,
    });

    setConverting({
      ...params.preset.defaultConverting,
    });

    setProduction({
      quantity: params.quantity,
      markupPercent: 28,
      packingCostPerUnit: 0.15,
      otherFixedCosts: 0,
    });

    showToast(`สร้างกล่องใหม่ "${params.boxName}" และคำนวณราคาเรียบร้อยแล้ว`);
  };

  // 5. Calculation Results (Memoized)
  const result = useMemo(() => {
    return calculatePackagingCosts(
      category,
      dimensions,
      paper,
      printing,
      finishing,
      converting,
      production
    );
  }, [category, dimensions, paper, printing, finishing, converting, production]);

  // 6. Volume Tiers Calculation (Memoized)
  const quantityTiers = useMemo(() => {
    return calculateQuantityTiers(
      category,
      dimensions,
      paper,
      printing,
      finishing,
      converting,
      production
    );
  }, [category, dimensions, paper, printing, finishing, converting, production]);

  // 7. Cut Sheet & Imposition Optimization (Memoized based on Real Factory Specs)
  const sheetOptimizer = useMemo(() => {
    return calculateSheetOptimization(
      dimensions,
      category,
      paper.gsm,
      production.quantity,
      customSheetSize
    );
  }, [dimensions, category, paper.gsm, production.quantity, customSheetSize]);

  // Save new revision with reason
  const handleConfirmSaveRevision = (boxName: string, reason: string) => {
    const currentBox = customerBoxes.find((b) => b.boxName.toLowerCase() === boxName.trim().toLowerCase());
    const { updatedRecords, newRevision } = recordNewPriceRevision({
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      boxId: currentBox?.id,
      boxName: boxName.trim(),
      boxCategory: category,
      reason: reason.trim(),
      dimensions,
      paper,
      printing,
      finishing,
      converting,
      production,
      result,
      quantityTiers,
    });

    setBoxRecords(updatedRecords);
    setActiveBoxName(boxName.trim());
    setIsPriceLocked(true);
    showToast(`บันทึก Revision ${newRevision.revisionNo} เข้าประวัติของ ${activeCustomer.name} สำเร็จ (ล็อกราคาเพื่อความปลอดภัย)`);
  };

  // Export to Excel handler
  const handleDirectExportExcel = () => {
    const currentBox = customerBoxes.find((b) => b.boxName === activeBoxName);
    exportCostingToExcel({
      customer: activeCustomer,
      boxName: activeBoxName,
      categoryName: activePreset.name,
      dimensions,
      paper,
      printing,
      finishing,
      converting,
      production,
      result,
      tiers: quantityTiers,
      revisions: currentBox?.revisions,
      industrialRows,
    });
    showToast('ดาวน์โหลดไฟล์ Excel (.xlsx) รวมชีตมาตรฐานโรงงานสำเร็จ');
  };

  // Rich Context Summary for AI Packaging Consultant
  const contextSummary = useMemo(() => {
    if (!result) return '';
    const currentBox = customerBoxes.find((b) => b.boxName === activeBoxName);
    const revCount = currentBox?.revisions.length || 0;
    return `
      === CUSTOMER CONTEXT ===
      - Customer Name: ${activeCustomer.name} (${activeCustomer.code})
      - Contact: ${activeCustomer.contactPerson} | Phone: ${activeCustomer.phone}
      - Saved Box Revisions for this customer: ${revCount} revisions
      
      === ACTIVE BOX SPECIFICATIONS ===
      - Box Name/Job: ${activeBoxName}
      - Category: ${activePreset.name} (${activePreset.nameEn})
      - Dimensions: ${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm
      - Spread Dieline Size: ${Math.round(result.spreadWidthMm)} x ${Math.round(result.spreadHeightMm)} mm
      - Sheet Area (inc. ${paper.wastePercent}% waste): ${result.areaSqM.toFixed(4)} sq.m.
      - Box Weight: ${result.weightPerBoxGrams.toFixed(1)} grams/box
      
      === MATERIAL & PAPER ===
      - Material: ${paper.materialType} (${paper.gsm} GSM)
      - Unit Price: ${paper.pricePerUnit} THB / ${paper.pricingUnit === 'per_kg' ? 'kg' : 'sq.m.'}
      - Paper Cost: ${result.materialCostPerUnit.toFixed(2)} THB / box
      
      === PRINTING & FINISHING ===
      - Printing: ${printing.type.toUpperCase()} (Plate: ${printing.plateFixedCost} THB, Unit Labor: ${printing.printCostPerUnit} THB)
      - Pantone Spot Colors: ${printing.pantoneColorsCount} colors
      - Coating: ${finishing.coatingType} (${finishing.coatingCostPerUnit} THB/box)
      - Spot UV: ${finishing.hasSpotUv ? `Yes (${finishing.spotUvCostPerUnit} THB/box)` : 'No'}
      - Hot Foil Stamping: ${finishing.hasFoilStamping ? `Yes (${finishing.foilCostPerUnit} THB/box)` : 'No'}
      - Embossing: ${finishing.hasEmbossing ? `Yes (${finishing.embossCostPerUnit} THB/box)` : 'No'}
      
      === CONVERTING & ASSEMBLY ===
      - Die-cut Plate: ${converting.dieCutPlateFixedCost} THB (Labor: ${converting.dieCutCostPerUnit} THB/box)
      - Gluing: ${converting.gluingType} (${converting.gluingCostPerUnit} THB/box)
      
      === ORDER & PRICING ===
      - Quantity: ${production.quantity.toLocaleString()} units
      - Markup: ${production.markupPercent}%
      - Unit Cost: ${result.totalCostPerUnit.toFixed(2)} THB
      - Recommended Selling Price: ${result.sellingPricePerUnit.toFixed(2)} THB / unit
      - Total Order Value: ${result.totalOrderValue.toLocaleString()} THB
      - Total Profit: ${result.totalProfit.toLocaleString()} THB
    `;
  }, [activeCustomer, activeBoxName, customerBoxes, activePreset, dimensions, paper, printing, finishing, converting, production, result]);

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#161f36] text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header Bar matching screenshot */}
      <header className="bg-[#0b0f19] border-b border-slate-800/80 sticky top-0 z-30 h-14 flex items-center px-3 sm:px-6 justify-between select-none">
        {/* Left: Hamburger for Mobile + Path / Breadcrumbs */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            title="เปิดเมนูหลัก (Menu)"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-400 font-mono overflow-hidden">
            <span className="text-slate-500">/</span>
            <span className="text-slate-200 font-semibold truncate max-w-[100px] sm:max-w-none">
              {activeCustomer?.name.split(' ')[0]}
            </span>
            <span className="text-slate-500 hidden sm:inline">/</span>
            <span className="text-blue-400 font-bold truncate max-w-[120px] sm:max-w-none hidden sm:inline">
              {activeBoxName}
            </span>
          </div>
        </div>

        {/* Right: Quick Quote button, Share Button, Time, Notifications, User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Share App Link Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/40 transition-all shadow-sm active:scale-95"
            title="แชร์ลิงก์ระบบ หรือคัดลอก URL เพื่อแนะนำส่งต่อ"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">แชร์ลิงก์</span>
          </button>

          {/* Quick Email / LINE Smart Quote Button */}
          <button
            type="button"
            onClick={() => setIsQuickEmailQuoteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white text-xs font-black shadow-md shadow-blue-500/25 border border-blue-400/40 transition-all animate-pulse"
            title="คิดราคาด่วนจากข้อความอีเมล / LINE ของลูกค้า"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden xs:inline">⚡ คิดราคาจากอีเมล/LINE</span>
            <span className="xs:hidden">⚡ คิดราคาด่วน</span>
          </button>

          <div className="hidden md:block text-right">
            <div className="text-xs font-bold text-slate-200 font-mono">
              {currentTimeStr || '07:15 PM Sat, Aug 22, 2026'}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="Notifications / Revisions"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                {activeBoxRecord?.revisions.length || 3}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditSpecsOpen(true)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="System Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 font-black text-xs flex items-center justify-center border border-blue-500/40">
                JD
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">John Doe</div>
                <div className="text-[10px] text-slate-400 leading-tight">Operations</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden pb-16 lg:pb-0">
        
        {/* Left Sidebar (Desktop & Mobile Drawer) */}
        <EnterpriseSidebar
          activeTab={activeWorkflowStep}
          setActiveTab={(tab: string) => setActiveWorkflowStep(tab as MainWorkflowStep)}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          activeCustomer={activeCustomer}
          onOpenCustomerSelect={() => {}}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onOpenQuotation={() => setIsQuotationOpen(true)}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
          onOpenDataImport={() => setIsDataImportOpen(true)}
          onOpenQuickEmailQuote={() => setIsQuickEmailQuoteOpen(true)}
          isMobileOpen={isMobileDrawerOpen}
          onMobileClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Central & Right Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Hero Configuration Bar matching screenshot */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner shrink-0 mt-0.5">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Packaging Structure & BOM Rate Matrix
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                  Configure box dimensions, paper GSM, print plates, and finishing rates. Real-time cost calculations and quotation generator.
                </p>
              </div>
            </div>

            {/* Status Badges Row & Save Revision Action */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Changes Saved</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator Access</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Integration: Connected</span>
              </div>

              <button
                type="button"
                onClick={() => setIsQuotationOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Preview Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaveRevisionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all border border-blue-400/40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Customer & Box Selector Header */}
          <CustomerHeaderBar
            customers={customers}
            activeCustomer={activeCustomer}
            onSelectCustomer={handleSelectCustomer}
            onAddNewCustomer={handleAddNewCustomer}
            customerBoxes={customerBoxes}
            activeBoxName={activeBoxName}
            onLoadCustomerBox={handleLoadCustomerBox}
            onOpenNewBoxWizard={() => setIsNewBoxWizardOpen(true)}
            onOpenEditSpecs={() => setIsEditSpecsOpen(true)}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
            isPriceLocked={isPriceLocked}
            onTogglePriceLock={handleTogglePriceLock}
            onOpenUserGuide={() => setIsUserGuideOpen(true)}
            onOpenShareApp={() => setIsShareModalOpen(true)}
          />

          {/* Locked Price Protection Alert Banner */}
          {isPriceLocked && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-black">🔒</span>
                <div>
                  <span className="font-bold text-amber-100">โหมดล็อกราคาปลอดภัย (Price Lock Active):</span>{' '}
                  <span className="text-amber-200/80">
                    ข้อมูลราคาของกล่องนี้ถูกล็อกไว้ป้องกันการเผลอแก้ไข หากต้องการปรับสเปก กรุณาปลดล็อกเพื่อแก้ไข หรือคลิก "Save Changes" เพื่อบันทึกเป็น Revision ใหม่
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTogglePriceLock}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-xs"
                >
                  🔓 ปลดล็อกแก้ไข (Unlock)
                </button>
                <button
                  type="button"
                  onClick={() => setIsUserGuideOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                >
                  📖 ดูคู่มือ
                </button>
              </div>
            </div>
          )}

          {/* 4-Step Process Guide Stepper Navigation */}
          <WorkflowStepper
            currentStep={activeWorkflowStep}
            onSelectStep={setActiveWorkflowStep}
            activeBoxName={activeBoxName}
            customerName={activeCustomer.name}
          />

          {/* 2-Column Workstation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left/Center Workspace (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* STEP 1: Select Box Specs & Legacy Price Matrix */}
              {activeWorkflowStep === 'step1_presets' && (
                <div className="space-y-6">
                  {/* Step 1 Sub-View Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111726]/80 p-2.5 rounded-2xl border border-slate-800 shadow-md">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setStep1SubTab('welcome_start')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          step1SubTab === 'welcome_start'
                            ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/30 border border-blue-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>หน้าเริ่มงานใหม่ & ค้นหาด่วน</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-mono font-bold">
                          CLEAN START
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep1SubTab('legacy_matrix')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          step1SubTab === 'legacy_matrix'
                            ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-500/30 border border-indigo-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-300" />
                        <span>ชีตราคาเดิมลูกค้า</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-400/20 text-blue-200 font-mono font-bold">
                          LEGACY
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep1SubTab('standard_presets')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          step1SubTab === 'standard_presets'
                            ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/30 border border-emerald-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-300" />
                        <span>แม่แบบกล่องมาตรฐาน</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep1SubTab('excel_matrix')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          step1SubTab === 'excel_matrix'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 border border-amber-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>สูตรตาราง Master Excel</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 px-2 font-medium hidden sm:block">
                      เลือกสเปกเพื่อดึงเข้าสู่ขั้นตอนคำนวณต้นทุน
                    </div>
                  </div>

                  {/* Sub-view 0: Welcome Clean Start Dashboard */}
                  {step1SubTab === 'welcome_start' && (
                    <WelcomeCleanDashboard
                      customers={customers}
                      activeCustomer={activeCustomer}
                      boxRecords={boxRecords}
                      onSelectCustomer={handleSelectCustomer}
                      onStartNewBox={() => {
                        setIsNewBoxWizardOpen(true);
                      }}
                      onSelectPreset={(p) => {
                        handleSelectPreset(p);
                        setActiveWorkflowStep('step2_calculator');
                      }}
                      onSelectLegacyItem={handleApplyFactoryItemToActiveSpecs}
                      onOpenCustomerDirectory={() => setStep1SubTab('legacy_matrix')}
                      onOpenDataImport={() => setIsDataImportOpen(true)}
                    />
                  )}

                  {/* Sub-view 1: Customer Legacy 3-Sheet Benchmark Table */}
                  {step1SubTab === 'legacy_matrix' && (
                    <Factory3SheetsMasterView
                      currentCustomerId={activeCustomer.id}
                      onSelectCustomer={(cId) => {
                        const found = customers.find((c) => c.id === cId);
                        if (found) {
                          handleSelectCustomer(found);
                        }
                      }}
                      onApplyToActiveSpecs={handleApplyFactoryItemToActiveSpecs}
                      onNavigateToCalculator={() => setActiveWorkflowStep('step2_calculator')}
                    />
                  )}

                  {/* Sub-view 2: Standard Box Presets Gallery */}
                  {step1SubTab === 'standard_presets' && (
                    <div className="bg-[#111726]/90 rounded-2xl border border-slate-800 p-5 space-y-4 text-white">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-white">แม่แบบโครงสร้างกล่องมาตรฐาน (Standard Box Presets)</h3>
                          <p className="text-xs text-slate-400">คลิกที่แม่แบบเพื่อโหลดขนาดมาตรฐานและสูตรการคิดราคาเริ่มต้น</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {MASTER_BOX_PRESETS.map((preset) => {
                          const isSelected = activePresetId === preset.id;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => {
                                handleSelectPreset(preset);
                                setActiveWorkflowStep('step2_calculator');
                              }}
                              className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                                isSelected
                                  ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20 text-white'
                                  : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-sm text-white">{preset.name}</div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-400">
                                  {preset.category}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 space-y-1">
                                <div>ขนาดเริ่มต้น: <strong className="text-slate-200">{preset.defaultDimensions.length} × {preset.defaultDimensions.width} × {preset.defaultDimensions.height} mm</strong></div>
                                <div>กระดาษ: <strong className="text-slate-200">{preset.defaultPaper.materialType} {preset.defaultPaper.gsm}g</strong></div>
                              </div>
                              <button
                                type="button"
                                className="mt-3 w-full py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>เลือกและไปคำนวณต้นทุน (Step 2) →</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-view 3: Industrial Master Excel Sheet */}
                  {step1SubTab === 'excel_matrix' && (
                    <IndustrialExcelTable
                      rows={industrialRows}
                      onChangeRows={setIndustrialRows}
                      onApplyRowToActiveSpecs={handleApplyIndustrialRowToActiveSpecs}
                    />
                  )}

                  {/* Step 1 Footer */}
                  <StepFooterNavigation
                    currentStep="step1_presets"
                    onSelectStep={setActiveWorkflowStep}
                  />
                </div>
              )}

              {/* STEP 2: Cost Calculation, Live Specs & 3D Interactive Model */}
              {activeWorkflowStep === 'step2_calculator' && (
                <div className="space-y-6">
                  {/* Step 2 Fast Search & Filter Bar */}
                  <Step2QuickFilterBar
                    activeCustomer={activeCustomer}
                    activeBoxName={activeBoxName}
                    customerBoxes={customerBoxes}
                    activePresetId={activePresetId}
                    onApplyPreset={handleSelectPreset}
                    onLoadCustomerBox={handleLoadCustomerBox}
                    onApplyFactoryLegacyItem={handleApplyFactoryItemToActiveSpecs}
                    onApplyPaperGrade={(p) => setPaper((prev) => ({ ...prev, ...p }))}
                  />

                  {/* Interactive Rate Matrix */}
                  <LiveRateMatrix
                    dimensions={dimensions}
                    paper={paper}
                    printing={printing}
                    finishing={finishing}
                    converting={converting}
                    production={production}
                    result={result}
                    activePresetId={activePresetId}
                    onSelectPreset={handleSelectPreset}
                    onChangeDimensions={setDimensions}
                    onChangePaper={setPaper}
                    onChangePrinting={setPrinting}
                    onChangeFinishing={setFinishing}
                    onChangeConverting={setConverting}
                    onChangeProduction={setProduction}
                  />

                  {/* Active Specs Detail Card (Interactive 3D / Fold-Unfold / Dimension Tweaker) */}
                  <ActiveSpecsCard
                    category={category}
                    categoryName={activePreset.name}
                    boxName={activeBoxName}
                    onChangeBoxName={setActiveBoxName}
                    dimensions={dimensions}
                    paper={paper}
                    printing={printing}
                    finishing={finishing}
                    converting={converting}
                    production={production}
                    result={result}
                    activePresetId={activePresetId}
                    onSelectPreset={handleSelectPreset}
                    onChangeDimensions={setDimensions}
                    onChangePaper={setPaper}
                    onChangePrinting={setPrinting}
                    onChangeFinishing={setFinishing}
                    onChangeConverting={setConverting}
                    onChangeProduction={setProduction}
                    onEditSpecs={() => setIsEditSpecsOpen(true)}
                  />

                  {/* Cut Sheet & Imposition Optimizer Panel (Real Factory Benchmark) */}
                  <CutSheetOptimizerPanel
                    dimensions={dimensions}
                    category={category}
                    paper={paper}
                    production={production}
                    optimizationResult={sheetOptimizer}
                    onSelectSheetSize={(w, l) => setCustomSheetSize({ widthInch: w, lengthInch: l })}
                    onOpenJobTicket={() => setIsJobOrderOpen(true)}
                  />

                  {/* BOM Table (Itemized Cost Breakdown) */}
                  <BOMTable
                    items={result.bomItems}
                    quantity={production.quantity}
                    totalCostPerUnit={result.totalCostPerUnit}
                    totalOrderCost={result.totalCostPerUnit * production.quantity}
                  />

                  {/* Step 2 Footer */}
                  <StepFooterNavigation
                    currentStep="step2_calculator"
                    onSelectStep={setActiveWorkflowStep}
                  />
                </div>
              )}

              {/* STEP 3: Volume Tier Pricing & Cost Structure Analysis */}
              {activeWorkflowStep === 'step3_tiers' && (
                <div className="space-y-6">
                  {/* Volume Tier Pricing */}
                  <QuantityTierComparison
                    tiers={quantityTiers}
                    currentQuantity={production.quantity}
                    onSelectQuantity={(q) => setProduction({ ...production, quantity: q })}
                  />

                  {/* Cost Breakdown Chart */}
                  <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 text-white">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        กราฟสัดส่วนโครงสร้างต้นทุนต่อใบ (BOM Cost Structure)
                      </h3>
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                        {production.quantity.toLocaleString()} ใบ
                      </span>
                    </div>
                    <ResultsChart data={result} production={production} />
                  </div>

                  {/* Step 3 Footer */}
                  <StepFooterNavigation
                    currentStep="step3_tiers"
                    onSelectStep={setActiveWorkflowStep}
                  />
                </div>
              )}

              {/* STEP 4: Official Quotation & Price Revision History */}
              {activeWorkflowStep === 'step4_quotation' && (
                <div className="space-y-6">
                  {/* Official Quotation Document View */}
                  <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden">
                    <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-black">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-white">
                            ใบเสนอราคาทางการ (Official Quotation Document)
                          </h3>
                          <p className="text-xs text-slate-400">
                            เอกสารสรุปราคาพร้อมพิมพ์หรือส่งออกสำหรับ {activeCustomer.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDirectExportExcel()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>ส่งออก Excel (.xlsx)</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            showToast('กำลังประมวลผลและสร้างไฟล์ PDF...');
                            const safeCustomer = activeCustomer ? activeCustomer.name.replace(/[^a-zA-Z0-9ก-๙]/g, '_') : 'General';
                            const safeBox = activeBoxName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
                            const fileName = `Quotation_${safeCustomer}_${safeBox}.pdf`;
                            const success = await downloadElementAsPdf({
                              elementId: 'step4-embedded-quotation-doc',
                              fileName,
                              title: `ใบเสนอราคา ${activeBoxName}`,
                            });
                            if (success) {
                              showToast('✓ ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว!');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md transition-colors animate-pulse"
                          title="บันทึกใบเสนอราคานี้เป็นไฟล์ PDF คุณภาพสูงลงเครื่องทันที"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>บันทึก PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsQuotationOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>พรีวิวเต็มจอ</span>
                        </button>
                      </div>
                    </div>

                    {/* Embedded Quotation Sheet */}
                    <div id="step4-embedded-quotation-doc" className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm font-sans bg-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-4 gap-4">
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-slate-900">
                            โรงพิมพ์ & บรรจุภัณฑ์ PackCalc Niyomkij
                          </h2>
                          <p className="text-xs text-slate-500">
                            ผู้นำด้านการผลิตกล่องบรรจุภัณฑ์ กล่องลูกฟูก และสิ่งพิมพ์มาตรฐานสากล
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white text-xs font-bold rounded">
                            QUOTATION
                          </span>
                          <div className="text-xs text-slate-500 mt-1">
                            วันที่: <strong className="text-slate-900">{new Date().toLocaleDateString('th-TH')}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Customer & Item details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase">ลูกค้า (Customer):</div>
                          <div className="font-bold text-slate-900 text-sm">{activeCustomer.name}</div>
                          <div className="text-xs text-slate-600">ผู้ติดต่อ: {activeCustomer.contactPerson} | โทร: {activeCustomer.phone}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase">รายการกล่อง (Item):</div>
                          <div className="font-bold text-slate-900 text-sm">{activeBoxName}</div>
                          <div className="text-xs text-slate-600">
                            ขนาด {dimensions.length}×{dimensions.width}×{dimensions.height} mm | {paper.materialType} {paper.gsm}g
                          </div>
                        </div>
                      </div>

                      {/* Tier Price Summary Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 text-xs font-black border-b border-slate-200">
                              <th className="p-2.5">ระดับจำนวนสั่งผลิต (Units)</th>
                              <th className="p-2.5 text-right">ต้นทุนเฉลี่ย/ใบ</th>
                              <th className="p-2.5 text-right">ราคาขายเสนอ/ใบ</th>
                              <th className="p-2.5 text-right">ยอดรวม (บาท)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {quantityTiers.map((t) => (
                              <tr key={t.quantity} className={t.quantity === production.quantity ? 'bg-blue-50 font-bold' : ''}>
                                <td className="p-2.5 font-mono">{t.quantity.toLocaleString()} ใบ</td>
                                <td className="p-2.5 text-right font-mono text-slate-600">{(t.costPerUnit ?? t.totalCostPerUnit ?? 0).toFixed(2)} ฿</td>
                                <td className="p-2.5 text-right font-mono text-blue-700 font-bold">{(t.sellingPricePerUnit ?? t.suggestedPricePerUnit ?? 0).toFixed(2)} ฿</td>
                                <td className="p-2.5 text-right font-mono text-slate-900">{(t.totalOrderValue ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Revision History Log */}
                  <div className="bg-[#111726]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 text-white">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30">
                          <History className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            ประวัติการปรับราคา (Price Revision History Log)
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            บันทึกการเปลี่ยนแปลงสเปก ต้นทุน และราคาเสนอสำหรับกล่อง "{activeBoxName}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSaveRevisionModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>+ บันทึก Rev ใหม่</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHistoryModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
                        >
                          ดูเปรียบเทียบตารางเต็ม
                        </button>
                      </div>
                    </div>

                    {activeBoxRecord && activeBoxRecord.revisions.length > 0 ? (
                      <div className="space-y-3">
                        {activeBoxRecord.revisions.slice().reverse().map((rev) => (
                          <div
                            key={rev.id}
                            className="p-4 rounded-xl bg-[#0b0f19]/80 border border-slate-800 hover:border-indigo-500/50 transition-colors space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-md">
                                  Rev. {rev.revisionNo}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  {rev.formattedDate}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">
                                  ทุน: {(rev.unitCost ?? 0).toFixed(2)} ฿
                                </span>
                                <span className="font-mono font-bold text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                  เสนอ {(rev.sellingPrice ?? 0).toFixed(2)} ฿
                                </span>
                                {rev.percentDiffFromPrevious !== undefined && (
                                  <span
                                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                      rev.percentDiffFromPrevious > 0
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                        : rev.percentDiffFromPrevious < 0
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {rev.percentDiffFromPrevious > 0 ? '+' : ''}
                                    {rev.percentDiffFromPrevious}%
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                              {rev.reason}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                              <span>
                                ขนาด {rev.dimensions.length}×{rev.dimensions.width}×{rev.dimensions.height} mm | {rev.paper.materialType} {rev.paper.gsm}g
                              </span>
                              <button
                                type="button"
                                onClick={() => handleLoadRevision(rev)}
                                className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <span>ดึงสเปกนี้มาใช้</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        ยังไม่มีประวัติการปรับราคาสำหรับกล่องนี้ กด "+ บันทึก Rev ใหม่" เพื่อเริ่มเก็บประวัติ
                      </div>
                    )}
                  </div>

                  {/* Step 4 Footer */}
                  <StepFooterNavigation
                    currentStep="step4_quotation"
                    onSelectStep={setActiveWorkflowStep}
                    onOpenQuotation={() => setIsQuotationOpen(true)}
                    onOpenSaveRevision={() => setIsSaveRevisionModalOpen(true)}
                  />
                </div>
              )}

              {/* AI Cost Advisor */}
              {activeWorkflowStep === 'advisor' && (
                <div className="space-y-6">
                  <AIAdvisor contextSummary={contextSummary} />
                  <StepFooterNavigation
                    currentStep="advisor"
                    onSelectStep={setActiveWorkflowStep}
                  />
                </div>
              )}

            </div>

            {/* Right Column (4 cols): Floating Executive Cost Cockpit */}
            <div className="lg:col-span-5 xl:col-span-4">
              <FloatingCostCockpit
                result={result}
                production={production}
                onChangeQuantity={(q) => setProduction({ ...production, quantity: q })}
                onChangeMarkup={(m) => setProduction({ ...production, markupPercent: m })}
                onOpenQuotation={() => setIsQuotationOpen(true)}
                onOpenSaveRevision={() => setIsSaveRevisionModalOpen(true)}
                onDirectExportExcel={handleDirectExportExcel}
              />
            </div>

          </div>
        </div>

      </div>

      {/* Edit Specs Drawer / Modal */}
      <EditSpecsDrawer
        isOpen={isEditSpecsOpen}
        onClose={() => setIsEditSpecsOpen(false)}
        boxName={activeBoxName}
        onChangeBoxName={setActiveBoxName}
        category={category}
        dimensions={dimensions}
        paper={paper}
        printing={printing}
        finishing={finishing}
        converting={converting}
        production={production}
        result={result}
        activePresetId={activePresetId}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onResetToPresetDefaults={handleResetToPresetDefaults}
        onChangeDimensions={setDimensions}
        onChangeWastePercent={(w) => setPaper({ ...paper, wastePercent: w })}
        onChangePaper={setPaper}
        onChangePrinting={setPrinting}
        onChangeFinishing={setFinishing}
        onChangeConverting={setConverting}
        onChangeProduction={setProduction}
      />

      {/* Quick 2-Step New Box Wizard Modal */}
      <NewBoxWizardModal
        isOpen={isNewBoxWizardOpen}
        onClose={() => setIsNewBoxWizardOpen(false)}
        customer={activeCustomer}
        onCreateNewBox={handleCreateNewBoxFromWizard}
      />

      {/* Save Revision Modal */}
      <SaveRevisionModal
        isOpen={isSaveRevisionModalOpen}
        onClose={() => setIsSaveRevisionModalOpen(false)}
        customer={activeCustomer}
        currentBoxName={activeBoxName}
        result={result}
        production={production}
        onConfirmSave={handleConfirmSaveRevision}
      />

      {/* Customer Price Revision History & Comparison Modal */}
      <CustomerBoxHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customer={activeCustomer}
        records={customerBoxes}
        onLoadRevision={handleLoadRevision}
      />

      {/* Printable Quotation & Official PDF/Excel Modal */}
      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        customer={activeCustomer}
        boxName={activeBoxName}
        categoryName={activePreset.name}
        dimensions={dimensions}
        paper={paper}
        printing={printing}
        finishing={finishing}
        converting={converting}
        production={production}
        result={result}
        tiers={quantityTiers}
      />

      {/* Factory Job Ticket / Production Order Modal (Standard Industrial Form) */}
      <JobOrderModal
        isOpen={isJobOrderOpen}
        onClose={() => setIsJobOrderOpen(false)}
        customer={activeCustomer}
        boxName={activeBoxName}
        categoryName={activePreset.name}
        dimensions={dimensions}
        paper={paper}
        printing={printing}
        finishing={finishing}
        converting={converting}
        production={production}
        optimizationResult={sheetOptimizer}
      />

      {/* Interactive System User Manual & Technical Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onNavigateTab={(tab) => {
          setActiveMainTab(tab);
          setIsUserGuideOpen(false);
        }}
      />

      {/* Customer Data Importer & Auto Field Mapping Converter Modal */}
      <CustomerDataImportModal
        isOpen={isDataImportOpen}
        onClose={() => setIsDataImportOpen(false)}
        customers={customers}
        activeCustomer={activeCustomer}
        onImportComplete={handleImportComplete}
      />

      {/* Smart Email & LINE Quote Modal (Quick Mobile On-the-Go Estimator) */}
      <QuickEmailQuoteModal
        isOpen={isQuickEmailQuoteOpen}
        onClose={() => setIsQuickEmailQuoteOpen(false)}
        customers={customers}
        activeCustomer={activeCustomer}
        onApplySpecsAndCalculate={handleApplyParsedSpecs}
        onOpenQuotation={() => {
          setIsQuickEmailQuoteOpen(false);
          setIsQuotationOpen(true);
        }}
      />

      {/* Quick Share Application Link & QR Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Mobile Sticky Bottom Quick-Action Toolbar (For Sales on Mobile / in car) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          type="button"
          onClick={() => setIsQuickEmailQuoteOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-amber-400 font-bold min-w-[56px] min-h-[44px]"
        >
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] mt-0.5 font-black">⚡ คิดด่วน</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkflowStep('step1_presets')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            activeWorkflowStep === 'step1_presets'
              ? 'text-blue-400 font-bold bg-blue-600/20 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">1. สเปก</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkflowStep('step2_calculator')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            activeWorkflowStep === 'step2_calculator'
              ? 'text-blue-400 font-bold bg-blue-600/20 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">2. 3D & BOM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkflowStep('step3_tiers')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            activeWorkflowStep === 'step3_tiers'
              ? 'text-blue-400 font-bold bg-blue-600/20 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">3. ตารางราคา</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQuotationOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-emerald-400 hover:text-emerald-300 min-w-[56px] min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">ใบเสนอราคา</span>
        </button>
      </div>
    </div>
  );
};

export default App;

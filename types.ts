export interface IndustrialExcelItem {
  id: string;
  no: number;
  symbol: string;             // เช่น P1541749
  description: string;        // เช่น CTN GRF 20g
  quotation: string;          // เช่น Q2'19
  fyVolume: number;           // F/Y volume เช่น 17,614,339
  moq: number;                // MOQ/3 AW เช่น 1,566,000
  runSize: number;            // Run Size เช่น 1,566,000
  dimensionsStr: string;      // เช่น 29 x 107 x 25
  lengthMm: number;           // mm
  widthMm: number;            // mm
  heightMm: number;           // mm
  boardDiecutted: string;     // เช่น 4 สี
  boardGsmQuoted: number;     // Board ใช้เสนอ เช่น 310
  boardGsmCalculated: number; // Board คำนวณ เช่น 300
  sheetWidthInch: number;     // WIDTH (นิ้ว) เช่น 25.25
  sheetLengthInch: number;    // LENGTH (นิ้ว) เช่น 31.00 หรือ 31.50
  pricePerKgOriginal: number; // ราคา / KG - เดิม เช่น 25.70
  pricePerKgNew: number;      // กระดาษ ราคา/KG ใหม่ เช่น 25.55
  paperMassFactor: number;    // มวลกระดาษ เช่น 3100
  paperBoxYield: number;      // Paper Box นำไป เช่น 2372
  boxesPerSheetQuoted: number; // Box ใช้เสนอ เช่น 32
  boxesPerSheetCalculated: number; // Box ใช้คำนวณ เช่น 32 (จำนวนตัวต่อแผ่น)
  paperCostNoWaste: number;   // ค่ากระดาษไม่รวมWaste เช่น 0.1483
  paperWastePercent: number;  // +Waste % เช่น 4.50%
  paperWasteCost: number;     // ค่ากระดาษ Waste เช่น 0.0052
  productionWastePercent: number; // Production Waste% เช่น 3.5%
  productionWasteCost: number; // Production Waste cost เช่น 0.0052
  paperPricePerBox: number;   // Paper Price / Box (รวม Waste) เช่น 0.1535
  printingColors: string;     // Printing / Diecutted เช่น 4 สี
  conversionCostPerBox: number; // ค่า Conversion เช่น 0.1085
  ccPerReam?: number;         // CC/รีม
  plateCostTotal?: number;    // PLATE (เช่น 30,000 / 6,000)
  plateCostPerBox: number;    // ค่าเพลทเฉลี่ยต่อใบ
  diecutToolingTotal?: number; // ค่าหน้าปั๊ม / บล็อกไดคัท (เช่น 2,815,000)
  diecutToolingPerBox: number; // ค่าหน้าปั๊มเฉลี่ยต่อใบ
  spotUvPerBox: number;       // SPOT UV/BOX เช่น 0.0005
  mattedUvPerBox: number;     // MATTED UV/BOX เช่น 0.0015
  embossedPerBox: number;     // EMBOSSED/BOX เช่น 0.0003
  waterBasePerBox: number;    // วอเตอร์เบส (water base)
  waterBaseDiscount: number;  // ส่วนลด (water base)
  pricePerBox: number;        // PRICE' /BOX (ราคาเสนอขายสุทธิต่อใบ) เช่น 0.2632
  totalOrderValue: number;    // มูลค่ารวมต่อ Run (Run Size * Price)
  annualTotalValue: number;   // มูลค่ารวมต่อปี (F/Y volume * Price)
  notes?: string;
}

export type BoxCategory = 
  | 'tuck_end'        // กล่องแป้งฝาเสียบหัวท้าย (Tuck End Box)
  | 'auto_bottom'     // กล่องแป้งฝาเสียบก้นล็อกอัตโนมัติ (Auto-Lock Bottom Box)
  | 'snap_bottom'     // กล่องแป้งฝาเสียบก้นขัด (Snap Lock / 1-2-3 Bottom Box)
  | 'lid_base'        // กล่องแป้งฝาครอบ 2 ชิ้น (Two-Piece Box: Lid & Base)
  | 'sleeve_tray'     // กล่องแป้งปลอกสวม / กล่องลิ้นชัก (Sleeve & Tray Box)
  | 'folding_tray'    // กล่องแป้งทรงถาดพับ / เบเกอรี่ (Folding Tray & Box)
  | 'custom';         // ปรับแต่งโครงสร้างเอง

export interface BoxDimensions {
  length: number; // mm (ยาว L)
  width: number;  // mm (กว้าง W)
  height: number; // mm (สูง H)
}

export type PricingUnit = 'per_kg' | 'per_sqm';

export interface PaperSpecs {
  materialType: string;        // เช่น "อาร์ตการ์ด 1 หน้า (Art Card C1S)", "กระดาษคราฟท์ฟู้ดเกรด", "ลูกฟูก 3 ชั้น ลอน E"
  gsm: number;                 // g/m2 (แกรม)
  pricingUnit: PricingUnit;    // คิดราคาตาม กก. หรือ ตร.ม.
  pricePerUnit: number;        // บาท/กก. หรือ บาท/ตร.ม.
  wastePercent: number;        // % เผื่อสูญเสีย (เช่น 10%)
}

export type PrintingType = 
  | 'offset_cmyk'     // Offset 4 สี
  | 'offset_1color'   // Offset 1-2 สี
  | 'flexo_2color'    // Flexo 1-2 สี (ลูกฟูก)
  | 'digital'         // Digital Short-run
  | 'none';           // ไม่พิมพ์

export interface PrintingSpecs {
  type: PrintingType;
  plateFixedCost: number;       // ค่าเพลท / บล็อกแม่พิมพ์รวม (บาท)
  printCostPerUnit: number;     // ค่าแรงพิมพ์ต่อใบ (บาท)
  pantoneColorsCount: number;   // จำนวนสีพิเศษ Pantone
  pantoneFixedCostPerColor: number; // ค่าเพลทสีพิเศษ
}

export interface FinishingSpecs {
  // Coating / Lamination (เลือกได้ 1 อย่างหลัก หรือผสม)
  coatingType: 'none' | 'gloss_lam' | 'matte_lam' | 'water_based' | 'varnish' | 'uv_coat';
  coatingCostPerUnit: number;

  // Special effects (ตกแต่งพิเศษ)
  hasSpotUv: boolean;
  spotUvFixedCost: number;     // ค่าบล็อกฟิล์มสปอตยูวี
  spotUvCostPerUnit: number;   // ค่าสปอตต่อใบ

  hasFoilStamping: boolean;
  foilAreaWidthMm: number;     // พื้นที่เคทอง กว้าง mm
  foilAreaHeightMm: number;    // พื้นที่เคทอง ยาว mm
  foilFixedCost: number;       // ค่าบล็อกเคทอง/เงิน
  foilCostPerUnit: number;     // ค่าปั๊มฟอยล์ต่อใบ

  hasEmbossing: boolean;
  embossFixedCost: number;     // ค่าบล็อกปั๊มนูน/จม
  embossCostPerUnit: number;   // ค่าปั๊มนูนต่อใบ
}

export type GluingType = 'auto_side' | 'bottom_lock' | 'corner_4_6' | 'self_fold' | 'manual';

export interface ConvertingSpecs {
  dieCutPlateFixedCost: number; // ค่าบล็อกมีดไดคัท (Fixed)
  dieCutCostPerUnit: number;    // ค่าแรงปั๊มไดคัทต่อใบ
  
  gluingType: GluingType;
  gluingCostPerUnit: number;    // ค่าปะกาวต่อใบ (0 หากเป็น self_fold)

  hasWindowPatching: boolean;   // เจาะหน้าต่างติดฟิล์มใส
  windowFixedCost: number;      // ค่าบล็อกเจาะ
  windowCostPerUnit: number;    // ค่าแผ่นฟิล์มและปะหน้าต่างต่อใบ
}

export interface ProductionSpecs {
  quantity: number;             // จำนวนสั่งผลิต (ใบ)
  markupPercent: number;        // กำไรที่ต้องการ (%)
  packingCostPerUnit: number;   // ค่าบรรจุหีบห่อ/ลังต่อใบ
  otherFixedCosts: number;      // ค่าใช้จ่ายคงที่อื่นๆ เช่น ค่าออกแบบ/ตัวอย่าง
}

export interface BoxPreset {
  id: string;
  category: BoxCategory;
  name: string;
  nameEn: string;
  description: string;
  defaultDimensions: BoxDimensions;
  defaultPaper: PaperSpecs;
  defaultPrinting: PrintingSpecs;
  defaultFinishing: FinishingSpecs;
  defaultConverting: ConvertingSpecs;
  defaultProduction: ProductionSpecs;
  spreadFormulaDesc: string;
}

export interface BOMItem {
  id: string;
  category: 'material' | 'printing' | 'finishing' | 'converting' | 'fixed_costs';
  categoryLabel: string;
  name: string;
  description: string;
  type: 'fixed' | 'variable';
  unitCost: number;        // บาท/ใบ
  totalCost: number;       // บาททั้งออเดอร์
  percentageOfTotal: number; // % ของต้นทุนรวม
}

export interface CostBreakdown {
  // Material
  spreadWidthMm: number;
  spreadHeightMm: number;
  areaSqM: number;
  weightPerBoxGrams: number;
  materialCostPerUnit: number;

  // Printing & Pre-press
  printingFixedCost: number;
  printingCostPerUnit: number;

  // Finishing
  finishingFixedCost: number;
  finishingCostPerUnit: number;

  // Converting
  convertingFixedCost: number;
  convertingCostPerUnit: number;

  // Other & Packaging
  otherFixedCost: number;
  packagingCostPerUnit: number;

  // Summaries
  totalFixedCost: number;
  fixedCostPerUnit: number;
  totalVariableCostPerUnit: number;

  totalCostPerUnit: number;
  sellingPricePerUnit: number;
  totalOrderValue: number;
  totalProfit: number;
  grossMarginPercent: number;

  bomItems: BOMItem[];
}

export interface QuantityTier {
  quantity: number;
  fixedCostPerUnit: number;
  variableCostPerUnit: number;
  totalCostPerUnit: number;
  unitCost?: number;
  costPerUnit?: number;
  suggestedPricePerUnit: number;
  sellingPricePerUnit?: number;
  totalOrderValue: number;
  totalProfit: number;
  savingsPercentVsLowest?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxId?: string;
  address?: string;
  notes?: string;
  favoriteCategory?: BoxCategory;
}

export interface PriceRevision {
  id: string;
  customerId: string;
  customerName: string;
  boxId: string;
  boxName: string;
  boxCategory: BoxCategory;
  timestamp: number;
  formattedDate: string;
  revisionNo: number;
  reason: string; // เหตุผลในการปรับราคา เช่น "ราคากระดาษ KA ปรับขึ้น 5%", "ลูกค้าร้องขอส่วนลดสั่ง 10,000 ใบ"
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  result: CostBreakdown;
  quantityTiers: QuantityTier[];
  unitCost: number;
  sellingPrice: number;
  totalProfit: number;
  priceDiffFromPrevious?: number; // ราคาต่อใบเทียบกับ Revision ก่อนหน้า
  percentDiffFromPrevious?: number;
}

export interface CustomerBoxRecord {
  id: string;
  customerId: string;
  boxName: string;
  boxCategory: BoxCategory;
  lastUpdated: number;
  currentRevisionNo: number;
  revisions: PriceRevision[];
  latestSnapshot: {
    dimensions: BoxDimensions;
    paper: PaperSpecs;
    printing: PrintingSpecs;
    finishing: FinishingSpecs;
    converting: ConvertingSpecs;
    production: ProductionSpecs;
  };
}

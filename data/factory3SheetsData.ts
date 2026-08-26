export interface FactoryMatrixTier {
  qty: number;
  label: string;
  price2556?: number | null; // ราคา ปี 2556 หรือ ราคาฐานสัญญาเดิม (บาท/ชิ้น)
  price2565?: number | null; // ปรับราคา ปี 2565 หรือ รอบปรับราคาก่อนหน้า (บาท/ชิ้น)
  priceCurrent?: number | null; // ราคาปีปัจจุบัน / บันทึกต่อยอด (บาท/ชิ้น)
  calculatedBomPrice?: number | null; // ราคาต้นทุนคำนวณจริงจาก BOM ปัจจุบัน
}

export interface FactoryMatrixItem {
  id: string;
  sheetType: string;
  sheetTitle: string;
  mapicNo: string;
  blockNo: string;
  description: string;
  gsm: number;
  dimensionsStr: string; // เช่น 120 x 105 หรือ 110 x 85 x 81
  lengthMm: number;
  widthMm: number;
  heightMm?: number;
  colorsAndProcess: string; // เช่น "1 สี 2 หน้า + เย็บเล่ม", "2 สี + อาบเงาเว้น Lot+ปั๊ม+ติดกาวข้าง+ก้นกล่อง"
  paperType: string; // เช่น "ปอนด์ขาว (Woodfree)", "กล่องแป้งหลังเทา (Duplex Grey Back)", "กล่องแป้งหลังขาว / อาร์ตการ์ด"
  standardTiers: FactoryMatrixTier[];
  notes?: string;
  lastUpdated?: string;
  activeRevisionNo?: number;
}

export interface CustomerLegacySheet {
  sheetId: string;
  sheetName: string;
  sheetDescription: string;
  baseYearLabel: string; // เช่น "ราคาเดิม ปี 2556" หรือ "ฐานราคาเดิม"
  previousRevisionLabel: string; // เช่น "ปรับราคา ปี 2565 (+3-5%)"
  currentRevisionLabel: string; // เช่น "ราคาปัจจุบัน / ปรับต่อยอด"
  items: FactoryMatrixItem[];
}

export interface CustomerLegacyDataset {
  customerId: string;
  customerName: string;
  customerCode: string;
  industry: string;
  sheets: CustomerLegacySheet[];
}

// Master tier intervals used across factory sheets
export const FACTORY_QTY_TIERS: number[] = [
  50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500, 3000, 5000,
  10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 100000, 150000, 200000
];

// Helper to construct tier price record
export const createTierList = (
  tierPriceMap: { [qty: number]: { p2556?: number; p2565?: number; pCurrent?: number } }
): FactoryMatrixTier[] => {
  return FACTORY_QTY_TIERS.map((qty) => {
    const data = tierPriceMap[qty];
    const p2556 = data?.p2556 !== undefined ? data.p2556 : null;
    let p2565 = data?.p2565 !== undefined ? data.p2565 : (p2556 ? Number((p2556 * 1.03).toFixed(2)) : null);
    let pCurrent = data?.pCurrent !== undefined ? data.pCurrent : (p2565 ? Number((p2565 * 1.04).toFixed(2)) : (p2556 ? Number((p2556 * 1.07).toFixed(2)) : null));

    return {
      qty,
      label: qty >= 1000 ? `${qty.toLocaleString()}` : `${qty}`,
      price2556: p2556,
      price2565: p2565,
      priceCurrent: pCurrent,
    };
  });
};

// ==========================================
// SHEET 1: IFU ใบแทรก / เอกสารกำกับยา (ปรับขึ้น 4%)
// ==========================================
export const SHEET1_IFU_ITEMS: FactoryMatrixItem[] = [
  {
    id: 'ifu_01',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '2310H0190',
    blockNo: 'PSN 1725',
    description: 'INS SAFE TOUCH PSV VENOFIX',
    gsm: 60,
    dimensionsStr: '120 x 105',
    lengthMm: 120,
    widthMm: 105,
    colorsAndProcess: '1 สี 2 หน้า + เย็บเล่ม',
    paperType: 'ปอนด์ขาวฟู้ด/การแพทย์ 60g',
    standardTiers: createTierList({
      1000: { p2556: 8.83, p2565: 9.18 },
      1500: { p2556: 7.16, p2565: 7.45 },
      5000: { p2556: 6.57, p2565: 6.83 },
      10000: { p2556: 5.85, p2565: 6.09 },
    }),
    notes: 'เอกสารกำกับชุดเข็ม Venofix 1 สี 2 หน้า เย็บเล่มประณีต',
  },
  {
    id: 'ifu_02',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '2310H0191',
    blockNo: 'PSN 2149',
    description: 'IFU ST.PSV B-BRAUN',
    gsm: 60,
    dimensionsStr: '120 x 105',
    lengthMm: 120,
    widthMm: 105,
    colorsAndProcess: '1 สี 2 หน้า + เย็บเล่ม',
    paperType: 'ปอนด์ขาวฟู้ด/การแพทย์ 60g',
    standardTiers: createTierList({
      1000: { p2556: 8.83, p2565: 9.18 },
      1500: { p2556: 7.16, p2565: 7.45 },
      5000: { p2556: 6.57, p2565: 6.83 },
      10000: { p2556: 5.85, p2565: 6.09 },
    }),
  },
  {
    id: 'ifu_03',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: 'N/A',
    blockNo: 'PSN 3295',
    description: 'INS AVF B-BRAUN',
    gsm: 60,
    dimensionsStr: '149 x 105',
    lengthMm: 149,
    widthMm: 105,
    colorsAndProcess: '1 สี (หน้า+หลัง กลับในตัว)+ตัด+พับ1',
    paperType: 'ปอนด์ขาว 60g',
    standardTiers: createTierList({
      800: { p2556: 1.08, p2565: 1.12 },
      1000: { p2556: 1.05, p2565: 1.09 },
      1200: { p2556: 1.02, p2565: 1.06 },
      1500: { p2556: 0.99, p2565: 1.03 },
      5000: { p2556: 0.96, p2565: 1.00 },
      10000: { p2556: 0.91, p2565: 0.95 },
    }),
  },
  {
    id: 'ifu_04',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: 'N/A',
    blockNo: 'PSN 3296',
    description: 'INS AVF B-BRAUN (Line 2)',
    gsm: 60,
    dimensionsStr: '149 x 105',
    lengthMm: 149,
    widthMm: 105,
    colorsAndProcess: '1 สี (หน้า+หลัง กลับในตัว)+ตัด+พับ1',
    paperType: 'ปอนด์ขาว 60g',
    standardTiers: createTierList({
      800: { p2556: 1.08, p2565: 1.12 },
      1000: { p2556: 1.05, p2565: 1.09 },
      1200: { p2556: 1.02, p2565: 1.06 },
      1500: { p2556: 0.99, p2565: 1.03 },
      5000: { p2556: 0.96, p2565: 1.00 },
      10000: { p2556: 0.91, p2565: 0.95 },
    }),
  },
  {
    id: 'ifu_05',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: 'N/A',
    blockNo: 'PSN 3369',
    description: 'INS AVF FRESENIUS CHINA DFRC0002',
    gsm: 60,
    dimensionsStr: '170 x 84',
    lengthMm: 170,
    widthMm: 84,
    colorsAndProcess: '1 สี หน้า+หลัง(กลับในตัว)+ตัด+พับ2',
    paperType: 'ปอนด์ขาว 60g',
    standardTiers: createTierList({
      800: { p2556: 2.22, p2565: 2.31 },
      1000: { p2556: 1.59, p2565: 1.65 },
      1200: { p2556: 1.32, p2565: 1.37 },
      1500: { p2556: 0.99, p2565: 1.03 },
      5000: { p2556: 0.81, p2565: 0.84 },
      10000: { p2556: 0.72, p2565: 0.75 },
    }),
  },
  {
    id: 'ifu_06',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '231050410',
    blockNo: 'PSN 2641',
    description: 'IFU BL GAMMA DINCH NIPRO CE',
    gsm: 70,
    dimensionsStr: '182 x 257',
    lengthMm: 182,
    widthMm: 257,
    colorsAndProcess: '1 สี 2 หน้า 14 หน้า+เย็บเล่ม',
    paperType: 'ปอนด์ขาว 70g',
    standardTiers: createTierList({
      1000: { p2556: 9.12, p2565: 9.48 },
      1500: { p2556: 7.86, p2565: 8.17 },
      5000: { p2556: 7.23, p2565: 7.52 },
      10000: { p2556: 6.74, p2565: 7.01 },
    }),
  },
  {
    id: 'ifu_07',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '231041115',
    blockNo: 'PSN 2793',
    description: 'IFU BL GAMMA NIPRO CE PSN 2793',
    gsm: 70,
    dimensionsStr: '182 x 257',
    lengthMm: 182,
    widthMm: 257,
    colorsAndProcess: '1 สี(หน้า+หลัง) จำนวน 16 หน้า+พับแบบหีบเพลง',
    paperType: 'ปอนด์ขาว 70g',
    standardTiers: createTierList({
      800: { p2556: 9.27, p2565: 9.64 },
      1000: { p2556: 7.03, p2565: 7.31 },
      1200: { p2556: 6.47, p2565: 6.73 },
      1500: { p2556: 5.98, p2565: 6.22 },
    }),
  },
  {
    id: 'ifu_08',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '230090040',
    blockNo: 'PSN 1568',
    description: 'INS FOR USE AVF GAMBRO ASIA',
    gsm: 80,
    dimensionsStr: '185 x 255',
    lengthMm: 185,
    widthMm: 255,
    colorsAndProcess: '1 สี + พับ',
    paperType: 'ปอนด์ขาว 80g',
    standardTiers: createTierList({
      800: { p2556: 0.99, p2565: 1.03 },
      1000: { p2556: 0.92, p2565: 0.95 },
      1200: { p2556: 0.86, p2565: 0.89 },
      1500: { p2556: 0.85, p2565: 0.88 },
      5000: { p2556: 0.83, p2565: 0.87 },
      10000: { p2556: 0.82, p2565: 0.86 },
    }),
  },
  {
    id: 'ifu_09',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '230090192',
    blockNo: 'PSN 3011',
    description: 'IFU AVF FRE ARGENTINA PSN-3011',
    gsm: 60,
    dimensionsStr: '200 x 84',
    lengthMm: 200,
    widthMm: 84,
    colorsAndProcess: '1 สี(ดำ) 2หน้า+พับ 1',
    paperType: 'ปอนด์ขาว 60g',
    standardTiers: createTierList({
      800: { p2556: 0.79, p2565: 0.82 },
      1000: { p2556: 0.70, p2565: 0.73 },
      1200: { p2556: 0.64, p2565: 0.67 },
      1500: { p2556: 0.52, p2565: 0.54 },
      3000: { p2556: 0.48, p2565: 0.50 },
      5000: { p2556: 0.44, p2565: 0.46 },
    }),
  },
  {
    id: 'ifu_10',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '231041742',
    blockNo: 'PSN 2608',
    description: 'IFU TBB2 NIPRO CHINA FOR AV MO',
    gsm: 70,
    dimensionsStr: '210 x 297 (A4)',
    lengthMm: 210,
    widthMm: 297,
    colorsAndProcess: '1 สี 2 หน้า + พับ 1',
    paperType: 'ปอนด์ขาว 70g',
    standardTiers: createTierList({
      800: { p2556: 1.18, p2565: 1.23 },
      1000: { p2556: 0.97, p2565: 1.01 },
      1200: { p2556: 0.83, p2565: 0.86 },
      1500: { p2556: 0.69, p2565: 0.72 },
      5000: { p2556: 0.62, p2565: 0.64 },
      10000: { p2556: 0.55, p2565: 0.57 },
    }),
  },
  {
    id: 'ifu_11',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '231041854',
    blockNo: 'PSN 2632',
    description: 'IFU BL STEAM&ETO SURE FLOW',
    gsm: 70,
    dimensionsStr: '210 x 297 (A4)',
    lengthMm: 210,
    widthMm: 297,
    colorsAndProcess: '2 สี+2หน้า (หน้า 2 สี หลัง 1 สี)+ไม้พับ',
    paperType: 'ปอนด์ขาว 70g',
    standardTiers: createTierList({
      800: { p2556: 1.30, p2565: 1.35 },
      1000: { p2556: 1.28, p2565: 1.33 },
      1200: { p2556: 1.25, p2565: 1.30 },
      1500: { p2556: 1.24, p2565: 1.29 },
      5000: { p2556: 1.22, p2565: 1.27 },
      10000: { p2556: 1.21, p2565: 1.26 },
    }),
  },
  {
    id: 'ifu_12',
    sheetType: 'sheet1_ifu',
    sheetTitle: 'ปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
    mapicNo: '230090090',
    blockNo: 'PSN 1831',
    description: 'INS FOR USE OF AVF BAXTER EURO',
    gsm: 100,
    dimensionsStr: '216 x 279',
    lengthMm: 216,
    widthMm: 279,
    colorsAndProcess: '1 สี 2 หน้า + พับ 2',
    paperType: 'ปอนด์ขาว 100g หนาพิเศษ',
    standardTiers: createTierList({
      800: { p2556: 5.26, p2565: 5.47 },
      1000: { p2556: 4.78, p2565: 4.97 },
      1200: { p2556: 4.54, p2565: 4.72 },
      1500: { p2556: 4.42, p2565: 4.60 },
      5000: { p2556: 4.30, p2565: 4.47 },
      10000: { p2556: 4.12, p2565: 4.29 },
    }),
  },
];

// ==========================================
// SHEET 2: กล่องบรรจุภัณฑ์ ชิ้น (กระดาษหลังเทา / Duplex Board) (ปรับขึ้น 3%)
// ==========================================
export const SHEET2_DUPLEX_ITEMS: FactoryMatrixItem[] = [
  {
    id: 'dup_01',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '220031130',
    blockNo: 'PSN 759',
    description: 'IN SYR WR HOGI NO PRINT 1 ML V',
    gsm: 500,
    dimensionsStr: '200 x 158 x 90',
    lengthMm: 200,
    widthMm: 158,
    heightMm: 90,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 500g',
    standardTiers: createTierList({
      1200: { p2556: 9.07, p2565: 9.34 },
      1500: { p2556: 8.65, p2565: 8.91 },
      3000: { p2556: 8.23, p2565: 8.48 },
      5000: { p2556: 7.50, p2565: 7.72 },
      10000: { p2556: 7.39, p2565: 7.61 },
      20000: { p2556: 7.28, p2565: 7.50 },
      30000: { p2556: 7.20, p2565: 7.41 },
    }),
  },
  {
    id: 'dup_02',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '2200G0410',
    blockNo: 'PSN 2494',
    description: 'IN ST CATH WINGED WITH INJECTION',
    gsm: 400,
    dimensionsStr: '100 x 160 x 157.5',
    lengthMm: 100,
    widthMm: 160,
    heightMm: 157.5,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 400g',
    standardTiers: createTierList({
      1200: { p2556: 5.73, p2565: 5.91 },
      1500: { p2556: 5.60, p2565: 5.77 },
      3000: { p2556: 5.47, p2565: 5.64 },
      5000: { p2556: 4.87, p2565: 5.02 },
      10000: { p2556: 4.35, p2565: 4.48 },
    }),
  },
  {
    id: 'dup_03',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '2200G0450',
    blockNo: 'PSN 2565',
    description: 'IN ST CATH VYGON NIPRO CE',
    gsm: 400,
    dimensionsStr: '105 x 160 x 161',
    lengthMm: 105,
    widthMm: 160,
    heightMm: 161,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 400g',
    standardTiers: createTierList({
      200: { p2556: 21.22, p2565: 21.86 },
      300: { p2556: 14.54, p2565: 14.98 },
      400: { p2556: 11.76, p2565: 12.12 },
      500: { p2556: 9.54, p2565: 9.82 },
      600: { p2556: 8.48, p2565: 8.73 },
      700: { p2556: 7.31, p2565: 7.53 },
      1500: { p2556: 5.06, p2565: 5.21 },
    }),
  },
  {
    id: 'dup_04',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '220091391',
    blockNo: 'PSN 2062',
    description: 'IN AVF GAMMA 2-PACK 14G S',
    gsm: 400,
    dimensionsStr: '110 x 270 x 100',
    lengthMm: 110,
    widthMm: 270,
    heightMm: 100,
    colorsAndProcess: '2 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 400g',
    standardTiers: createTierList({
      1200: { p2556: 6.56, p2565: 6.75 },
      1500: { p2556: 6.18, p2565: 6.36 },
      3000: { p2556: 5.80, p2565: 5.97 },
      5000: { p2556: 5.15, p2565: 5.31 },
      10000: { p2556: 5.08, p2565: 5.23 },
      20000: { p2556: 5.00, p2565: 5.15 },
      30000: { p2556: 4.94, p2565: 5.09 },
    }),
  },
  {
    id: 'dup_05',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '220092551',
    blockNo: 'PSN 2529',
    description: 'INNER AVF NO PRINT SIZE S',
    gsm: 400,
    dimensionsStr: '110 x 270 x 139',
    lengthMm: 110,
    widthMm: 270,
    heightMm: 139,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 400g',
    standardTiers: createTierList({
      1200: { p2556: 7.60, p2565: 7.83 },
      1500: { p2556: 7.27, p2565: 7.49 },
      3000: { p2556: 6.93, p2565: 7.14 },
      5000: { p2556: 6.15, p2565: 6.34 },
      10000: { p2556: 6.03, p2565: 6.22 },
      20000: { p2556: 5.81, p2565: 5.99 },
      30000: { p2556: 5.71, p2565: 5.89 },
    }),
  },
  {
    id: 'dup_06',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '220023250',
    blockNo: 'PSN 3062',
    description: 'IN PN 18GX3/7" S NIPRO DOM PSN-3062',
    gsm: 310,
    dimensionsStr: '110 x 85 x 81',
    lengthMm: 110,
    widthMm: 85,
    heightMm: 81,
    colorsAndProcess: '2 สี + อาบเงาเว้น Lot+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 310g',
    standardTiers: createTierList({
      1200: { p2556: 2.88, p2565: 2.97 },
      1500: { p2556: 2.76, p2565: 2.84 },
      3000: { p2556: 2.63, p2565: 2.71 },
      5000: { p2556: 1.88, p2565: 1.94 },
      10000: { p2556: 1.80, p2565: 1.85 },
      20000: { p2556: 1.74, p2565: 1.79 },
      30000: { p2556: 1.69, p2565: 1.74 },
      40000: { p2556: 1.64, p2565: 1.69 },
    }),
  },
  {
    id: 'dup_07',
    sheetType: 'sheet2_duplex',
    sheetTitle: 'ปรับราคากล่องบรรจุภัณฑ์ (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
    mapicNo: '220022802',
    blockNo: 'PSN 3174',
    description: 'IN PN 18G S NIPRO CE PSN-3174 IN',
    gsm: 310,
    dimensionsStr: '110 x 85 x 81',
    lengthMm: 110,
    widthMm: 85,
    heightMm: 81,
    colorsAndProcess: '2 สี + อาบเงาเว้น Lot+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังเทา (Duplex) 310g',
    standardTiers: createTierList({
      1200: { p2556: 2.88, p2565: 2.97 },
      1500: { p2556: 2.76, p2565: 2.84 },
      3000: { p2556: 2.63, p2565: 2.71 },
      5000: { p2556: 1.88, p2565: 1.94 },
      10000: { p2556: 1.80, p2565: 1.85 },
      20000: { p2556: 1.74, p2565: 1.79 },
      30000: { p2556: 1.69, p2565: 1.74 },
      40000: { p2556: 1.64, p2565: 1.69 },
    }),
  },
];

// ==========================================
// SHEET 3: กล่องบรรจุภัณฑ์เฉพาะทาง / การแพทย์ / ไซริงค์ (Medical / White Back)
// ==========================================
export const SHEET3_MEDICAL_ITEMS: FactoryMatrixItem[] = [
  {
    id: 'med_01',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์ เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%) และ 01 เม.ย. 2565 (ปรับ 5%)',
    mapicNo: '220023140',
    blockNo: 'PSN 3026',
    description: 'IN PN 28GX1" S VEDEFAR PSN-3026 IVED281000',
    gsm: 350,
    dimensionsStr: '110 x 85 x 81',
    lengthMm: 110,
    widthMm: 85,
    heightMm: 81,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว/อาร์ตการ์ด 350g',
    standardTiers: createTierList({
      1200: { p2556: 5.19, p2565: 5.35 },
      1500: { p2556: 4.63, p2565: 4.77 },
      3000: { p2556: 4.07, p2565: 4.19 },
      5000: { p2556: 3.65, p2565: 3.76 },
      10000: { p2556: 3.30, p2565: 3.40 },
      20000: { p2556: 3.23, p2565: 3.33 },
      30000: { p2556: 3.16, p2565: 3.25 },
    }),
  },
  {
    id: 'med_02',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '220022901',
    blockNo: 'PSN 2882',
    description: 'IN ST. NEEDLE 22GX1" RADIOMETER PSN 2882 IRAD22100',
    gsm: 500,
    dimensionsStr: '112 x 255 x 126',
    lengthMm: 112,
    widthMm: 255,
    heightMm: 126,
    colorsAndProcess: '2 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 500g',
    standardTiers: createTierList({
      300: { p2556: 19.20, p2565: 19.78 },
      400: { p2556: 16.42, p2565: 16.91 },
      500: { p2556: 14.19, p2565: 14.62 },
      600: { p2556: 13.07, p2565: 13.46 },
      700: { p2556: 11.96, p2565: 12.32 },
      1200: { p2556: 9.71, p2565: 10.00 },
      1500: { p2556: 9.17, p2565: 9.45 },
      3000: { p2556: 8.63, p2565: 8.89 },
      5000: { p2556: 7.99, p2565: 8.23 },
      10000: { p2556: 7.71, p2565: 7.94 },
      20000: { p2556: 7.55, p2565: 7.78 },
      30000: { p2556: 7.08, p2565: 7.29 },
    }),
  },
  {
    id: 'med_03',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '220031990',
    blockNo: 'PSN 2492',
    description: 'INNER BOX SYRINGE(w) 5ML W/O MORITA',
    gsm: 500,
    dimensionsStr: '120 x 160 x 100',
    lengthMm: 120,
    widthMm: 160,
    heightMm: 100,
    colorsAndProcess: '3 สี + อาบเงาเว้น+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 500g',
    standardTiers: createTierList({
      1200: { p2556: 8.67, p2565: 8.93 },
      1500: { p2556: 8.29, p2565: 8.54 },
      3000: { p2556: 7.92, p2565: 8.15 },
      5000: { p2556: 7.60, p2565: 7.83 },
      10000: { p2556: 7.20, p2565: 7.42 },
      20000: { p2556: 6.99, p2565: 7.20 },
      30000: { p2556: 6.78, p2565: 6.98 },
    }),
  },
  {
    id: 'med_04',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '220031980',
    blockNo: 'PSN 2491',
    description: 'INNER BOX SYRINGE(w) 3ML W/O MORITA',
    gsm: 500,
    dimensionsStr: '120 x 160 x 75',
    lengthMm: 120,
    widthMm: 160,
    heightMm: 75,
    colorsAndProcess: '3 สี + อาบเงาเว้น+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 500g',
    standardTiers: createTierList({
      1200: { p2556: 8.26, p2565: 8.51 },
      1500: { p2556: 7.88, p2565: 8.12 },
      3000: { p2556: 7.50, p2565: 7.73 },
      5000: { p2556: 7.21, p2565: 7.42 },
      10000: { p2556: 6.79, p2565: 6.99 },
      20000: { p2556: 6.68, p2565: 6.88 },
      30000: { p2556: 6.47, p2565: 6.67 },
    }),
  },
  {
    id: 'med_05',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '220031700',
    blockNo: 'PSN 2271',
    description: 'IN SYRINGE (BLISTER TYPE) GAMMA NP ASIA 3 ML W/O L/S',
    gsm: 500,
    dimensionsStr: '125 x 215 x 155',
    lengthMm: 125,
    widthMm: 215,
    heightMm: 155,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 500g',
    standardTiers: createTierList({
      1200: { p2556: 11.28, p2565: 11.62 },
      1500: { p2556: 10.72, p2565: 11.05 },
      3000: { p2556: 10.17, p2565: 10.47 },
      5000: { p2556: 9.36, p2565: 9.64 },
      10000: { p2556: 9.21, p2565: 9.49 },
      20000: { p2556: 9.06, p2565: 9.34 },
      30000: { p2556: 8.98, p2565: 9.25 },
    }),
  },
  {
    id: 'med_06',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '220031720',
    blockNo: 'PSN 2273',
    description: 'IN SYRINGE (BLISTER TYPE) GAMMA NP ASIA 5 ML W/O L/S',
    gsm: 500,
    dimensionsStr: '135 x 220 x 185',
    lengthMm: 135,
    widthMm: 220,
    heightMm: 185,
    colorsAndProcess: '1 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 500g',
    standardTiers: createTierList({
      1200: { p2556: 13.17, p2565: 13.56 },
      1500: { p2556: 12.54, p2565: 12.92 },
      3000: { p2556: 11.92, p2565: 12.28 },
      5000: { p2556: 10.94, p2565: 11.26 },
      10000: { p2556: 10.77, p2565: 11.09 },
      20000: { p2556: 10.60, p2565: 10.92 },
      30000: { p2556: 10.50, p2565: 10.82 },
    }),
  },
  {
    id: 'med_07',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '2200G0360',
    blockNo: 'PSN 1379',
    description: 'IN SAFLET CATH LATIN AMERICA 18 G x 1 1/4"',
    gsm: 400,
    dimensionsStr: '158 x 64 x 145',
    lengthMm: 158,
    widthMm: 64,
    heightMm: 145,
    colorsAndProcess: '2 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 400g',
    standardTiers: createTierList({
      1200: { p2556: 3.07, p2565: 3.17 },
      1500: { p2556: 2.98, p2565: 3.07 },
      3000: { p2556: 2.88, p2565: 2.97 },
      5000: { p2556: 2.74, p2565: 2.82 },
      10000: { p2556: 2.69, p2565: 2.78 },
      20000: { p2556: 2.65, p2565: 2.73 },
      30000: { p2556: 2.63, p2565: 2.71 },
    }),
  },
  {
    id: 'med_08',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '2200G0241',
    blockNo: 'PSN 978',
    description: 'IN SAF CATH NP WITH INJ PORT&WING 20 G x 1 1/4"',
    gsm: 400,
    dimensionsStr: '160 x 105 x 145',
    lengthMm: 160,
    widthMm: 105,
    heightMm: 145,
    colorsAndProcess: '2 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 400g',
    standardTiers: createTierList({
      50: { p2556: 75.71, p2565: 77.98 },
      100: { p2556: 38.37, p2565: 39.52 },
      150: { p2556: 26.11, p2565: 26.89 },
      200: { p2556: 19.98, p2565: 20.58 },
      300: { p2556: 13.29, p2565: 13.69 },
      400: { p2556: 10.51, p2565: 10.82 },
      500: { p2556: 8.28, p2565: 8.53 },
      600: { p2556: 7.16, p2565: 7.38 },
      700: { p2556: 6.05, p2565: 6.23 },
      1200: { p2556: 3.80, p2565: 3.91 },
      1500: { p2556: 3.75, p2565: 3.87 },
      3000: { p2556: 3.71, p2565: 3.82 },
      5000: { p2556: 3.62, p2565: 3.73 },
      10000: { p2556: 3.56, p2565: 3.67 },
      20000: { p2556: 3.51, p2565: 3.62 },
      30000: { p2556: 3.48, p2565: 3.58 },
    }),
  },
  {
    id: 'med_09',
    sheetType: 'sheet3_medical_boxes',
    sheetTitle: 'ปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์',
    mapicNo: '2200G0152',
    blockNo: 'PSN 2040',
    description: 'INNER BOX WING CATH CE MARKET 16G x 2 PSN 2040 IWCE16S0C',
    gsm: 400,
    dimensionsStr: '160 x 105 x 145',
    lengthMm: 160,
    widthMm: 105,
    heightMm: 145,
    colorsAndProcess: '2 สี + อาบเงา+ปั๊ม+ติดกาวข้าง+ก้นกล่อง',
    paperType: 'กล่องแป้งหลังขาว 400g',
    standardTiers: createTierList({
      1200: { p2556: 3.94, p2565: 4.06 },
      1500: { p2556: 3.91, p2565: 4.03 },
      3000: { p2556: 3.88, p2565: 4.00 },
      5000: { p2556: 3.62, p2565: 3.73 },
      10000: { p2556: 3.56, p2565: 3.67 },
      20000: { p2556: 3.51, p2565: 3.62 },
      30000: { p2556: 3.48, p2565: 3.58 },
    }),
  },
];

// ==========================================
// CUSTOMER 2: บริษัท คอลเกต-ปาล์มโอลีฟ (Colgate-Palmolive)
// ==========================================
export const COLGATE_SHEET1_TOOTHPASTE: FactoryMatrixItem[] = [
  {
    id: 'clg_01',
    sheetType: 'clg_toothpaste',
    sheetTitle: 'ชีต 1: กล่องยาสีฟัน แป้งหลังขาว (Colgate Total / MaxFresh / Optic White)',
    mapicNo: 'CLG-TP-150G',
    blockNo: 'BL-CLG-801',
    description: 'กล่องยาสีฟัน Colgate Total 150g (Family Pack)',
    gsm: 350,
    dimensionsStr: '195 x 45 x 38',
    lengthMm: 195,
    widthMm: 45,
    heightMm: 38,
    colorsAndProcess: 'Offset 5 สี (CMYK + แดงพิเศษ) + เคลือบเงา UV + ปั๊มขอบปรุเปิดง่าย',
    paperType: 'กล่องแป้งหลังขาว 350g (White Back Food/Cosmetic Grade)',
    standardTiers: createTierList({
      1000: { p2556: 3.45, p2565: 3.58 },
      3000: { p2556: 2.85, p2565: 2.96 },
      5000: { p2556: 2.45, p2565: 2.55 },
      10000: { p2556: 2.15, p2565: 2.24 },
      30000: { p2556: 1.95, p2565: 2.03 },
      50000: { p2556: 1.82, p2565: 1.89 },
      100000: { p2556: 1.72, p2565: 1.79 },
    }),
    notes: 'สเปกมาตรฐานสำหรับไลน์ผลิตอัตโนมัติความเร็วสูง (High-Speed Cartoner)',
  },
  {
    id: 'clg_02',
    sheetType: 'clg_toothpaste',
    sheetTitle: 'ชีต 1: กล่องยาสีฟัน แป้งหลังขาว',
    mapicNo: 'CLG-TP-OPTIC',
    blockNo: 'BL-CLG-805',
    description: 'กล่องยาสีฟัน Colgate Optic White Plus Shine 100g',
    gsm: 380,
    dimensionsStr: '165 x 40 x 35',
    lengthMm: 165,
    widthMm: 40,
    heightMm: 35,
    colorsAndProcess: 'Offset 5 สี + ปั๊มฟอยล์เงินโฮโลแกรม (Hot Stamping) + เคลือบลามิเนตเงา',
    paperType: 'อาร์ตการ์ด 2 หน้า 380g พรีเมียม',
    standardTiers: createTierList({
      1000: { p2556: 4.80, p2565: 4.99 },
      3000: { p2556: 4.10, p2565: 4.26 },
      5000: { p2556: 3.65, p2565: 3.80 },
      10000: { p2556: 3.25, p2565: 3.38 },
      30000: { p2556: 2.95, p2565: 3.07 },
      50000: { p2556: 2.78, p2565: 2.89 },
    }),
    notes: 'งานพรีเมียมฟอยล์โฮโลแกรม ป้องกันการปลอมแปลง',
  },
];

export const COLGATE_SHEET2_BRUSH_CARTON: FactoryMatrixItem[] = [
  {
    id: 'clg_03',
    sheetType: 'clg_carton',
    sheetTitle: 'ชีต 2: กล่องบรรจุแปรงสีฟัน & ลังขนส่ง Master Carton',
    mapicNo: 'CLG-TB-DUO',
    blockNo: 'BL-CLG-910',
    description: 'กล่องแพ็กคู่ แปรงสีฟัน Colgate SlimSoft Dual Pack (Hanger Box)',
    gsm: 400,
    dimensionsStr: '230 x 60 x 25',
    lengthMm: 230,
    widthMm: 60,
    heightMm: 25,
    colorsAndProcess: '4 สี + เจาะรูแขวน Euro Slot + ปะหน้าต่าง PVC ใส 0.25mm',
    paperType: 'กล่องแป้งหลังขาว 400g',
    standardTiers: createTierList({
      1000: { p2556: 4.20, p2565: 4.35 },
      3000: { p2556: 3.50, p2565: 3.64 },
      5000: { p2556: 3.10, p2565: 3.22 },
      10000: { p2556: 2.75, p2565: 2.86 },
      30000: { p2556: 2.52, p2565: 2.62 },
    }),
  },
];

// ==========================================
// CUSTOMER 3: บริษัท ยูนิลีเวอร์ (Unilever Thai Trading)
// ==========================================
export const UNILEVER_SHEET1_SKINCARE: FactoryMatrixItem[] = [
  {
    id: 'uni_01',
    sheetType: 'uni_skincare',
    sheetTitle: 'ชีต 1: กล่องเซรั่ม & สกินแคร์พรีเมียม (Vaseline / Pond\'s)',
    mapicNo: 'UNI-PND-50G',
    blockNo: 'BL-UNI-312',
    description: 'กล่องครีม Pond\'s Age Miracle Day Cream 50g (ฝาเสียบก้นขัด)',
    gsm: 350,
    dimensionsStr: '75 x 75 x 70',
    lengthMm: 75,
    widthMm: 75,
    heightMm: 70,
    colorsAndProcess: 'Offset 5 สี + ลามิเนตด้าน (Matte OPP) + สปอตยูวีเฉพาะจุด (Spot UV Logo) + ปั๊มนูน (Emboss)',
    paperType: 'อาร์ตการ์ด 350g พรีเมียมฟู้ด/คอสเมติก',
    standardTiers: createTierList({
      1000: { p2556: 5.60, p2565: 5.82 },
      3000: { p2556: 4.75, p2565: 4.94 },
      5000: { p2556: 4.20, p2565: 4.37 },
      10000: { p2556: 3.75, p2565: 3.90 },
      30000: { p2556: 3.40, p2565: 3.54 },
      50000: { p2556: 3.22, p2565: 3.35 },
    }),
    notes: 'ความแม่นยำของตำแหน่งสปอตยูวีและปั๊มนูนต้องอยู่ในพิกัด ±0.3 mm',
  },
  {
    id: 'uni_02',
    sheetType: 'uni_skincare',
    sheetTitle: 'ชีต 1: กล่องเซรั่ม & สกินแคร์พรีเมียม',
    mapicNo: 'UNI-VAS-GLUTA',
    blockNo: 'BL-UNI-318',
    description: 'กล่องโลชั่น Vaseline Gluta-Hya Serum Burst 200ml',
    gsm: 380,
    dimensionsStr: '80 x 50 x 185',
    lengthMm: 80,
    widthMm: 50,
    heightMm: 185,
    colorsAndProcess: '4 สี + เคลือบลามิเนตด้าน + กาวข้างและก้นออโต้ล็อค (Auto Bottom)',
    paperType: 'กล่องแป้งหลังขาว 380g',
    standardTiers: createTierList({
      1000: { p2556: 6.20, p2565: 6.45 },
      3000: { p2556: 5.25, p2565: 5.46 },
      5000: { p2556: 4.65, p2565: 4.84 },
      10000: { p2556: 4.15, p2565: 4.32 },
      30000: { p2556: 3.80, p2565: 3.95 },
    }),
  },
];

// ==========================================
// MASTER MULTI-CUSTOMER DATASET REGISTRY
// ==========================================
export const CUSTOMER_LEGACY_DATASETS: CustomerLegacyDataset[] = [
  {
    customerId: 'nipro',
    customerName: 'บริษัท นิโปร (ประเทศไทย) จำกัด (Nipro Medical)',
    customerCode: 'CUST-NPR00',
    industry: 'อุปกรณ์การแพทย์ & เวชภัณฑ์ (Medical Supplies & Syringes)',
    sheets: [
      {
        sheetId: 'sheet1_ifu',
        sheetName: 'ชีต 1: ใบแทรก / เอกสารกำกับยา (IFU)',
        sheetDescription: 'ตารางปรับราคา IFU (ใบแทรก/คู่มือยา) เริ่มใช้ 01 เม.ย. 2565 (ปรับขึ้น 4%)',
        baseYearLabel: 'ราคาปี 2556 (ฐานเดิม)',
        previousRevisionLabel: 'ปรับราคาปี 2565 (+4%)',
        currentRevisionLabel: 'ราคาปัจจุบัน / ปรับต่อยอด (Target)',
        items: SHEET1_IFU_ITEMS,
      },
      {
        sheetId: 'sheet2_duplex',
        sheetName: 'ชีต 2: กล่องแป้งหลังเทา (Duplex Board)',
        sheetDescription: 'ตารางปรับราคากล่องบรรจุภัณฑ์ ชิ้น (กระดาษหลังเทา) เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%)',
        baseYearLabel: 'ราคาปี 2556 (ฐานเดิม)',
        previousRevisionLabel: 'ปรับราคาปี 2565 (+3%)',
        currentRevisionLabel: 'ราคาปัจจุบัน / ปรับต่อยอด (Target)',
        items: SHEET2_DUPLEX_ITEMS,
      },
      {
        sheetId: 'sheet3_medical_boxes',
        sheetName: 'ชีต 3: กล่องอุปกรณ์การแพทย์ & ไซริงค์',
        sheetDescription: 'ตารางปรับราคากล่องอุปกรณ์การแพทย์ & ไซริงค์ เริ่มใช้ 01 ก.พ. 2565 (ปรับขึ้น 3%) และ 01 เม.ย. 2565 (ปรับ 5%)',
        baseYearLabel: 'ราคาปี 2556 (ฐานเดิม)',
        previousRevisionLabel: 'ปรับราคาปี 2565 (+3% & +5%)',
        currentRevisionLabel: 'ราคาปัจจุบัน / ปรับต่อยอด (Target)',
        items: SHEET3_MEDICAL_ITEMS,
      },
    ],
  },
  {
    customerId: 'colgate',
    customerName: 'บริษัท คอลเกต-ปาล์มโอลีฟ (ประเทศไทย) จำกัด',
    customerCode: 'CUST-CLG01',
    industry: 'ผลิตภัณฑ์ดูแลช่องปากและสุขอนามัย (Oral Care & Personal Care)',
    sheets: [
      {
        sheetId: 'clg_toothpaste',
        sheetName: 'ชีต 1: กล่องยาสีฟัน แป้งหลังขาว',
        sheetDescription: 'ตารางสัญญาจัดซื้อกล่องยาสีฟัน Colgate Total / MaxFresh / Optic White',
        baseYearLabel: 'ราคาฐานสัญญา 2556',
        previousRevisionLabel: 'ปรับราคาปี 2565 (+3.8%)',
        currentRevisionLabel: 'ราคาปัจจุบัน / เสนอปรับรอบใหม่',
        items: COLGATE_SHEET1_TOOTHPASTE,
      },
      {
        sheetId: 'clg_carton',
        sheetName: 'ชีต 2: กล่องแพ็กแปรงสีฟัน & ลังขนส่ง',
        sheetDescription: 'ตารางสเปกกล่องแขวน SlimSoft และบรรจุภัณฑ์กลุ่มอุปกรณ์แปรงสีฟัน',
        baseYearLabel: 'ราคาฐานสัญญา 2556',
        previousRevisionLabel: 'ปรับราคาปี 2565 (+3.5%)',
        currentRevisionLabel: 'ราคาปัจจุบัน / เสนอปรับรอบใหม่',
        items: COLGATE_SHEET2_BRUSH_CARTON,
      },
    ],
  },
  {
    customerId: 'unilever',
    customerName: 'บริษัท ยูนิลีเวอร์ ไทย เทรดดิ้ง จำกัด (Unilever)',
    customerCode: 'CUST-UNI02',
    industry: 'สกินแคร์ เครื่องสำอาง & ของใช้ส่วนบุคคล (Skincare & Beauty)',
    sheets: [
      {
        sheetId: 'uni_skincare',
        sheetName: 'ชีต 1: กล่องเซรั่ม & สกินแคร์พรีเมียม',
        sheetDescription: 'ตารางสัญญาจัดซื้อกล่องครีม Pond\'s, Vaseline Gluta-Hya เคลือบลามิเนตด้านและสปอตยูวี',
        baseYearLabel: 'ราคาฐานสัญญา 2556',
        previousRevisionLabel: 'ปรับราคาปี 2565 (+4.0%)',
        currentRevisionLabel: 'ราคาปัจจุบัน / เสนอปรับรอบใหม่',
        items: UNILEVER_SHEET1_SKINCARE,
      },
    ],
  },
];

// Helper to compute simulated current BOM price for any legacy item
export const estimateItemCurrentBomCost = (
  item: FactoryMatrixItem,
  qty: number
): { unitCost: number; unitPriceWithMargin: number; marginPercent: number } => {
  // Approximate standard industrial box calculating
  const lengthCm = item.lengthMm / 10;
  const widthCm = item.widthMm / 10;
  const heightCm = (item.heightMm || 20) / 10;

  // Flattened area in m2
  let areaM2 = ((lengthCm * 2 + widthCm * 2 + 3) * (widthCm + heightCm * 2 + 4)) / 10000;
  if (item.sheetType.includes('ifu')) {
    areaM2 = (lengthCm * widthCm) / 10000;
  }
  if (areaM2 < 0.01) areaM2 = 0.02;

  // Paper cost based on GSM & type
  let paperPricePerKg = 32.0; // THB/kg
  if (item.paperType.includes('ปอนด์')) paperPricePerKg = 38.0;
  if (item.paperType.includes('หลังขาว') || item.paperType.includes('อาร์ตการ์ด')) paperPricePerKg = 36.0;
  if (item.paperType.includes('หลังเทา')) paperPricePerKg = 26.5;

  const paperWeightKg = (areaM2 * item.gsm) / 1000;
  const paperUnitCost = paperWeightKg * paperPricePerKg * 1.12; // with 12% scrap/waste

  // Printing & Plate fixed costs distributed over quantity
  let plateCostTotal = 2500;
  let makeReadyCost = 1500;
  if (item.colorsAndProcess.includes('5 สี') || item.colorsAndProcess.includes('ฟอยล์')) {
    plateCostTotal = 4500;
    makeReadyCost = 2500;
  } else if (item.colorsAndProcess.includes('1 สี')) {
    plateCostTotal = 1200;
    makeReadyCost = 800;
  }

  const fixedCostPerUnit = (plateCostTotal + makeReadyCost) / Math.max(qty, 100);

  // Printing run cost per unit
  let printRunCost = 0.25;
  if (item.colorsAndProcess.includes('4 สี')) printRunCost = 0.60;
  if (item.colorsAndProcess.includes('5 สี')) printRunCost = 0.85;

  // Surface finishing & coating
  let finishCost = 0.15;
  if (item.colorsAndProcess.includes('ลามิเนต')) finishCost = 0.65;
  if (item.colorsAndProcess.includes('สปอตยูวี') || item.colorsAndProcess.includes('ฟอยล์')) finishCost += 0.55;

  // Die-cut & Gluing
  let convertingCost = 0.35;
  if (item.sheetType.includes('ifu')) convertingCost = 0.10; // fold & stitch
  if (item.colorsAndProcess.includes('ก้นกล่อง') || item.colorsAndProcess.includes('ออโต้')) convertingCost += 0.20;

  const totalUnitCost = paperUnitCost + fixedCostPerUnit + printRunCost + finishCost + convertingCost;
  const standardMargin = 0.25; // 25% target margin
  const unitPriceWithMargin = totalUnitCost / (1 - standardMargin);

  return {
    unitCost: Number(totalUnitCost.toFixed(2)),
    unitPriceWithMargin: Number(unitPriceWithMargin.toFixed(2)),
    marginPercent: 25,
  };
};

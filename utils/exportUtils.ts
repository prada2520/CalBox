import * as XLSX from 'xlsx';
import {
  Customer,
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  CostBreakdown,
  QuantityTier,
  PriceRevision,
  IndustrialExcelItem,
} from '../types';

interface ExportDataParams {
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
  revisions?: PriceRevision[];
  industrialRows?: IndustrialExcelItem[];
}

export const exportCostingToExcel = (params: ExportDataParams) => {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toLocaleDateString('th-TH');

  // Sheet 1: Master FMCG Cost Sheet (ตารางสูตรมาตรฐานตามไฟล์ Excel โรงงานจริง)
  if (params.industrialRows && params.industrialRows.length > 0) {
    const industrialHeaders = [
      'No',
      'Symbol',
      'Description',
      'Quotation',
      'F/Y volume',
      'MOQ/3 AW',
      'Run Size',
      'Dimension',
      'Board Diecutted',
      'Board ใช้เสนอ',
      'Board คำนวณ',
      'WIDTH X LENGTH',
      'ราคา / KG - เดิม',
      'กระดาษ ราคา/KG',
      'มวลกระดาษ',
      'Paper Box นำไป',
      'Box ใช้เสนอ',
      'Box ใช้คำนวณ',
      'ค่ากระดาษไม่รวมWaste',
      '+Waste 4.50%',
      'Production Waste%',
      'Paper Price / Box',
      'Printing / Diecutted',
      'ค่า Conversion',
      'CC/รีม',
      'PLATE (30,000 / 6,000)',
      'ค่าหน้าปั๊ม (2,815,000)',
      'SPOT UV/BOX',
      'MATTED UV/BOX',
      'EMBOSSED/BOX',
      'วอเตอร์เบส',
      'ส่วนลด',
      "PRICE' /BOX",
    ];

    const indRows: any[][] = [
      ['ตารางคิดราคาบรรจุภัณฑ์มาตรฐานโรงงานพิมพ์ (Industrial Packaging Costing Standard Sheet)'],
      ['วันที่จัดทำ:', dateStr],
      [],
      industrialHeaders,
    ];

    params.industrialRows.forEach((r) => {
      indRows.push([
        r.no,
        r.symbol,
        r.description,
        r.quotation,
        r.fyVolume,
        r.moq || '-',
        r.runSize,
        r.dimensionsStr,
        r.boardDiecutted,
        r.boardGsmQuoted,
        r.boardGsmCalculated,
        `${r.sheetWidthInch} x ${r.sheetLengthInch}`,
        r.pricePerKgOriginal,
        r.pricePerKgNew,
        r.paperMassFactor,
        r.paperBoxYield,
        r.boxesPerSheetQuoted,
        r.boxesPerSheetCalculated,
        r.paperCostNoWaste,
        r.paperWasteCost,
        r.productionWastePercent,
        r.paperPricePerBox,
        r.printingColors,
        r.conversionCostPerBox,
        r.ccPerReam || '-',
        r.plateCostPerBox || '-',
        r.diecutToolingPerBox || '-',
        r.spotUvPerBox,
        r.mattedUvPerBox,
        r.embossedPerBox,
        r.waterBasePerBox || 0,
        r.waterBaseDiscount || 0,
        r.pricePerBox,
      ]);
    });

    const wsInd = XLSX.utils.aoa_to_sheet(indRows);
    XLSX.utils.book_append_sheet(wb, wsInd, 'สูตรมาตรฐานโรงงาน (Excel Master)');
  }

  // Sheet 2: ใบเสนอราคา & สรุปต้นทุน BOM
  const summaryRows = [
    ['โรงพิมพ์และบรรจุภัณฑ์ PackCalc Niyomkij - ใบเสนอราคา & รายละเอียดต้นทุน'],
    ['วันที่ออกเอกสาร:', dateStr],
    [],
    ['=== ข้อมูลลูกค้า (Customer Info) ==='],
    ['ชื่อลูกค้า:', params.customer ? params.customer.name : 'ลูกค้าทั่วไป'],
    ['รหัสลูกค้า:', params.customer ? params.customer.code : '-'],
    ['ผู้ติดต่อ:', params.customer ? params.customer.contactPerson : '-'],
    ['เบอร์โทร / Email:', params.customer ? `${params.customer.phone} / ${params.customer.email}` : '-'],
    [],
    ['=== สเปกบรรจุภัณฑ์ (Packaging Specs) ==='],
    ['ชื่องาน / กล่อง:', params.boxName],
    ['ประเภทโครงสร้าง:', params.categoryName],
    ['ขนาดภายนอก (กว้างxยาวxสูง):', `${params.dimensions.length} x ${params.dimensions.width} x ${params.dimensions.height} มม.`],
    ['ขนาดคลี่กาง Dieline:', `${Math.round(params.result.spreadWidthMm)} x ${Math.round(params.result.spreadHeightMm)} มม.`],
    ['พื้นที่ต่อใบ (รวมเผื่อเสีย):', `${params.result.areaSqM.toFixed(4)} ตร.ม.`],
    ['น้ำหนักต่อใบ:', `${params.result.weightPerBoxGrams.toFixed(1)} กรัม`],
    ['ชนิดกระดาษ / วัสดุ:', `${params.paper.materialType} (${params.paper.gsm} GSM)`],
    ['ราคากระดาษ:', `${params.paper.pricePerUnit} บาท/${params.paper.pricingUnit === 'per_kg' ? 'กก.' : 'ตร.ม.'} (เผื่อเสีย ${params.paper.wastePercent}%)`],
    ['ระบบพิมพ์:', params.printing.type.toUpperCase()],
    ['งานเคลือบผิว:', params.finishing.coatingType],
    ['เทคนิคพิเศษ:', `${params.finishing.hasSpotUv ? 'สปอตยูวี, ' : ''}${params.finishing.hasFoilStamping ? 'ปั๊มฟอยล์, ' : ''}${params.finishing.hasEmbossing ? 'ปั๊มนูน' : 'ไม่มี'}`],
    ['การขึ้นรูป & ปะกาว:', params.converting.gluingType],
    [],
    ['=== สรุปราคาและมูลค่าสั่งผลิต (Pricing Summary) ==='],
    ['จำนวนสั่งผลิตหลัก:', `${params.production.quantity.toLocaleString()} ใบ`],
    ['ต้นทุนคงที่เฉลี่ยต่อใบ (Fixed Cost):', `${params.result.fixedCostPerUnit.toFixed(2)} บาท/ใบ`],
    ['ต้นทุนผันแปรต่อใบ (Variable Cost):', `${params.result.totalVariableCostPerUnit.toFixed(2)} บาท/ใบ`],
    ['ต้นทุนรวมเฉลี่ยต่อใบ (Total Cost):', `${params.result.totalCostPerUnit.toFixed(2)} บาท/ใบ`],
    ['อัตรากำไร (Markup):', `+${params.production.markupPercent}%`],
    ['ราคาขายแนะนำต่อใบ (Selling Price):', `${params.result.sellingPricePerUnit.toFixed(2)} บาท/ใบ`],
    ['ยอดรวมทั้งออเดอร์ (Total Order Value):', `${params.result.totalOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`],
    ['กำไรสุทธิรวม (Total Profit):', `${params.result.totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`],
    [],
    ['=== รายการแจกแจงต้นทุน Master BOM (Bill of Materials Breakdown) ==='],
    ['หมวดหมู่', 'รายการองค์ประกอบ', 'ประเภท', 'ต้นทุน/ใบ (บาท)', 'ยอดรวม (บาท)', 'สัดส่วน (%)'],
  ];

  params.result.bomItems.forEach((item) => {
    summaryRows.push([
      item.categoryLabel,
      item.name,
      item.type === 'fixed' ? 'Fixed' : 'Variable',
      item.unitCost.toFixed(2),
      item.totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      `${item.percentageOfTotal.toFixed(1)}%`,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'ใบเสนอราคา & BOM');

  // Sheet 2: ตาราง Volume Tiers
  const tierRows = [
    ['ตารางวิเคราะห์ราคาตามจำนวนสั่งผลิต (Volume Tier Pricing Comparison)'],
    ['ชื่องาน:', params.boxName],
    ['ลูกค้า:', params.customer ? params.customer.name : 'ลูกค้าทั่วไป'],
    [],
    ['จำนวนสั่งผลิต (ใบ)', 'Fixed Cost/ใบ (บาท)', 'Variable/ใบ (บาท)', 'ต้นทุนรวม/ใบ (บาท)', 'ราคาขายแนะนำ/ใบ (บาท)', 'ยอดรวมออเดอร์ (บาท)', 'กำไรรวม (บาท)'],
  ];

  params.tiers.forEach((t) => {
    tierRows.push([
      t.quantity.toLocaleString(),
      t.fixedCostPerUnit.toFixed(2),
      t.variableCostPerUnit.toFixed(2),
      t.totalCostPerUnit.toFixed(2),
      t.suggestedPricePerUnit.toFixed(2),
      t.totalOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      t.totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    ]);
  });

  const wsTiers = XLSX.utils.aoa_to_sheet(tierRows);
  XLSX.utils.book_append_sheet(wb, wsTiers, 'เปรียบเทียบตามยอด');

  // Sheet 3: ประวัติการปรับราคา (Revision History) ถ้ามี
  if (params.revisions && params.revisions.length > 0) {
    const revRows = [
      ['ประวัติการปรับราคาและเหตุผล (Price Revision History Log)'],
      ['ลูกค้า:', params.customer ? params.customer.name : 'ลูกค้าทั่วไป'],
      ['กล่อง:', params.boxName],
      [],
      ['Revision', 'วันที่/เวลา', 'เหตุผลในการปรับราคา', 'จำนวน (ใบ)', 'ต้นทุน/ใบ (บาท)', 'ราคาขาย/ใบ (บาท)', 'ผลต่างราคาต่อใบ (บาท)', 'ผลต่าง (%)'],
    ];

    params.revisions.forEach((rev) => {
      revRows.push([
        `Rev ${rev.revisionNo}`,
        rev.formattedDate,
        rev.reason,
        rev.production.quantity.toLocaleString(),
        rev.unitCost.toFixed(2),
        rev.sellingPrice.toFixed(2),
        rev.priceDiffFromPrevious !== undefined ? `${rev.priceDiffFromPrevious > 0 ? '+' : ''}${rev.priceDiffFromPrevious.toFixed(2)}` : '-',
        rev.percentDiffFromPrevious !== undefined ? `${rev.percentDiffFromPrevious > 0 ? '+' : ''}${rev.percentDiffFromPrevious.toFixed(1)}%` : '-',
      ]);
    });

    const wsRevs = XLSX.utils.aoa_to_sheet(revRows);
    XLSX.utils.book_append_sheet(wb, wsRevs, 'ประวัติการปรับราคา');
  }

  // Generate filename
  const safeCustomer = (params.customer?.name || 'Customer').replace(/[^a-zA-Z0-9ก-๙]/g, '_').slice(0, 20);
  const safeBox = params.boxName.replace(/[^a-zA-Z0-9ก-๙]/g, '_').slice(0, 20);
  const fileName = `Quotation_${safeCustomer}_${safeBox}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

// Export all 3 Factory Sheets into a single comprehensive Excel workbook
export const exportFactory3SheetsToExcel = (
  sheet1Rows: any[],
  sheet2Rows: any[],
  sheet3Rows: any[]
) => {
  const wb = XLSX.utils.book_new();

  const exportSingleFactorySheet = (
    sheetName: string,
    title: string,
    items: any[],
    adjustmentNote: string
  ) => {
    const tableData: any[][] = [
      [title],
      [adjustmentNote],
      [],
      [
        'MAPIC NO',
        'BLOCK NO',
        'Description',
        'Gsm',
        'Size (L x W / L x W x H)',
        'Colors & Process',
        'Paper Material',
        // Tiers Year 2556
        'ราคาปี 2556 [200]',
        'ราคาปี 2556 [300]',
        'ราคาปี 2556 [500]',
        'ราคาปี 2556 [800]',
        'ราคาปี 2556 [1,000]',
        'ราคาปี 2556 [1,200]',
        'ราคาปี 2556 [1,500]',
        'ราคาปี 2556 [3,000]',
        'ราคาปี 2556 [5,000]',
        'ราคาปี 2556 [10,000]',
        'ราคาปี 2556 [20,000]',
        'ราคาปี 2556 [30,000]',
        'ราคาปี 2556 [50,000]',
        // Tiers Year 2565
        'ปรับราคาปี 2565 [200]',
        'ปรับราคาปี 2565 [300]',
        'ปรับราคาปี 2565 [500]',
        'ปรับราคาปี 2565 [800]',
        'ปรับราคาปี 2565 [1,000]',
        'ปรับราคาปี 2565 [1,200]',
        'ปรับราคาปี 2565 [1,500]',
        'ปรับราคาปี 2565 [3,000]',
        'ปรับราคาปี 2565 [5,000]',
        'ปรับราคาปี 2565 [10,000]',
        'ปรับราคาปี 2565 [20,000]',
        'ปรับราคาปี 2565 [30,000]',
        'ปรับราคาปี 2565 [50,000]',
        // Tiers Current Year (ปีปัจจุบัน / บันทึกต่อยอด)
        'ราคาปัจจุบัน/ปรับล่าสุด [1,000]',
        'ราคาปัจจุบัน/ปรับล่าสุด [1,500]',
        'ราคาปัจจุบัน/ปรับล่าสุด [3,000]',
        'ราคาปัจจุบัน/ปรับล่าสุด [5,000]',
        'ราคาปัจจุบัน/ปรับล่าสุด [10,000]',
        'ราคาปัจจุบัน/ปรับล่าสุด [20,000]',
        'ราคาปัจจุบัน/ปรับล่าสุด [30,000]',
        'หมายเหตุ',
      ],
    ];

    const targetQtys = [200, 300, 500, 800, 1000, 1200, 1500, 3000, 5000, 10000, 20000, 30000, 50000];
    const currentTargetQtys = [1000, 1500, 3000, 5000, 10000, 20000, 30000];

    items.forEach((item) => {
      const tierMap: { [qty: number]: any } = {};
      item.standardTiers.forEach((t: any) => {
        tierMap[t.qty] = t;
      });

      const row = [
        item.mapicNo || '-',
        item.blockNo || '-',
        item.description || '-',
        item.gsm || '-',
        item.dimensionsStr || `${item.lengthMm} x ${item.widthMm}`,
        item.colorsAndProcess || '-',
        item.paperType || '-',
      ];

      // 2556 tiers
      targetQtys.forEach((q) => {
        const val = tierMap[q]?.price2556;
        row.push(val !== null && val !== undefined ? val : '-');
      });

      // 2565 tiers
      targetQtys.forEach((q) => {
        const val = tierMap[q]?.price2565;
        row.push(val !== null && val !== undefined ? val : '-');
      });

      // Current tiers
      currentTargetQtys.forEach((q) => {
        const val = tierMap[q]?.priceCurrent;
        row.push(val !== null && val !== undefined ? val : '-');
      });

      row.push(item.notes || '');
      tableData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  exportSingleFactorySheet(
    'Sheet1_IFU (ใบแทรก)',
    'ตารางปรับราคา IFU (ใบแทรก / เอกสารกำกับยาและเวชภัณฑ์)',
    sheet1Rows,
    'เริ่มใช้ราคาวันที่ 01 เมษายน 2565 (ปรับขึ้น 4%)'
  );

  exportSingleFactorySheet(
    'Sheet2_Duplex (กล่องแป้งหลังเทา)',
    'ตารางปรับราคากล่องบรรจุภัณฑ์ ชิ้น (กระดาษหลังเทา)',
    sheet2Rows,
    'เริ่มใช้ราคาวันที่ 01 กุมภาพันธ์ 2565 (ปรับขึ้น 3%) และ 01 เมษายน 2565 (ปรับขึ้นอีก 5%)'
  );

  exportSingleFactorySheet(
    'Sheet3_Medical (กล่องการแพทย์)',
    'ตารางปรับราคากล่องบรรจุภัณฑ์เฉพาะทาง (กล่องไซริงค์ & อุปกรณ์การแพทย์)',
    sheet3Rows,
    'เริ่มใช้ราคาวันที่ 01 กุมภาพันธ์ 2565 (ปรับขึ้น 3%) และ 01 เมษายน 2565 (ปรับขึ้น 5%)'
  );

  const fileName = `Factory_Master_Price_Matrix_3Sheets_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportCustomerLegacySheetsToExcel = (
  customerName: string,
  customerCode: string,
  sheets: {
    sheetName: string;
    sheetDescription: string;
    baseYearLabel: string;
    previousRevisionLabel: string;
    currentRevisionLabel: string;
    items: any[];
  }[]
) => {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toLocaleDateString('th-TH');

  sheets.forEach((sheet, sIdx) => {
    const tableData: any[][] = [
      [`ตารางประวัติราคาเดิมและการปรับราคา: ${customerName} (${customerCode})`],
      [`ชีต: ${sheet.sheetName} | ${sheet.sheetDescription}`],
      [`วันที่ส่งออกข้อมูล: ${dateStr}`],
      [],
      [
        'MAPIC NO / รหัสสินค้า',
        'BLOCK NO',
        'DESCRIPTION / รายการสินค้า',
        'GRAM (GSM)',
        'ขนาด (L x W x H)',
        'พิมพ์และกระบวนการหลังพิมพ์',
        'ชนิดกระดาษ',
        // Base Year Tiers
        `[${sheet.baseYearLabel}] 500`,
        `[${sheet.baseYearLabel}] 1,000`,
        `[${sheet.baseYearLabel}] 3,000`,
        `[${sheet.baseYearLabel}] 5,000`,
        `[${sheet.baseYearLabel}] 10,000`,
        `[${sheet.baseYearLabel}] 20,000`,
        `[${sheet.baseYearLabel}] 30,000`,
        // Previous Revision Tiers
        `[${sheet.previousRevisionLabel}] 500`,
        `[${sheet.previousRevisionLabel}] 1,000`,
        `[${sheet.previousRevisionLabel}] 3,000`,
        `[${sheet.previousRevisionLabel}] 5,000`,
        `[${sheet.previousRevisionLabel}] 10,000`,
        `[${sheet.previousRevisionLabel}] 20,000`,
        `[${sheet.previousRevisionLabel}] 30,000`,
        // Target / Current Tiers
        `[${sheet.currentRevisionLabel}] 1,000`,
        `[${sheet.currentRevisionLabel}] 3,000`,
        `[${sheet.currentRevisionLabel}] 5,000`,
        `[${sheet.currentRevisionLabel}] 10,000`,
        `[${sheet.currentRevisionLabel}] 20,000`,
        `[${sheet.currentRevisionLabel}] 30,000`,
        'หมายเหตุ',
      ],
    ];

    const targetQtys = [500, 1000, 3000, 5000, 10000, 20000, 30000];

    sheet.items.forEach((item) => {
      const tierMap: { [qty: number]: any } = {};
      (item.standardTiers || []).forEach((t: any) => {
        tierMap[t.qty] = t;
      });

      const row = [
        item.mapicNo || '-',
        item.blockNo || '-',
        item.description || '-',
        item.gsm || '-',
        item.dimensionsStr || `${item.lengthMm} x ${item.widthMm}`,
        item.colorsAndProcess || '-',
        item.paperType || '-',
      ];

      // Base year
      targetQtys.forEach((q) => {
        const val = tierMap[q]?.price2556;
        row.push(val !== null && val !== undefined ? val : '-');
      });

      // Previous revision
      targetQtys.forEach((q) => {
        const val = tierMap[q]?.price2565;
        row.push(val !== null && val !== undefined ? val : '-');
      });

      // Current / Target
      [1000, 3000, 5000, 10000, 20000, 30000].forEach((q) => {
        const val = tierMap[q]?.priceCurrent;
        row.push(val !== null && val !== undefined ? val : '-');
      });

      row.push(item.notes || '');
      tableData.push(row);
    });

    const safeSheetName = sheet.sheetName.replace(/[\\/?*[\]]/g, '').slice(0, 31) || `Sheet${sIdx + 1}`;
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  });

  const safeCustomerSlug = customerName.replace(/[^a-zA-Z0-9ก-๙]/g, '_').slice(0, 20);
  const fileName = `Customer_Legacy_Matrix_${safeCustomerSlug}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};



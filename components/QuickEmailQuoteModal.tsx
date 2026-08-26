import React, { useState } from 'react';
import {
  X,
  Zap,
  Mail,
  MessageSquare,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Package,
  Layers,
  FileText,
  DollarSign,
  TrendingUp,
  Building2,
  Phone,
  Send,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  ProductionSpecs,
  BoxCategory,
  Customer,
} from '../types';
import { calculatePackagingCosts } from '../utils/calculator';

interface QuickEmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  activeCustomer: Customer;
  onApplySpecsAndCalculate: (specs: {
    boxName: string;
    category: BoxCategory;
    dimensions: BoxDimensions;
    paper: PaperSpecs;
    printing: PrintingSpecs;
    finishing: FinishingSpecs;
    converting: ConvertingSpecs;
    production: ProductionSpecs;
  }) => void;
  onOpenQuotation?: () => void;
}

interface ParsedSpecs {
  boxName: string;
  category: BoxCategory;
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  notes: string[];
}

export const QuickEmailQuoteModal: React.FC<QuickEmailQuoteModalProps> = ({
  isOpen,
  onClose,
  customers,
  activeCustomer,
  onApplySpecsAndCalculate,
  onOpenQuotation,
}) => {
  const [inputText, setInputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeSampleIndex, setActiveSampleIndex] = useState<number | null>(null);

  // Sample real-world customer inquiries (Email / LINE format)
  const sampleInquiries = [
    {
      title: '📩 ตัวอย่าง 1: อีเมลขอราคากล่องยาสีฟัน (Colgate)',
      tag: 'กล่องแป้งหลังเทา',
      text: `เรียน ทีมฝ่ายขาย บจก.นิยมกิจ

รบกวนขอใบเสนอราคาผลิตกล่องยาสีฟัน Fresh Clean รายละเอียดดังนี้ครับ:
- ขนาดกล่อง: กว้าง 48 mm x ยาว 190 mm x สูง 78 mm
- กระดาษ: กล่องแป้งหลังเทา DBS 350 แกรม
- งานพิมพ์: Offset 4 สี (CMYK)
- งานเคลือบ: เคลือบวานิชเงา (Varnish)
- รูปแบบ: กล่องฝาเสียบก้นขัด (Tuck End)
- จำนวนผลิต: 10,000 ใบ
สถานที่ส่ง: นิคมแหลมฉบัง ชลบุรี

ขอบคุณครับ
สมชาย การค้า (Colgate-Palmolive)`,
    },
    {
      title: '💬 ตัวอย่าง 2: ข้อความ LINE กล่องเครื่องสำอาง พรีเมียม',
      tag: 'อาร์ตการ์ด + ฟอยล์',
      text: `สวัสดีค่ะเซลล์ ขอราคาด่วนหน่อยค่า
กล่องเซรั่มบำรุงผิว Luxe Glow
ขนาด 6 x 6 x 14 cm
ใช้กระดาษอาร์ตการ์ด 350g พิมพ์ 4 สี
เคลือบด้าน + ปั๊มฟอยล์ทองโลโก้ 1 จุด + ปั๊มนูนตัวหนังสือ
ยอด 5,000 ชิ้น ส่ง กทม. ค่ะ`,
    },
    {
      title: '📦 ตัวอย่าง 3: กล่องลูกฟูกฝาชน/กล่องหิ้ว (E-Flute)',
      tag: 'กล่องลูกฟูก',
      text: `ขอราคา กล่องพัสดุหูหิ้ว E-Flute ขนาด กว้าง 15 ซม. ยาว 25 ซม. สูง 10 ซม. 
กระดาษคราฟท์ปะลูกฟูก ลอน E หนา 1.5 มม. พิมพ์ 1 สี ดำ
ยอด 5,000 ใบ ด่วนครับ`,
    },
    {
      title: '⚡ ตัวอย่าง 4: ข้อความสั้นๆ ทางโทรศัพท์/แชทด่วน',
      tag: 'ข้อความด่วน',
      text: `กล่องสบู่ 8x3.5x10 cm แป้งหลังขาว 300g พิมพ์ 4 สี เคลือบเงา 5,000 ใบ ขอราคาต่อชิ้นด่วนจ้า`,
    },
  ];

  // Smart Parser Engine (NLP & Regex Extractor for Packaging)
  const parseInquiryText = (raw: string): ParsedSpecs => {
    const text = raw.toLowerCase();
    const notes: string[] = [];

    // 1. Box Name Extraction
    let boxName = 'กล่องสั่งผลิตตามใบสอบถาม';
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.includes('กล่อง') && !line.startsWith('-') && line.length < 50) {
        boxName = line.replace(/^(รบกวนขอใบเสนอราคาผลิต|ขอราคา|ผลิต)?\s*/i, '').trim();
        break;
      }
    }

    // 2. Dimensions Extraction (L x W x H)
    let length = 190;
    let width = 48;
    let height = 78;

    // Patterns like: 190 x 48 x 78 mm or 19x4.8x7.8 cm or กว้าง 48 ยาว 190 สูง 78
    const cmMatch = text.match(/([\d.]+)\s*(?:x|×|\*)\s*([\d.]+)\s*(?:x|×|\*)\s*([\d.]+)\s*(?:cm|ซม|เซนติเมตร)/i);
    const mmMatch = text.match(/([\d.]+)\s*(?:x|×|\*)\s*([\d.]+)\s*(?:x|×|\*)\s*([\d.]+)\s*(?:mm|มม|มิลลิเมตร)?/i);
    
    // Explicit named dimensions
    const explicitW = text.match(/(?:กว้าง|w|width)\s*[:：]?\s*([\d.]+)\s*(cm|mm|ซม|มม)?/i);
    const explicitL = text.match(/(?:ยาว|l|length)\s*[:：]?\s*([\d.]+)\s*(cm|mm|ซม|มม)?/i);
    const explicitH = text.match(/(?:สูง|h|height)\s*[:：]?\s*([\d.]+)\s*(cm|mm|ซม|มม)?/i);

    if (explicitL && explicitW && explicitH) {
      const isCm = (explicitL[2] && (explicitL[2].includes('cm') || explicitL[2].includes('ซม'))) || parseFloat(explicitL[1]) < 35;
      const mult = isCm ? 10 : 1;
      length = parseFloat(explicitL[1]) * mult;
      width = parseFloat(explicitW[1]) * mult;
      height = parseFloat(explicitH[1]) * mult;
      notes.push(`ตรวจพบขนาดระบุชัดเจน: ${length} x ${width} x ${height} มม.`);
    } else if (cmMatch) {
      const v1 = parseFloat(cmMatch[1]) * 10;
      const v2 = parseFloat(cmMatch[2]) * 10;
      const v3 = parseFloat(cmMatch[3]) * 10;
      // Assign longest to Length
      const sorted = [v1, v2, v3].sort((a, b) => b - a);
      length = sorted[0];
      width = sorted[2];
      height = sorted[1];
      notes.push(`ตรวจพบขนาดหน่วย ซม.: แปลงเป็น ${length} x ${width} x ${height} มม.`);
    } else if (mmMatch) {
      const v1 = parseFloat(mmMatch[1]);
      const v2 = parseFloat(mmMatch[2]);
      const v3 = parseFloat(mmMatch[3]);
      const mult = (v1 < 35 && v2 < 35 && v3 < 35) ? 10 : 1;
      const sorted = [v1 * mult, v2 * mult, v3 * mult].sort((a, b) => b - a);
      length = sorted[0];
      width = sorted[2];
      height = sorted[1];
      notes.push(`ตรวจพบขนาด 3 มิติ: ${length} x ${width} x ${height} มม.`);
    }

    // 3. Paper / Material & GSM Extraction
    let materialType = 'กระดาษกล่องแป้งหลังเทา (Duplex Board Grey Back)';
    let gsm = 350;
    let pricePerUnit = 25.55;

    if (text.includes('อาร์ตการ์ด') || text.includes('art card') || text.includes('c1s') || text.includes('c2s')) {
      materialType = 'กระดาษอาร์ตการ์ด 1 หน้า (Art Card C1S)';
      pricePerUnit = 38.50;
      notes.push('ชนิดกระดาษ: อาร์ตการ์ดเกรดพรีเมียม');
    } else if (text.includes('หลังขาว') || text.includes('dws') || text.includes('duplex white')) {
      materialType = 'กระดาษกล่องแป้งหลังขาว (Duplex Board White Back)';
      pricePerUnit = 29.50;
      notes.push('ชนิดกระดาษ: แป้งหลังขาว Food/Cosmetic Grade');
    } else if (text.includes('ลูกฟูก') || text.includes('corrugated') || text.includes('flute') || text.includes('คราฟท์')) {
      materialType = 'กระดาษคราฟท์ปะลูกฟูก 3 ชั้น ลอน E';
      pricePerUnit = 24.00;
      gsm = 380;
      notes.push('ชนิดกระดาษ: แผ่นลูกฟูก 3 ชั้น ลอน E (Micro Flute)');
    } else if (text.includes('คราฟท์') || text.includes('kraft')) {
      materialType = 'กระดาษคราฟท์ฟู้ดเกรดธรรมชาติ (Kraft Paper)';
      pricePerUnit = 32.00;
      notes.push('ชนิดกระดาษ: คราฟท์ธรรมชาติ Eco Friendly');
    } else {
      materialType = 'กระดาษกล่องแป้งหลังเทา (Duplex Board Grey Back)';
      pricePerUnit = 25.55;
      notes.push('ชนิดกระดาษ: แป้งหลังเทา มาตรฐานอุตสาหกรรม (DBS)');
    }

    // GSM match
    const gsmMatch = text.match(/(\d{3})\s*(?:gsm|แกรม|g|g\/m2)?/i);
    if (gsmMatch) {
      const val = parseInt(gsmMatch[1], 10);
      if (val >= 200 && val <= 600) {
        gsm = val;
        notes.push(`ความหนา: ${gsm} แกรม (GSM)`);
      }
    }

    // 4. Printing Specs
    let printingType: PrintingSpecs['type'] = 'offset_cmyk';
    let plateCost = 2400;
    let printCost = 0.35;

    if (text.includes('1 สี') || text.includes('1 color') || text.includes('สีเดียว')) {
      printingType = 'offset_1color';
      plateCost = 600;
      printCost = 0.15;
      notes.push('ระบบพิมพ์: Offset 1 สี (ประหยัดค่าเพลท)');
    } else if (text.includes('ไม่พิมพ์') || text.includes('กล่องเปล่า') || text.includes('plain')) {
      printingType = 'none';
      plateCost = 0;
      printCost = 0;
      notes.push('ระบบพิมพ์: กล่องเปล่าไม่พิมพ์');
    } else {
      printingType = 'offset_cmyk';
      plateCost = 2400;
      printCost = 0.35;
      notes.push('ระบบพิมพ์: Offset 4 สี (CMYK Full Color)');
    }

    // 5. Finishing & Coating
    let coatingType: FinishingSpecs['coatingType'] = 'varnish';
    let coatingCost = 0.12;
    let hasFoil = false;
    let hasEmboss = false;
    let hasSpotUv = false;

    if (text.includes('เคลือบด้าน') || text.includes('matte') || text.includes('opp ด้าน')) {
      coatingType = 'matte_lam';
      coatingCost = 0.45;
      notes.push('การเคลือบ: เคลือบฟิล์ม OPP ด้าน');
    } else if (text.includes('เคลือบเงา') || text.includes('gloss') || text.includes('opp เงา')) {
      coatingType = 'gloss_lam';
      coatingCost = 0.40;
      notes.push('การเคลือบ: เคลือบฟิล์ม OPP เงา');
    } else if (text.includes('ขัดเงา') || text.includes('waterbased') || text.includes('water-based') || text.includes('วอเตอร์เบส')) {
      coatingType = 'water_based';
      coatingCost = 0.20;
      notes.push('การเคลือบ: วอเตอร์เบส Water-based');
    } else if (text.includes('uv') || text.includes('ยูวี')) {
      coatingType = 'uv_coat';
      coatingCost = 0.30;
      notes.push('การเคลือบ: เคลือบเงา UV');
    } else {
      coatingType = 'varnish';
      coatingCost = 0.12;
      notes.push('การเคลือบ: เคลือบวานิช (Varnish)');
    }

    if (text.includes('ฟอยล์') || text.includes('foil') || text.includes('เคทอง') || text.includes('เคเงิน')) {
      hasFoil = true;
      notes.push('งานพิเศษ: ปั๊มฟอยล์ Hot Stamping Foil');
    }
    if (text.includes('ปั๊มนูน') || text.includes('emboss') || text.includes('นูน')) {
      hasEmboss = true;
      notes.push('งานพิเศษ: ปั๊มนูน Emboss');
    }
    if (text.includes('spot uv') || text.includes('สปอตยูวี') || text.includes('ยูวีเฉพาะจุด')) {
      hasSpotUv = true;
      notes.push('งานพิเศษ: Spot UV เฉพาะจุด');
    }

    // 6. Production Quantity
    let orderQty = 10000;
    const qtyMatch = text.match(/(?:จำนวน|ยอด|สั่ง|ผลิต|qty)\s*[:：]?\s*([\d,]+)\s*(?:ใบ|กล่อง|ชิ้น|pcs)?/i);
    if (qtyMatch) {
      const rawNum = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
      if (rawNum >= 100 && rawNum <= 10000000) {
        orderQty = rawNum;
        notes.push(`จำนวนสั่งผลิต: ${orderQty.toLocaleString()} ใบ`);
      }
    } else {
      const largeNum = text.match(/([\d,]+)\s*(?:ใบ|กล่อง|ชิ้น|pcs)/i);
      if (largeNum) {
        const rawNum = parseInt(largeNum[1].replace(/,/g, ''), 10);
        if (rawNum >= 500) {
          orderQty = rawNum;
          notes.push(`จำนวนสั่งผลิต: ${orderQty.toLocaleString()} ใบ`);
        }
      }
    }

    // 7. Box Category
    let category: BoxCategory = 'tuck_end';
    if (text.includes('ก้นล็อก') || text.includes('auto bottom') || text.includes('auto-lock') || text.includes('autolock')) {
      category = 'auto_bottom';
      notes.push('ทรงกล่อง: ฝาเสียบก้นล็อกอัตโนมัติ (Auto-Lock Bottom)');
    } else if (text.includes('ก้นขัด') || text.includes('snap lock') || text.includes('1-2-3')) {
      category = 'snap_bottom';
      notes.push('ทรงกล่อง: ฝาเสียบก้นขัด (Snap Lock Bottom)');
    } else if (text.includes('ฝาครอบ') || text.includes('2 ชิ้น') || text.includes('lid') || text.includes('base')) {
      category = 'lid_base';
      notes.push('ทรงกล่อง: กล่องฝาครอบ 2 ชิ้น (Lid & Base)');
    } else if (text.includes('ปลอกสวม') || text.includes('ลิ้นชัก') || text.includes('sleeve') || text.includes('drawer')) {
      category = 'sleeve_tray';
      notes.push('ทรงกล่อง: กล่องปลอกสวม / ลิ้นชัก (Sleeve & Tray)');
    } else if (text.includes('ถาดพับ') || text.includes('เบเกอรี่') || text.includes('folding tray')) {
      category = 'folding_tray';
      notes.push('ทรงกล่อง: กล่องถาดพับ / เบเกอรี่ (Folding Tray)');
    } else {
      category = 'tuck_end';
      notes.push('ทรงกล่อง: กล่องฝาเสียบหัวท้ายมาตรฐาน (Tuck End Box)');
    }

    return {
      boxName,
      category,
      dimensions: {
        length: Math.max(20, length),
        width: Math.max(15, width),
        height: Math.max(15, height),
      },
      paper: {
        materialType,
        gsm,
        pricingUnit: 'per_kg',
        pricePerUnit,
        wastePercent: 8,
      },
      printing: {
        type: printingType,
        plateFixedCost: plateCost,
        printCostPerUnit: printCost,
        pantoneColorsCount: 0,
        pantoneFixedCostPerColor: 800,
      },
      finishing: {
        coatingType,
        coatingCostPerUnit: coatingCost,
        hasSpotUv,
        spotUvFixedCost: hasSpotUv ? 1200 : 0,
        spotUvCostPerUnit: hasSpotUv ? 0.35 : 0,
        hasFoilStamping: hasFoil,
        foilAreaWidthMm: 50,
        foilAreaHeightMm: 30,
        foilFixedCost: hasFoil ? 1500 : 0,
        foilCostPerUnit: hasFoil ? 0.45 : 0,
        hasEmbossing: hasEmboss,
        embossFixedCost: hasEmboss ? 1200 : 0,
        embossCostPerUnit: hasEmboss ? 0.25 : 0,
      },
      converting: {
        dieCutPlateFixedCost: 2500,
        dieCutCostPerUnit: 0.18,
        gluingType: category === 'auto_bottom' ? 'bottom_lock' : 'auto_side',
        gluingCostPerUnit: 0.12,
        hasWindowPatching: false,
        windowFixedCost: 0,
        windowCostPerUnit: 0,
      },
      production: {
        quantity: orderQty,
        markupPercent: 25,
        packingCostPerUnit: 0.08,
        otherFixedCosts: 500,
      },
      notes,
    };
  };

  const parsed = parseInquiryText(inputText || (sampleInquiries[0]?.text ?? ''));

  // Calculate live cost from parsed specs
  const costResult = calculatePackagingCosts(
    parsed.category,
    parsed.dimensions,
    parsed.paper,
    parsed.printing,
    parsed.finishing,
    parsed.converting,
    parsed.production
  );

  const unitCost = costResult.totalCostPerUnit;
  const sellingPrice = costResult.sellingPricePerUnit;
  const totalAmount = costResult.totalOrderValue;
  const totalProfit = costResult.totalProfit;

  // Format Quote Reply for LINE / Email copy
  const generateLineQuoteReply = () => {
    return `📄 ใบสรุปราคาเบื้องต้น (Preliminary Quote)
โดย นิยมกิจ บรรจุภัณฑ์ (PackCalc Niyomkij)
----------------------------------------
📦 สินค้า: ${parsed.boxName}
📐 ขนาด: ${parsed.dimensions.length} x ${parsed.dimensions.width} x ${parsed.dimensions.height} มม. (L×W×H)
📄 กระดาษ: ${parsed.paper.materialType} ${parsed.paper.gsm} แกรม
🎨 งานพิมพ์: ${parsed.printing.type.toUpperCase()}
✨ งานเคลือบ: ${parsed.finishing.coatingType}${parsed.finishing.hasFoilStamping ? ' + ปั๊มฟอยล์' : ''}${parsed.finishing.hasEmbossing ? ' + ปั๊มนูน' : ''}${parsed.finishing.hasSpotUv ? ' + Spot UV' : ''}
🔢 จำนวนผลิต: ${parsed.production.quantity.toLocaleString()} ใบ

💰 ราคาเสนอขาย: ${sellingPrice.toFixed(2)} บาท/ใบ
💵 มูลค่ารวมทั้งสิ้น: ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
⏱️ ระยะเวลาผลิต: ประมาณ 7-10 วันทำการหลังสรุป Artwork & Proof

*ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม 7% และค่าจัดส่ง
สอบถามเพิ่มเติม: ติดต่อฝ่ายขาย นิยมกิจ บรรจุภัณฑ์`;
  };

  const handleCopyQuote = () => {
    const textToCopy = generateLineQuoteReply();
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleApply = () => {
    onApplySpecsAndCalculate({
      boxName: parsed.boxName,
      category: parsed.category,
      dimensions: parsed.dimensions,
      paper: parsed.paper,
      printing: parsed.printing,
      finishing: parsed.finishing,
      converting: parsed.converting,
      production: parsed.production,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e1424] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#141c30] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  คิดราคาด่วนจากข้อความอีเมล / LINE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Mobile On-the-Go Estimator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                วางข้อความหรืออีเมลที่ลูกค้าส่งมา ระบบจะสกัดขนาด, กระดาษ, งานพิมพ์ และคิดราคาให้ทันที
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Preset Samples Bar */}
          <div>
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>หรือเลือกข้อความตัวอย่างเพื่อทดสอบระบบ:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleInquiries.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(sample.text);
                    setActiveSampleIndex(idx);
                  }}
                  className={`p-2.5 rounded-xl text-left transition-all border text-xs flex flex-col justify-between ${
                    activeSampleIndex === idx
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold truncate">{sample.title.split(':')[0]}</span>
                  <span className="text-[10px] text-slate-400 mt-1 truncate">{sample.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>ข้อความคำถาม / สเปกกล่องจากลูกค้า (LINE, Email, แชท):</span>
              </label>
              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setActiveSampleIndex(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  ล้างข้อความ
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setActiveSampleIndex(null);
              }}
              placeholder="วางข้อความที่นี่ เช่น: กล่องยาสีฟัน ขนาด 48x190x78 mm แป้งหลังเทา 350 แกรม พิมพ์ 4 สี เคลือบวานิช 10,000 ใบ ขอราคาด่วน..."
              rows={4}
              className="w-full bg-[#090d16] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 font-sans transition-all outline-none"
            />
          </div>

          {/* Real-time Parsed Results & Price Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Parsed Specs Breakdown */}
            <div className="lg:col-span-7 bg-[#121829] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>สเปกที่ระบบถอดความได้ (Auto Parsed):</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {parsed.category.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">ชื่อรายการกล่อง</div>
                  <div className="font-bold text-white truncate mt-0.5">{parsed.boxName}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">ขนาด (ยาว x กว้าง x สูง)</div>
                  <div className="font-bold text-blue-400 mt-0.5">
                    {parsed.dimensions.length} × {parsed.dimensions.width} × {parsed.dimensions.height} mm
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">กระดาษ & ความหนา</div>
                  <div className="font-bold text-slate-200 mt-0.5 truncate">
                    {parsed.paper.materialType.split(' ')[0]} {parsed.paper.gsm}g
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">งานพิมพ์ & เคลือบ</div>
                  <div className="font-bold text-amber-300 mt-0.5 truncate">
                    {parsed.printing.type === 'none' ? 'ไม่พิมพ์' : parsed.printing.type.toUpperCase()} / {parsed.finishing.coatingType}
                  </div>
                </div>
              </div>

              {/* Detected Points Notes */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-slate-300">รายละเอียดที่ตรวจพบ:</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsed.notes.map((note, nIdx) => (
                    <span
                      key={nIdx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                    >
                      ✓ {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Calculated Price Summary & Quick Actions */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#131c33] to-[#0d1424] p-4 rounded-2xl border border-blue-500/30 flex flex-col justify-between shadow-xl space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-blue-300 font-bold mb-1">
                  <span>ราคาประเมินเบื้องต้น (Instant Estimate)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    Margin {parsed.production.markupPercent}%
                  </span>
                </div>

                {/* Big Price Display */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-500/20 my-2">
                  <div className="text-[11px] text-slate-400">ราคาเสนอขายต่อใบ (Selling Price)</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight flex items-baseline gap-1.5">
                    ฿{sellingPrice.toFixed(2)}
                    <span className="text-xs font-normal text-slate-400">/ ใบ</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400">ต้นทุนแท้จริง: </span>
                      <span className="font-bold text-slate-200">฿{unitCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">จำนวนผลิต: </span>
                      <span className="font-bold text-blue-400">{parsed.production.quantity.toLocaleString()} ใบ</span>
                    </div>
                  </div>

                  <div className="mt-1 pt-1 text-[11px] text-slate-400">
                    มูลค่ารวมทั้งสิ้น:{' '}
                    <span className="font-bold text-white font-mono">
                      ฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCopyQuote}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>คัดลอกข้อความตอบกลับ LINE/Email แล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>คัดลอกข้อความตอบลูกค้า (LINE / Email)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all"
                >
                  <Sliders className="w-4 h-4" />
                  <span>นำสเปกนี้เข้าสู่หน้าคำนวณ & ดู 3D</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Copy Preview Box */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>ตัวอย่างข้อความที่จะส่งตอบลูกค้า (Live Preview):</span>
            </div>
            <pre className="p-3 rounded-lg bg-black/40 text-slate-300 text-[11px] font-mono whitespace-pre-wrap leading-relaxed border border-slate-800/80">
              {generateLineQuoteReply()}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#141c30] border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>ลูกค้าปัจจุบัน: <strong className="text-slate-200">{activeCustomer.name}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ปิดหน้าต่าง
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md"
            >
              ตกลง & คำนวณ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickEmailQuoteModal;

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  Building2,
  Sparkles,
  Sliders,
  X,
  Check,
  Layers,
  ArrowRight,
  FileText,
  Zap,
  ChevronDown,
  Database,
  Tag,
  RotateCcw,
  Box as BoxIcon,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BoxCategory,
  BoxDimensions,
  PaperSpecs,
  PrintingSpecs,
  FinishingSpecs,
  ConvertingSpecs,
  CustomerBoxRecord,
  BoxPreset,
} from '../types';
import { MASTER_BOX_PRESETS } from '../data/boxPresets';
import { PAPER_CATALOG } from '../data/paperCatalog';
import { CUSTOMER_LEGACY_DATASETS, FactoryMatrixItem } from '../data/factory3SheetsData';

interface Step2QuickFilterBarProps {
  activeCustomer: {
    id: string;
    name: string;
    code: string;
  };
  activeBoxName: string;
  customerBoxes: CustomerBoxRecord[];
  activePresetId?: string;
  onApplyPreset: (preset: BoxPreset) => void;
  onLoadCustomerBox: (record: CustomerBoxRecord) => void;
  onApplyFactoryLegacyItem: (specs: {
    name: string;
    category: BoxCategory;
    dimensions: BoxDimensions;
    paper: Partial<PaperSpecs>;
    printing: Partial<PrintingSpecs>;
    finishing: Partial<FinishingSpecs>;
    converting: Partial<ConvertingSpecs>;
    notes?: string;
  }) => void;
  onApplyPaperGrade?: (paper: {
    materialType: string;
    gsm: number;
    pricingUnit: 'per_kg' | 'per_sqm';
    pricePerUnit: number;
  }) => void;
}

type FilterSource = 'all' | 'customer_boxes' | 'legacy_items' | 'presets' | 'paper_grades';

export const Step2QuickFilterBar: React.FC<Step2QuickFilterBarProps> = ({
  activeCustomer,
  activeBoxName,
  customerBoxes,
  activePresetId,
  onApplyPreset,
  onLoadCustomerBox,
  onApplyFactoryLegacyItem,
  onApplyPaperGrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<FilterSource>('all');
  const [selectedGsm, setSelectedGsm] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsExpanded(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Customer legacy dataset
  const currentLegacyDataset = useMemo(() => {
    return CUSTOMER_LEGACY_DATASETS.find((d) => d.customerId === activeCustomer.id) || CUSTOMER_LEGACY_DATASETS[0];
  }, [activeCustomer.id]);

  // Extract all legacy items of this customer
  const allLegacyItems = useMemo(() => {
    if (!currentLegacyDataset) return [];
    return currentLegacyDataset.sheets.flatMap((s) => s.items);
  }, [currentLegacyDataset]);

  // Filtered Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const isSearching = q.length > 0 || selectedGsm !== 'all' || selectedCategory !== 'all';

    // 1. Customer Saved Boxes
    const matchedCustomerBoxes = (activeSource === 'all' || activeSource === 'customer_boxes')
      ? customerBoxes.filter((b) => {
          const matchText = !q || b.boxName.toLowerCase().includes(q) || b.boxCategory.toLowerCase().includes(q);
          const matchCat = selectedCategory === 'all' || b.boxCategory === selectedCategory;
          const matchGsm = selectedGsm === 'all' || b.paper.gsm.toString() === selectedGsm;
          return matchText && matchCat && matchGsm;
        })
      : [];

    // 2. Legacy Factory Items
    const matchedLegacyItems = (activeSource === 'all' || activeSource === 'legacy_items')
      ? allLegacyItems.filter((item) => {
          const matchText =
            !q ||
            item.description.toLowerCase().includes(q) ||
            item.mapicNo.toLowerCase().includes(q) ||
            item.blockNo.toLowerCase().includes(q) ||
            item.dimensionsStr.toLowerCase().includes(q) ||
            item.paperType.toLowerCase().includes(q) ||
            item.colorsAndProcess.toLowerCase().includes(q);
          const matchGsm = selectedGsm === 'all' || item.gsm.toString() === selectedGsm;
          return matchText && matchGsm;
        })
      : [];

    // 3. Standard Box Presets
    const matchedPresets = (activeSource === 'all' || activeSource === 'presets')
      ? MASTER_BOX_PRESETS.filter((p) => {
          const matchText =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.nameEn.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q);
          const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
          const matchGsm = selectedGsm === 'all' || p.defaultPaper.gsm.toString() === selectedGsm;
          return matchText && matchCat && matchGsm;
        })
      : [];

    // 4. Paper Grades
    const matchedPapers = (activeSource === 'all' || activeSource === 'paper_grades')
      ? PAPER_CATALOG.filter((cat) => {
          const matchText =
            !q ||
            cat.name.toLowerCase().includes(q) ||
            cat.nameEn.toLowerCase().includes(q) ||
            cat.description.toLowerCase().includes(q);
          const matchGsm =
            selectedGsm === 'all' ||
            cat.availableGsms.includes(Number(selectedGsm)) ||
            cat.defaultGsm.toString() === selectedGsm;
          return matchText && matchGsm;
        })
      : [];

    const totalCount =
      matchedCustomerBoxes.length +
      matchedLegacyItems.length +
      matchedPresets.length +
      matchedPapers.length;

    return {
      isSearching,
      totalCount,
      customerBoxes: matchedCustomerBoxes,
      legacyItems: matchedLegacyItems,
      presets: matchedPresets,
      papers: matchedPapers,
    };
  }, [searchQuery, activeSource, selectedGsm, selectedCategory, customerBoxes, allLegacyItems]);

  // Convert Legacy Factory Item to specs format
  const handleSelectLegacyItem = (item: FactoryMatrixItem) => {
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
        materialType: pType,
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
      notes: `โหลดผ่านตัวกรองด่วน: ${item.mapicNo} [BLOCK: ${item.blockNo}]`,
    };

    onApplyFactoryLegacyItem(specs);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedGsm('all');
    setSelectedCategory('all');
    setActiveSource('all');
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border-2 border-blue-500/40 p-4 shadow-xl text-white space-y-3 relative">
      
      {/* Top Search Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isExpanded) setIsExpanded(true);
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder="🔍 ค้นหากล่อง, MAPIC, ขนาด (เช่น 150x100), แกรม (เช่น 350g), ชนิดกระดาษ หรือเทคนิคพิมพ์..."
            className="w-full bg-[#1e293b] text-white text-xs sm:text-sm pl-10 pr-24 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-medium placeholder:text-slate-500 shadow-inner"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
                title="ล้างคำค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Quick Scope Filter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSource('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              activeSource === 'all'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            <span>ทั้งหมด</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {searchResults.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource('customer_boxes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              activeSource === 'customer_boxes'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>กล่องที่เคยบันทึก ({customerBoxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource('legacy_items')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              activeSource === 'legacy_items'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ประวัติราคาเดิม ({allLegacyItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource('presets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              activeSource === 'presets'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            <BoxIcon className="w-3.5 h-3.5" />
            <span>พรีเซ็ตทรงกล่อง ({MASTER_BOX_PRESETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all ${
              isExpanded
                ? 'bg-blue-600/30 text-blue-300 border-blue-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title={isExpanded ? 'ย่อผลการค้นหา' : 'ขยายผลการค้นหา'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>

      {/* Secondary Fast Filters (GSM & Box Category Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
        
        {/* Left: Quick GSM Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>กรองแกรม:</span>
          </span>
          {['all', '270', '300', '350', '400', '450'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGsm(g)}
              className={`px-2 py-0.5 rounded-lg font-mono text-[11px] transition-colors border ${
                selectedGsm === g
                  ? 'bg-blue-600 text-white border-blue-400 font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              {g === 'all' ? 'ทุกแกรม' : `${g}g`}
            </button>
          ))}
        </div>

        {/* Right: Box Shape Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold hidden sm:inline">ทรงกล่อง:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1e293b] text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 font-medium cursor-pointer"
          >
            <option value="all">ทุกทรงกล่อง</option>
            <option value="tuck_end">ฝาเสียบหัวท้าย (Tuck End)</option>
            <option value="snap_lock_bottom">ก้นขัด (Snap Lock)</option>
            <option value="auto_bottom">ก้นออโต้ล็อค (Auto Bottom)</option>
            <option value="corrugated_rsc">กล่องลูกฟูกขนส่ง (RSC)</option>
            <option value="folding_tray">ถาดสไลด์ (Tray / Drawer)</option>
            <option value="rigid_box">กล่องจั่วปังพรีเมียม (Rigid Box)</option>
            <option value="pillow_box">กล่องหมอน (Pillow Box)</option>
            <option value="gable_box">กล่องมีหูหิ้ว (Gable Box)</option>
            <option value="ifu_insert">ใบแทรกยา / แผ่นพับ (IFU)</option>
          </select>

          {(searchQuery || selectedGsm !== 'all' || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตตัวกรอง</span>
            </button>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE SEARCH RESULTS & PREVIEWS (ไม่ต้องเลื่อนสกอร์หาเอง) */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                ผลการค้นหา {searchResults.totalCount} รายการ{' '}
                {searchQuery ? `(ตรงกับ "${searchQuery}")` : '(แสดงรายการทั้งหมดเพื่อเลือกคิดราคา)'}
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              คลิก <strong>"⚡ โหลดสเปก"</strong> เพื่อดึงขนาดและสูตรต้นทุนขึ้นหน้าคิดราคาทันที
            </span>
          </div>

          {/* Results Container with Smooth Grid */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
            
            {/* 1. Customer Saved Boxes Section */}
            {searchResults.customerBoxes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>กล่องที่เคยบันทึกของ {activeCustomer.name} ({searchResults.customerBoxes.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.customerBoxes.map((b) => {
                    const isActive = b.boxName === activeBoxName;
                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-md'
                            : 'bg-[#111726] hover:bg-[#161f36] border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                            <span className="truncate">{b.boxName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-mono font-bold">
                              Rev.{b.currentRevisionNo}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                            <span className="text-cyan-300 font-bold">
                              {b.dimensions.length} × {b.dimensions.width} × {b.dimensions.height} mm
                            </span>
                            <span>•</span>
                            <span>{b.paper.materialType.split(' ')[0]} {b.paper.gsm}g</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onLoadCustomerBox(b);
                            setIsExpanded(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 flex items-center gap-1 transition-all ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isActive ? 'กำลังใช้งาน' : '⚡ โหลดสเปก'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Factory Legacy Items Section */}
            {searchResults.legacyItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>รายการสินค้าจากประวัติราคาเดิม (Legacy Matrix) ({searchResults.legacyItems.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.legacyItems.slice(0, 10).map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border bg-[#111726] hover:bg-[#161f36] border-slate-800 hover:border-emerald-500/50 text-slate-200 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-amber-300">
                              {item.mapicNo || item.blockNo}
                            </span>
                            <span className="font-bold text-xs text-white truncate">
                              {item.description}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="font-mono text-cyan-300 font-bold">{item.dimensionsStr} mm</span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">{item.gsm}g</span>
                            <span className="text-slate-400 truncate max-w-[140px]">• {item.colorsAndProcess}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectLegacyItem(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-md transition-all"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>⚡ โหลดสเปก</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
                {searchResults.legacyItems.length > 10 && (
                  <div className="text-center text-xs text-slate-500 font-mono py-1">
                    และอีก {searchResults.legacyItems.length - 10} รายการ (พิมพ์ค้นหาเพิ่มเติมเพื่อกรองเฉพาะเจาะจง)
                  </div>
                )}
              </div>
            )}

            {/* 3. Standard Presets Section */}
            {searchResults.presets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <BoxIcon className="w-3.5 h-3.5" />
                  <span>แม่แบบทรงกล่องมาตรฐาน (Box Presets) ({searchResults.presets.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.presets.map((preset) => {
                    const isSelected = activePresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                            : 'bg-[#111726] hover:bg-[#161f36] border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                            <span className="truncate">{preset.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {preset.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                            <span className="text-cyan-300">
                              {preset.defaultDimensions.length} × {preset.defaultDimensions.width} × {preset.defaultDimensions.height} mm
                            </span>
                            <span>•</span>
                            <span>{preset.defaultPaper.materialType.split(' ')[0]} {preset.defaultPaper.gsm}g</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onApplyPreset(preset);
                            setIsExpanded(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 flex items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'ทรงปัจจุบัน' : '⚡ ใช้ทรงนี้'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Paper Grades Section */}
            {searchResults.papers.length > 0 && onApplyPaperGrade && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>เกรดและชนิดกระดาษ (Paper Catalog) ({searchResults.papers.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.papers.map((paperCat) => {
                    return (
                      <div
                        key={paperCat.id}
                        className="p-3 rounded-xl border bg-[#111726] hover:bg-[#161f36] border-slate-800 hover:border-purple-500/50 text-slate-200 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white truncate">
                            {paperCat.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-purple-300 font-mono font-bold">
                              {paperCat.defaultGsm} GSM (มี {paperCat.availableGsms.join(', ')}g)
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono">
                              {paperCat.defaultPricePerUnit} ฿/{paperCat.pricingUnit === 'per_kg' ? 'kg' : 'm²'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onApplyPaperGrade({
                              materialType: paperCat.name,
                              gsm: paperCat.defaultGsm,
                              pricingUnit: paperCat.pricingUnit,
                              pricePerUnit: paperCat.defaultPricePerUnit,
                            });
                            setIsExpanded(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-md transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>เลือกกระดาษนี้</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchResults.totalCount === 0 && (
              <div className="p-8 text-center bg-[#0b0f19] rounded-xl border border-slate-800 text-slate-400 space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300">
                  ไม่พบรายการที่ตรงกับคำค้นหา "{searchQuery}"
                </div>
                <p className="text-[11px] text-slate-500">
                  ลองค้นหาด้วยคำอื่น เช่น รหัส MAPIC, ขนาด (เช่น 150), หรือเลือก "ทั้งหมด"
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 text-blue-400 hover:text-blue-300 text-xs font-bold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้างการค้นหา</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

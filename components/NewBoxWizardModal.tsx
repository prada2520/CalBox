import React, { useState } from 'react';
import { BoxCategory, BoxPreset, Customer } from '../types';
import { MASTER_BOX_PRESETS } from '../data/boxPresets';
import { PAPER_CATALOG } from '../data/paperCatalog';
import { Sparkles, X, ArrowRight, Check, Package, Layers, Scissors, Printer } from 'lucide-react';

interface NewBoxWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onCreateNewBox: (params: {
    boxName: string;
    preset: BoxPreset;
    length: number;
    width: number;
    height: number;
    paperCatalogId: string;
    printingType: 'offset_cmyk' | 'offset_1color' | 'flexo_2color' | 'none';
    coatingType: 'matte_lam' | 'gloss_lam' | 'uv_coat' | 'none';
    quantity: number;
  }) => void;
}

const NewBoxWizardModal: React.FC<NewBoxWizardModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCreateNewBox,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MASTER_BOX_PRESETS[0].id);
  const [boxName, setBoxName] = useState<string>('กล่องผลิตภัณฑ์ใหม่');
  const [length, setLength] = useState<number>(MASTER_BOX_PRESETS[0].defaultDimensions.length);
  const [width, setWidth] = useState<number>(MASTER_BOX_PRESETS[0].defaultDimensions.width);
  const [height, setHeight] = useState<number>(MASTER_BOX_PRESETS[0].defaultDimensions.height);
  const [paperCatalogId, setPaperCatalogId] = useState<string>('duplex_white_back');
  const [printingType, setPrintingType] = useState<'offset_cmyk' | 'offset_1color' | 'flexo_2color' | 'none'>('offset_cmyk');
  const [coatingType, setCoatingType] = useState<'matte_lam' | 'gloss_lam' | 'uv_coat' | 'none'>('gloss_lam');
  const [quantity, setQuantity] = useState<number>(5000);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: BoxPreset) => {
    setSelectedPresetId(preset.id);
    setLength(preset.defaultDimensions.length);
    setWidth(preset.defaultDimensions.width);
    setHeight(preset.defaultDimensions.height);
    setBoxName(`กล่อง${preset.name.split(' ')[0]} - ${customer.name.split(' ')[0]}`);
    
    // Suggest matching paper for folding box
    if (preset.category === 'auto_bottom' || preset.category === 'sleeve_tray') {
      setPaperCatalogId('artcard_c1s');
      setPrintingType('offset_cmyk');
      setCoatingType('matte_lam');
    } else if (preset.category === 'snap_bottom') {
      setPaperCatalogId('duplex_grey_back');
      setPrintingType('offset_cmyk');
      setCoatingType('gloss_lam');
    } else if (preset.category === 'folding_tray') {
      setPaperCatalogId('duplex_white_back');
      setPrintingType('offset_cmyk');
      setCoatingType('uv_coat');
    } else {
      setPaperCatalogId('duplex_white_back');
      setPrintingType('offset_cmyk');
      setCoatingType('uv_coat');
    }
  };

  const handleComplete = () => {
    const preset = MASTER_BOX_PRESETS.find((p) => p.id === selectedPresetId) || MASTER_BOX_PRESETS[0];
    onCreateNewBox({
      boxName: boxName.trim() || `${preset.name} - ${customer.name.split(' ')[0]}`,
      preset,
      length: Number(length) || 100,
      width: Number(width) || 100,
      height: Number(height) || 100,
      paperCatalogId,
      printingType,
      coatingType,
      quantity: Number(quantity) || 5000,
    });
    onClose();
    // Reset step
    setStep(1);
  };

  const currentPreset = MASTER_BOX_PRESETS.find((p) => p.id === selectedPresetId) || MASTER_BOX_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                คิดราคากล่องใหม่แบบรวดเร็ว (Quick Quote Wizard)
              </h3>
              <p className="text-xs text-slate-400">
                สำหรับลูกค้า: <span className="text-indigo-300 font-semibold">{customer.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 text-xs px-6 py-2.5">
          <span className={`font-semibold flex items-center gap-1.5 ${step === 1 ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step === 1 ? 'bg-indigo-600' : 'bg-slate-400'}`}>1</span>
            เลือกทรงกล่อง
          </span>
          <span className="mx-3 text-slate-300">/</span>
          <span className={`font-semibold flex items-center gap-1.5 ${step === 2 ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step === 2 ? 'bg-indigo-600' : 'bg-slate-400'}`}>2</span>
            ระบุขนาด & วัสดุ
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                เลือกรูปแบบโครงสร้างกล่องที่ต้องการคำนวณ:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MASTER_BOX_PRESETS.map((p) => {
                  const isSelected = p.id === selectedPresetId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {p.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        ขนาดตัวอย่าง: {p.defaultDimensions.length}×{p.defaultDimensions.width}×{p.defaultDimensions.height} มม.
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Box Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ชื่องาน / ชื่อกล่อง
                </label>
                <input
                  type="text"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="เช่น กล่องเซรั่ม 30ml, กล่องยาสีฟัน"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ขนาดพับสำเร็จ (มิลลิเมตร):
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">ความยาว (L)</span>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">ความกว้าง (W)</span>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">ความสูง (H)</span>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Paper Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  เลือกกระดาษ / แผ่นลูกฟูก:
                </label>
                <select
                  value={paperCatalogId}
                  onChange={(e) => setPaperCatalogId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 bg-white"
                >
                  {PAPER_CATALOG.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      [{cat.categoryLabel}] {cat.name} ({cat.defaultGsm} GSM)
                    </option>
                  ))}
                </select>
              </div>

              {/* Printing & Coating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ระบบพิมพ์:
                  </label>
                  <select
                    value={printingType}
                    onChange={(e) => setPrintingType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="offset_cmyk">Offset 4 สี (CMYK - พรีเมียม)</option>
                    <option value="offset_1color">Offset 1-2 สี</option>
                    <option value="flexo_2color">Flexo (กล่องลูกฟูก)</option>
                    <option value="none">ไม่พิมพ์ (กล่องเปล่า)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    งานเคลือบผิว:
                  </label>
                  <select
                    value={coatingType}
                    onChange={(e) => setCoatingType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="matte_lam">เคลือบลามิเนตด้าน</option>
                    <option value="gloss_lam">เคลือบลามิเนตเงา</option>
                    <option value="uv_coat">เคลือบ UV เงา</option>
                    <option value="none">ไม่เคลือบ</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  จำนวนผลิตตั้งต้น (ใบ):
                </label>
                <div className="flex gap-2">
                  {[1000, 3000, 5000, 10000, 20000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        quantity === q
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {q.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 1 ? (
            <div></div>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5"
            >
              ย้อนกลับ
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>ถัดไป: ระบุขนาด & วัสดุ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>คำนวณราคา & ดูผลลัพธ์ทันที</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default NewBoxWizardModal;

import React, { useState } from 'react';
import { Customer, CustomerBoxRecord } from '../types';
import {
  Building2,
  ChevronDown,
  Plus,
  Search,
  Check,
  User,
  Phone,
  Mail,
  History,
  Sparkles,
  FolderOpen,
  Edit3,
  Package,
  BookOpen,
  Lock,
  Unlock,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface CustomerHeaderBarProps {
  customers: Customer[];
  activeCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  onAddNewCustomer: (customer: Customer) => void;
  customerBoxes: CustomerBoxRecord[];
  activeBoxName: string;
  onLoadCustomerBox: (record: CustomerBoxRecord) => void;
  onOpenNewBoxWizard: () => void;
  onOpenEditSpecs: () => void;
  onOpenHistoryModal: () => void;
  isPriceLocked?: boolean;
  onTogglePriceLock?: () => void;
  onOpenUserGuide: () => void;
  onOpenShareApp?: () => void;
}

const CustomerHeaderBar: React.FC<CustomerHeaderBarProps> = ({
  customers,
  activeCustomer,
  onSelectCustomer,
  onAddNewCustomer,
  customerBoxes,
  activeBoxName,
  onLoadCustomerBox,
  onOpenNewBoxWizard,
  onOpenEditSpecs,
  onOpenHistoryModal,
  isPriceLocked = false,
  onTogglePriceLock,
  onOpenUserGuide,
  onOpenShareApp,
}) => {
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [isBoxDropdownOpen, setIsBoxDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [boxSearchQuery, setBoxSearchQuery] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBoxRecord = customerBoxes.find((b) => b.boxName === activeBoxName);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const code = newCode.trim() || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      code,
      contactPerson: newContact.trim() || 'ผู้ติดต่อทั่วไป',
      phone: newPhone.trim() || '-',
      email: newEmail.trim() || '-',
      notes: newNotes.trim() || '',
      favoriteCategory: 'tuck_end',
    };

    onAddNewCustomer(newCust);
    onSelectCustomer(newCust);
    setIsNewCustomerModalOpen(false);
    setIsCustDropdownOpen(false);

    // Reset Form
    setNewName('');
    setNewCode('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-md border-2 border-slate-800 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Customer & Box Picker */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          
          {/* Customer Dropdown */}
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              ลูกค้าที่กำลังคิดราคา (Active Customer):
            </div>
            
            <button
              type="button"
              onClick={() => setIsCustDropdownOpen(!isCustDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-xs sm:text-sm font-black transition-colors group focus:outline-none shadow-xs"
            >
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{activeCustomer.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono font-bold border border-slate-700">
                {activeCustomer.code}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-white" />
            </button>

            {/* Customer Popover */}
            {isCustDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCustDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border-2 border-slate-300 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อลูกค้า หรือ รหัส..."
                      className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 font-medium"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 text-xs sm:text-sm">
                    {filteredCustomers.map((cust) => {
                      const isSelected = cust.id === activeCustomer.id;
                      return (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => {
                            onSelectCustomer(cust);
                            setIsCustDropdownOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-amber-100 text-slate-950 font-black'
                              : 'hover:bg-slate-100 text-slate-800 font-semibold'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-slate-950">{cust.name}</div>
                            <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                              <span className="font-mono font-bold text-indigo-700">{cust.code}</span>
                              <span>• {cust.contactPerson}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-emerald-700 shrink-0 font-bold" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustDropdownOpen(false);
                        setIsNewCustomerModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มข้อมูลลูกค้าใหม่ (Add New Customer)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Current Box Selector */}
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              กล่องที่เลือกผลิต (Active Box Record):
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsBoxDropdownOpen(!isBoxDropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-xs sm:text-sm font-black transition-colors group focus:outline-none shadow-xs"
              >
                <Package className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-xs">{activeBoxName}</span>
                {activeBoxRecord && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-white font-mono font-bold">
                    Rev.{activeBoxRecord.currentRevisionNo}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </button>

              {/* Box Records Popover */}
              {isBoxDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsBoxDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border-2 border-slate-300 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-black text-slate-800 px-1 flex items-center justify-between">
                      <span>ประวัติกล่องของ {activeCustomer.name}:</span>
                      <span className="font-mono text-slate-500 text-[11px]">{customerBoxes.length} รายการ</span>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                      <input
                        type="text"
                        value={boxSearchQuery}
                        onChange={(e) => setBoxSearchQuery(e.target.value)}
                        placeholder="🔍 พิมพ์ค้นหาชื่อกล่อง..."
                        className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 font-medium"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 text-xs sm:text-sm">
                      {customerBoxes
                        .filter((b) =>
                          b.boxName.toLowerCase().includes(boxSearchQuery.toLowerCase()) ||
                          b.boxCategory.toLowerCase().includes(boxSearchQuery.toLowerCase())
                        )
                        .map((b) => {
                          const isSelected = b.boxName === activeBoxName;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                onLoadCustomerBox(b);
                                setIsBoxDropdownOpen(false);
                                setBoxSearchQuery('');
                              }}
                              className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-amber-100 text-slate-950 font-black'
                                  : 'hover:bg-slate-100 text-slate-800 font-semibold'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <div className="font-bold text-slate-950">{b.boxName}</div>
                                <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                                  <span className="font-mono bg-slate-200 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[11px]">
                                    Rev.{b.currentRevisionNo}
                                  </span>
                                  <span>{b.revisions.length} ประวัติราคา</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-5 h-5 text-emerald-700 shrink-0 font-bold" />}
                            </button>
                          );
                        })}

                      {customerBoxes.length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-xs sm:text-sm font-medium">
                          ยังไม่มีกล่องที่บันทึกไว้สำหรับลูกค้ารายนี้
                        </div>
                      )}
                      {customerBoxes.length > 0 && customerBoxes.filter((b) =>
                        b.boxName.toLowerCase().includes(boxSearchQuery.toLowerCase()) ||
                        b.boxCategory.toLowerCase().includes(boxSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-xs font-medium">
                          ไม่พบกล่องที่ตรงกับ "{boxSearchQuery}"
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBoxDropdownOpen(false);
                          onOpenNewBoxWizard();
                        }}
                        className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        + คิดราคากล่องใหม่ให้ลูกค้ารายนี้ (New Box)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          {/* Price Protection Status Badge & Toggle */}
          {onTogglePriceLock && (
            <button
              type="button"
              onClick={onTogglePriceLock}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                isPriceLocked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={
                isPriceLocked
                  ? 'ราคากล่องล็อกอยู่เพื่อความปลอดภัย คลิกเพื่อปลดล็อกแก้ไข'
                  : 'อยู่ในโหมดแก้ไขอิสระ คลิกเพื่อล็อกราคาป้องกันข้อมูลเคลื่อน'
              }
            >
              {isPriceLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>🔒 ราคาถูกล็อก (Protected)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🔓 โหมดแก้ไขอิสระ</span>
                </>
              )}
            </button>
          )}

          {/* Share App Link Button */}
          {onOpenShareApp && (
            <button
              type="button"
              onClick={onOpenShareApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs sm:text-sm font-bold border-2 border-blue-500/40 transition-all shadow-md active:scale-95"
              title="แชร์ลิงก์ระบบ หรือคัดลอก URL ส่งต่อให้ผู้อื่น"
            >
              <Share2 className="w-4 h-4 text-blue-300" />
              <span>แชร์ลิงก์</span>
            </button>
          )}

          {/* User Guide Button */}
          <button
            type="button"
            onClick={onOpenUserGuide}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white text-xs sm:text-sm font-bold border-2 border-indigo-500/40 transition-all shadow-md active:scale-95"
            title="เปิดดูคู่มือการใช้งานระบบ แผนผังเมนู และศัพท์เทคนิคโรงพิมพ์"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>📖 คู่มือการใช้งาน</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewBoxWizard}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-95"
            title="คิดราคากล่องใหม่แบบ 2 ขั้นตอน"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>+ คิดราคากล่องใหม่</span>
          </button>

          <button
            type="button"
            onClick={onOpenEditSpecs}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black transition-colors shadow-md active:scale-95"
            title="ปรับแก้ขนาด กระดาษ หรือการตกแต่ง"
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            <span>ปรับแต่งสเปก</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border-2 border-slate-700 transition-colors shadow-xs"
            title="ดูประวัติการปรับเปลี่ยนราคาของลูกค้าเจ้านี้"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>ประวัติราคา</span>
          </button>
        </div>

      </div>

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 border-2 border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              เพิ่มข้อมูลลูกค้าใหม่ (New Customer Profile)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              สร้างโปรไฟล์ลูกค้าเพื่อแยกเก็บประวัติการทำราคาและสเปกกล่อง
            </p>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-slate-800 mb-1">
                  ชื่อบริษัท / ชื่อลูกค้า <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น บริษัท สยามคอสเมติกส์ จำกัด"
                  className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">รหัสลูกค้า</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="เช่น CUST-009"
                    className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-800 mb-1">ผู้ติดต่อ / แผนก</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="เช่น คุณสมชาย (จัดซื้อ)"
                    className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-800 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">หมายเหตุ / เงื่อนไขเฉพาะ</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="เช่น ต้องการส่งด่วนภายใน 7 วัน หรือ มีบล็อกเดิมอยู่แล้ว"
                  rows={2}
                  className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-md transition-colors"
                >
                  บันทึกข้อมูลลูกค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHeaderBar;

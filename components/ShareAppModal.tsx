import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  MessageCircle,
  Mail,
  QrCode,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (onShowToast) {
        onShowToast('📋 คัดลอกลิงก์แอปพลิเคชันลงในคลิปบอร์ดแล้ว พร้อมส่งต่อได้ทันที');
      }
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleShareLine = () => {
    const text = encodeURIComponent(`ขอแนะนำระบบคำนวณราคาและโครงสร้างกล่องบรรจุภัณฑ์มาตรฐานโรงงาน พร้อมโมเดล 3 มิติ และส่งออกเอกสาร: ${currentUrl}`);
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('ระบบคำนวณราคาและออกแบบกล่องบรรจุภัณฑ์ (Packaging Cost & 3D)');
    const body = encodeURIComponent(`เรียนทีมงาน/ลูกค้า,\n\nขอส่งลิงก์ระบบคำนวณราคาและดูโมเดล 3D กล่องบรรจุภัณฑ์สำหรับพิจารณา:\n${currentUrl}\n\nสามารถเปิดดูสเปก ปรับขนาด และดาวน์โหลดใบเสนอราคา (PDF/Excel) ได้ทันทีครับ`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // QR Code URL using public QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] text-slate-100 rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1e293b] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">แชร์และส่งต่อลิงก์ (Share Application)</h3>
              <p className="text-xs text-slate-400">ส่งต่อลิงก์ระบบให้เพื่อนร่วมงาน ลูกค้า หรือทีมงาน</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Main URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                ลิงก์เว็บแอปพลิเคชัน (URL Link)
              </span>
              <span className="text-[11px] text-emerald-400 font-normal">เปิดดูได้ทันทีผ่านเบราว์เซอร์</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-none">
                {currentUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Sharing Options */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleShareLine}
              className="p-3 bg-[#132038] hover:bg-[#1a2c4e] border border-slate-700/80 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-200 transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">ส่งทาง LINE</span>
            </button>

            <button
              type="button"
              onClick={handleShareEmail}
              className="p-3 bg-[#132038] hover:bg-[#1a2c4e] border border-slate-700/80 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-200 transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">ส่งทาง Email</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-200 transition-all active:scale-95 group ${
                showQr ? 'bg-indigo-600/30 border-indigo-500/60' : 'bg-[#132038] hover:bg-[#1a2c4e] border-slate-700/80'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">{showQr ? 'ซ่อน QR Code' : 'แสดง QR Code'}</span>
            </button>
          </div>

          {/* QR Code Section */}
          {showQr && (
            <div className="p-4 bg-[#090d16] border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
              <div className="p-2 bg-white rounded-lg shadow-md">
                <img
                  src={qrCodeUrl}
                  alt="QR Code สำหรับเปิดแอปพลิเคชัน"
                  className="w-36 h-36 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                สแกน QR Code ด้วยมือถือเพื่อเปิดใช้งานบนสมาร์ทโฟนหรือแท็บเล็ตได้ทันที
              </p>
            </div>
          )}

          {/* Tips / Instructions */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Info className="w-4 h-4 text-blue-400" />
              <span>คำแนะนำในการส่งลิงก์แนะนำ:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>
                <strong>คัดลอก URL จากแถบที่อยู่ด้านบนของเบราว์เซอร์:</strong> สามารถ Copy ลิงก์จาก Address Bar ของเบราว์เซอร์ส่งให้ผู้อื่นเปิดใช้งานได้โดยตรง
              </li>
              <li>
                <strong>ใช้งานได้ทุกอุปกรณ์:</strong> รองรับการเปิดบนคอมพิวเตอร์ โน้ตบุ๊ก มือถือ และแท็บเล็ต โดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม
              </li>
              <li>
                <strong>ปุ่มแชร์ใน AI Studio:</strong> หากเปิดผ่าน Google AI Studio สามารถกดปุ่ม <strong>Share</strong> ที่มุมขวาบนของหน้าต่าง AI Studio เพื่อสร้างลิงก์สำหรับแชร์ได้เช่นกัน
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#1e293b] border-t border-slate-700/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BoxDimensions, BoxCategory, PaperSpecs, FinishingSpecs } from '../types';
import {
  Ruler,
  Maximize2,
  Box as BoxIcon,
  Layers,
  Info,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  PackageCheck,
  Scale,
  Cpu,
  Compass,
} from 'lucide-react';
import { Box3DViewer } from './Box3DViewer';

interface BoxDiagramWithSpecsProps {
  dimensions: BoxDimensions;
  category?: BoxCategory;
  paper?: PaperSpecs;
  finishing?: FinishingSpecs;
  boxName?: string;
  className?: string;
  compact?: boolean;
  defaultTab?: 'blueprint' | '3d' | 'dieline' | 'guide';
}

export const BoxDiagramWithSpecs: React.FC<BoxDiagramWithSpecsProps> = ({
  dimensions = { length: 100, width: 40, height: 140 },
  category = 'tuck_end',
  paper,
  finishing,
  boxName = 'กล่องบรรจุภัณฑ์',
  className = '',
  compact = false,
  defaultTab = '3d',
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | '3d' | 'dieline' | 'guide'>(defaultTab);

  const L = Math.max(10, Number(dimensions?.length) || 100);
  const W = Math.max(10, Number(dimensions?.width) || 40);
  const H = Math.max(10, Number(dimensions?.height) || 140);

  // Packaging calculations
  // Volume in cubic centimeters / milliliters (cc / ml)
  const volumeCc = Math.round((L * W * H) / 1000);
  const volumeLiters = ((L * W * H) / 1_000_000).toFixed(2);

  // Tuck flaps & glue flap estimations
  const glueFlapMm = 15;
  const topFlapMm = Math.round(W * 0.85 + 10);
  const bottomFlapMm = Math.round(W * 0.85 + 10);

  // Flat Dieline Spread Dimension (Approximate for tuck-end / standard folding carton)
  const flatWidthMm = (L + W) * 2 + glueFlapMm;
  const flatHeightMm = H + topFlapMm + bottomFlapMm;
  const flatAreaSqM = ((flatWidthMm * flatHeightMm) / 1_000_000).toFixed(4);

  // Recommended GSM recommendation based on box volume
  let recommendedGsm = '300 - 350 GSM';
  let loadCapacity = '100 - 300 กรัม';
  let suitableItems = 'เครื่องสำอาง, ครีมทาหน้า, เซรั่ม, ตลับแป้ง, ยาหยอดตา';

  if (volumeCc > 2000) {
    recommendedGsm = '400 - 450 GSM หรือลูกฟูก E-Flute';
    loadCapacity = '1.5 - 3.0 กิโลกรัม';
    suitableItems = 'เครื่องใช้ไฟฟ้าขนาดเล็ก, ชุดของขวัญ, เครื่องสำอางเซ็ตใหญ่, รองเท้า';
  } else if (volumeCc > 800) {
    recommendedGsm = '350 - 400 GSM หรือลูกฟูก 3 ชั้น';
    loadCapacity = '500 - 1,200 กรัม';
    suitableItems = 'ขวดแก้วเซรั่มขนาดใหญ่, กระปุกครีม 100g, อาหารเสริม, กล่องขนม';
  } else if (volumeCc < 200) {
    recommendedGsm = '270 - 300 GSM (การ์ดขาว/แป้งหลังเทา)';
    loadCapacity = '20 - 100 กรัม';
    suitableItems = 'หลอดลิปสติก, ยาหม่อง, ครีมซอง 15-30g, สเปรย์แอลกอฮอล์';
  }

  // Category name in Thai
  const getCategoryLabel = () => {
    switch (category) {
      case 'tuck_end':
        return 'กล่องฝาเสียบหัว-ท้าย (Tuck End Carton)';
      case 'auto_bottom':
        return 'กล่องฝาเสียบก้นล็อกอัตโนมัติ (Auto-Lock Bottom)';
      case 'snap_bottom':
        return 'กล่องฝาเสียบก้นขัด (Snap-Lock / 1-2-3 Bottom)';
      case 'lid_base':
        return 'กล่องฝาครอบ 2 ชิ้น (Two-Piece Box: Lid & Base)';
      case 'sleeve_tray':
        return 'กล่องปลอกสวม / ลิ้นชัก (Sleeve & Tray)';
      default:
        return 'กล่องพับสำเร็จมาตรฐาน (Folding Carton)';
    }
  };

  // Isometric Projection Geometry Calculation for SVG
  // Base scale fitting
  const maxDim = Math.max(L, W, H);
  const scale = 160 / Math.max(maxDim, 60);

  const sxL = L * scale;
  const sxW = W * scale;
  const sxH = H * scale;

  // Isometric angles (30 degrees)
  const cos30 = Math.cos((30 * Math.PI) / 180);
  const sin30 = Math.sin((30 * Math.PI) / 180);

  // Center anchor
  const cx = 250;
  const cy = 200;

  // 3D vertices
  // Front Bottom Corner (P0)
  const p0 = { x: cx, y: cy + sxH / 2 };
  // Front Top Corner (P1)
  const p1 = { x: cx, y: cy - sxH / 2 };
  // Right Top Corner (P2)
  const p2 = { x: cx + sxL * cos30, y: p1.y - sxL * sin30 };
  // Right Bottom Corner (P3)
  const p3 = { x: cx + sxL * cos30, y: p0.y - sxL * sin30 };
  // Left Top Corner (P4)
  const p4 = { x: cx - sxW * cos30, y: p1.y - sxW * sin30 };
  // Left Bottom Corner (P5)
  const p5 = { x: cx - sxW * cos30, y: p0.y - sxW * sin30 };
  // Back Top Corner (P6)
  const p6 = { x: cx + (sxL - sxW) * cos30, y: p1.y - (sxL + sxW) * sin30 };
  // Top Open Flap Vertex
  const flapH = sxW * 0.7;
  const pFlap = { x: p6.x, y: p6.y - flapH };

  return (
    <div
      className={`bg-[#0f172a] text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                ไดอะแกรมโครงสร้างกล่อง & มิติขนาดจริง
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                CAD Blueprint
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {getCategoryLabel()} • ขนาด:{' '}
              <strong className="text-emerald-400">{L}</strong> ×{' '}
              <strong className="text-amber-400">{W}</strong> ×{' '}
              <strong className="text-cyan-400">{H}</strong> mm
            </p>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'blueprint'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>ภาพแปลน (Blueprint)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === '3d'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BoxIcon className="w-3.5 h-3.5" />
            <span>โมเดล 3D หมุนรอบ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dieline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dieline'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>แผ่นพิมพ์กางออก (Dieline)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>คำอธิบายสเปก</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: ISOMETRIC TECHNICAL BLUEPRINT WITH LABELS */}
      {activeTab === 'blueprint' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Blueprint SVG Stage */}
            <div className="lg:col-span-7 relative bg-[#070b14] rounded-2xl border border-slate-800 p-4 flex items-center justify-center min-h-[360px] overflow-hidden">
              
              {/* Background Technical Grid Pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Dynamic Proportional Scaled Isometric Box SVG */}
              <svg
                viewBox="0 0 500 400"
                className="w-full max-w-[460px] h-auto select-none drop-shadow-2xl"
              >
                <defs>
                  {/* Gradients for 3D Faces */}
                  <linearGradient id="topFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="rightFaceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="leftFaceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>

                  {/* Marker Arrows */}
                  <marker
                    id="arrowEmerald"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                  <marker
                    id="arrowAmber"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                  <marker
                    id="arrowCyan"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                  </marker>
                </defs>

                {/* Ground Ellipse Shadow */}
                <ellipse
                  cx={cx}
                  cy={p0.y + 15}
                  rx={sxL * cos30 + sxW * cos30 + 15}
                  ry={22}
                  fill="rgba(0, 0, 0, 0.45)"
                />

                {/* Top Flap Opened Polygon */}
                <polygon
                  points={`${p6.x},${p6.y} ${p4.x},${p4.y} ${p4.x},${pFlap.y} ${pFlap.x},${pFlap.y}`}
                  fill="#475569"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  opacity="0.85"
                />

                {/* 1. TOP FACE (P1 -> P2 -> P6 -> P4) */}
                <polygon
                  points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p6.x},${p6.y} ${p4.x},${p4.y}`}
                  fill="url(#topFaceGrad)"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />

                {/* 2. RIGHT FACE - Front/Length (P0 -> P1 -> P2 -> P3) */}
                <polygon
                  points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                  fill="url(#rightFaceGrad)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* 3. LEFT FACE - Side/Width (P0 -> P1 -> P4 -> P5) */}
                <polygon
                  points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p4.x},${p4.y} ${p5.x},${p5.y}`}
                  fill="url(#leftFaceGrad)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* Inner Crease & Fold Lines */}
                <line
                  x1={p0.x}
                  y1={p0.y}
                  x2={p1.x}
                  y2={p1.y}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* DIMENSION 1: LENGTH (L) - Green Dimension Line on Right Front */}
                <g>
                  {/* Dimension offset line */}
                  <line
                    x1={p0.x + 8 * sin30}
                    y1={p0.y + 8 * cos30 + 16}
                    x2={p3.x + 8 * sin30}
                    y2={p3.y + 8 * cos30 + 16}
                    stroke="#10b981"
                    strokeWidth="2"
                    markerStart="url(#arrowEmerald)"
                    markerEnd="url(#arrowEmerald)"
                  />
                  {/* Extension guidelines */}
                  <line
                    x1={p0.x}
                    y1={p0.y + 2}
                    x2={p0.x + 8 * sin30}
                    y2={p0.y + 8 * cos30 + 22}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  <line
                    x1={p3.x}
                    y1={p3.y + 2}
                    x2={p3.x + 8 * sin30}
                    y2={p3.y + 8 * cos30 + 22}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  {/* Length Label Badge */}
                  <rect
                    x={(p0.x + p3.x) / 2 - 40}
                    y={(p0.y + p3.y) / 2 + 18}
                    width="80"
                    height="24"
                    rx="6"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text
                    x={(p0.x + p3.x) / 2}
                    y={(p0.y + p3.y) / 2 + 34}
                    fill="#34d399"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    L: {L} mm
                  </text>
                </g>

                {/* DIMENSION 2: WIDTH (W) - Amber Dimension Line on Left Side */}
                <g>
                  <line
                    x1={p5.x - 8 * sin30}
                    y1={p5.y + 8 * cos30 + 16}
                    x2={p0.x - 8 * sin30}
                    y2={p0.y + 8 * cos30 + 16}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    markerStart="url(#arrowAmber)"
                    markerEnd="url(#arrowAmber)"
                  />
                  <line
                    x1={p5.x}
                    y1={p5.y + 2}
                    x2={p5.x - 8 * sin30}
                    y2={p5.y + 8 * cos30 + 22}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  <line
                    x1={p0.x}
                    y1={p0.y + 2}
                    x2={p0.x - 8 * sin30}
                    y2={p0.y + 8 * cos30 + 22}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  {/* Width Label Badge */}
                  <rect
                    x={(p5.x + p0.x) / 2 - 40}
                    y={(p5.y + p0.y) / 2 + 18}
                    width="80"
                    height="24"
                    rx="6"
                    fill="#78350f"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <text
                    x={(p5.x + p0.x) / 2}
                    y={(p5.y + p0.y) / 2 + 34}
                    fill="#fbbf24"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    W: {W} mm
                  </text>
                </g>

                {/* DIMENSION 3: HEIGHT (H) - Cyan Dimension Line on Right Corner */}
                <g>
                  <line
                    x1={p2.x + 24}
                    y1={p2.y}
                    x2={p3.x + 24}
                    y2={p3.y}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    markerStart="url(#arrowCyan)"
                    markerEnd="url(#arrowCyan)"
                  />
                  <line
                    x1={p2.x + 3}
                    y1={p2.y}
                    x2={p2.x + 30}
                    y2={p2.y}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  <line
                    x1={p3.x + 3}
                    y1={p3.y}
                    x2={p3.x + 30}
                    y2={p3.y}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  {/* Height Label Badge */}
                  <rect
                    x={p2.x + 32}
                    y={(p2.y + p3.y) / 2 - 12}
                    width="82"
                    height="24"
                    rx="6"
                    fill="#082f49"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={p2.x + 73}
                    y={(p2.y + p3.y) / 2 + 4}
                    fill="#7dd3fc"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    H: {H} mm
                  </text>
                </g>

                {/* Box Face Text Stamp */}
                <text
                  x={(p0.x + p1.x + p2.x + p3.x) / 4}
                  y={(p0.y + p1.y + p2.y + p3.y) / 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  ด้านหน้า (FRONT)
                </text>
              </svg>

              {/* Floating Quick Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>อัตราส่วนแม่แบบไดคัทจริง (1:1 Proportional)</span>
              </div>
            </div>

            {/* Right Detailed Dimension Engineering Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  คำอธิบายมิติกล่อง (Box Dimensions Breakdown)
                </span>
                <h4 className="text-lg font-black text-white">
                  {boxName} ({L} × {W} × {H} มม.)
                </h4>
                <p className="text-xs text-slate-400">
                  ระบุมิติภายนอกกล่องเมื่อพับและขัดก้นสำเร็จตามมาตรฐานงานพิมพ์กล่องบรรจุภัณฑ์
                </p>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-[#0b0f19] rounded-xl border border-emerald-500/30 space-y-0.5">
                  <div className="text-[10px] text-emerald-400 font-bold">ความยาว (L)</div>
                  <div className="text-base font-black text-white font-mono">{L} mm</div>
                  <div className="text-[10px] text-slate-500">{(L / 10).toFixed(1)} cm</div>
                </div>

                <div className="p-3 bg-[#0b0f19] rounded-xl border border-amber-500/30 space-y-0.5">
                  <div className="text-[10px] text-amber-400 font-bold">ความกว้าง (W)</div>
                  <div className="text-base font-black text-white font-mono">{W} mm</div>
                  <div className="text-[10px] text-slate-500">{(W / 10).toFixed(1)} cm</div>
                </div>

                <div className="p-3 bg-[#0b0f19] rounded-xl border border-cyan-500/30 space-y-0.5">
                  <div className="text-[10px] text-cyan-400 font-bold">ความสูง (H)</div>
                  <div className="text-base font-black text-white font-mono">{H} mm</div>
                  <div className="text-[10px] text-slate-500">{(H / 10).toFixed(1)} cm</div>
                </div>
              </div>

              {/* Key Packaging Capabilities */}
              <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                    ความจุภายใน (Capacity):
                  </span>
                  <strong className="text-white font-mono">
                    {volumeCc.toLocaleString()} cc ({volumeLiters} ลิตร)
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    ขนาดกางแผ่นพิมพ์ (Dieline Spread):
                  </span>
                  <strong className="text-blue-300 font-mono">
                    {flatWidthMm} × {flatHeightMm} mm
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    ความหนากระดาษแนะนำ:
                  </span>
                  <strong className="text-amber-300 font-mono">{recommendedGsm}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                    น้ำหนักบรรจุที่แนะนำ:
                  </span>
                  <strong className="text-emerald-400">{loadCapacity}</strong>
                </div>
              </div>

              {/* Suitable Products Note */}
              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">สินค้าที่เหมาะสมกับกล่องขนาดนี้:</strong>
                  <p className="text-[11px] text-blue-300/90 leading-relaxed">{suitableItems}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 3D REALISTIC INTERACTIVE STUDIO */}
      {activeTab === '3d' && (
        <div className="p-4 sm:p-6 space-y-4">
          <Box3DViewer
            dimensions={dimensions}
            category={category}
            paper={paper}
            finishing={finishing}
            boxName={boxName}
          />
        </div>
      )}

      {/* TAB CONTENT 3: FLAT DIELINE SPREAD BLUEPRINT */}
      {activeTab === 'dieline' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="bg-[#070b14] rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>แปลนแผ่นพิมพ์คลี่กางออก (Dieline Flat Layout)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  แสดงพื้นที่และรอยตัด-รอยพับสำหรับทำบล็อกไดคัท (Die-cut Block)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">ขนาดแผ่นกางพิมพ์สุทธิ:</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {flatWidthMm} mm × {flatHeightMm} mm ({flatAreaSqM} ตร.ม.)
                </span>
              </div>
            </div>

            {/* Dieline 2D Schematic */}
            <div className="relative border border-slate-800 rounded-xl p-4 bg-[#0a0f1d] flex flex-col items-center justify-center min-h-[220px]">
              <svg viewBox="0 0 540 220" className="w-full max-w-lg h-auto">
                {/* 4 Main Body Panels */}
                {/* 1. Glue Flap */}
                <rect
                  x="20"
                  y="60"
                  width="20"
                  height="100"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="30" y="115" fill="#94a3b8" fontSize="8" textAnchor="middle">
                  ลิ้นกาว 15mm
                </text>

                {/* 2. Side Panel 1 (Width W) */}
                <rect
                  x="40"
                  y="60"
                  width="80"
                  height="100"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="80" y="115" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ด้านข้าง (W) {W}mm
                </text>

                {/* 3. Front Panel (Length L) */}
                <rect
                  x="120"
                  y="60"
                  width="140"
                  height="100"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="190" y="115" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
                  ด้านหน้า (L) {L}mm
                </text>

                {/* Top Tuck Flap on Front */}
                <path
                  d="M 120 60 L 130 20 Q 190 10 250 20 L 260 60 Z"
                  fill="#334155"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="190" y="42" fill="#7dd3fc" fontSize="9" textAnchor="middle">
                  ฝาเสียบบน (Top Tuck)
                </text>

                {/* 4. Side Panel 2 (Width W) */}
                <rect
                  x="260"
                  y="60"
                  width="80"
                  height="100"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="300" y="115" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ด้านข้าง (W) {W}mm
                </text>

                {/* 5. Back Panel (Length L) */}
                <rect
                  x="340"
                  y="60"
                  width="140"
                  height="100"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="410" y="115" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
                  ด้านหลัง (L) {L}mm
                </text>

                {/* Bottom Closure Flaps */}
                <path
                  d="M 120 160 L 130 200 Q 190 210 250 200 L 260 160 Z"
                  fill="#334155"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="190" y="188" fill="#7dd3fc" fontSize="9" textAnchor="middle">
                  ก้นขัด/เสียบล่าง (Bottom Lock)
                </text>

                {/* Crease dashed fold lines */}
                <line x1="40" y1="60" x2="40" y2="160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="120" y1="60" x2="120" y2="160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="260" y1="60" x2="260" y2="160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="340" y1="60" x2="340" y2="160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="60" x2="480" y2="60" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="160" x2="480" y2="160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">สูตรคำนวณหน้ากว้างแผ่นกาง:</strong>
                <p className="text-slate-400 font-mono">
                  Width Spread = (L + W) × 2 + ลิ้นกาว ({glueFlapMm}mm) = {flatWidthMm} mm
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">สูตรคำนวณความสูงแผ่นกาง:</strong>
                <p className="text-slate-400 font-mono">
                  Height Spread = H + ฝาบน ({topFlapMm}mm) + ก้นล่าง ({bottomFlapMm}mm) = {flatHeightMm} mm
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PACKAGING ANATOMY GUIDE */}
      {activeTab === 'guide' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>การวัดขนาดกล่องที่ถูกต้อง (Dimension Standard)</span>
              </h5>
              <p className="text-slate-300 leading-relaxed">
                การวัดขนาดกล่องในอุตสาหกรรมพิมพ์จะใช้ลำดับ{' '}
                <strong className="text-amber-400">ยาว (L) × กว้าง (W) × สูง (H)</strong> เสมอ โดยวัดจากมิติภายในกล่อง (Internal Dimensions)
                เพื่อให้สินค้าบรรจุได้พอดี ไม่คับหรือหลวมจนเกินไป
              </p>
            </div>

            <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>ส่วนประกอบโครงสร้างกล่องพับ (Carton Anatomy)</span>
              </h5>
              <ul className="text-slate-300 space-y-1.5">
                <li>• <strong>ฝาเสียบ (Tuck Flap):</strong> ฝาบนสำหรับเปิด-ปิดหยิบสินค้า</li>
                <li>• <strong>ลิ้นกาว (Glue Tab):</strong> แถบกว้าง 12-15 mm สำหรับทากาวประกบตัวกล่อง</li>
                <li>• <strong>ปีกกันฝุ่น (Dust Flaps):</strong> ปีกเล็กๆ 2 ข้าง ช่วยป้องกันฝุ่นและเพิ่มความแข็งแรง</li>
                <li>• <strong>ก้นกล่อง (Bottom):</strong> ก้นขัด (Snap Lock) หรือ ก้นล็อกออโต้ (Auto-Lock)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-4">
          <span>
            มิติกางแผ่น: <strong className="text-emerald-400">{flatWidthMm} × {flatHeightMm} mm</strong>
          </span>
          <span>
            ความจุ: <strong className="text-amber-400">{volumeCc} cc</strong>
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          * อัตราส่วนและรอยพับคำนวณตามสูตรบล็อกไดคัทมาตรฐานโรงพิมพ์
        </div>
      </div>
    </div>
  );
};

export default BoxDiagramWithSpecs;

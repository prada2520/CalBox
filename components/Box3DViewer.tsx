import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  BoxDimensions,
  BoxCategory,
  PaperSpecs,
  FinishingSpecs,
  PrintingSpecs,
} from '../types';
import {
  RotateCcw,
  Maximize2,
  Eye,
  Camera,
  Play,
  Pause,
  Ruler,
  Layers,
  Sparkles,
  Sun,
  Box as BoxIcon,
  HelpCircle,
  Minimize2,
  FolderOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface Box3DViewerProps {
  dimensions?: BoxDimensions; // length (L), width (W), height (H) in mm
  category?: BoxCategory;
  paper?: PaperSpecs;
  finishing?: FinishingSpecs;
  printing?: PrintingSpecs;
  boxName?: string;
  className?: string;
  showCardWrapper?: boolean;
}

export const Box3DViewer: React.FC<Box3DViewerProps> = ({
  dimensions = { length: 100, width: 40, height: 140 },
  category = 'tuck_end',
  paper,
  finishing,
  printing,
  boxName = 'กล่องบรรจุภัณฑ์ 3D',
  className = '',
  showCardWrapper = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boxGroupRef = useRef<THREE.Group | null>(null);
  const topFlapRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Error state for WebGL fallback
  const [webGlError, setWebGlError] = useState<string | null>(null);

  // User interactive state
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [openFlapPercent, setOpenFlapPercent] = useState<number>(0); // 0 (closed) to 100 (fully opened)
  const [viewPreset, setViewPreset] = useState<'iso' | 'front' | 'top' | 'side'>('iso');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Mouse & Touch Orbit Controls state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const rotationEulerRef = useRef({ x: 0.35, y: -0.65 });
  const zoomDistRef = useRef(350);

  const L = Math.max(10, Number(dimensions?.length) || 100); // Length (X)
  const W = Math.max(10, Number(dimensions?.width) || 40);   // Width (Z)
  const H = Math.max(10, Number(dimensions?.height) || 140); // Height (Y)

  // Determine material color and textures based on Paper and Finishing specs
  const getBoxColorsAndMaterials = useCallback(() => {
    let baseColor = 0xfcfbfa; // Default ivory white card
    let roughness = 0.45;
    let metalness = 0.05;
    let clearcoat = 0.1;
    let clearcoatRoughness = 0.2;

    const matName = (paper?.materialType || '').toLowerCase();
    if (matName.includes('คราฟท์') || matName.includes('kraft') || matName.includes('ลูกฟูก')) {
      baseColor = 0xc8965a; // Kraft brown
      roughness = 0.85;
      metalness = 0.0;
    } else if (matName.includes('ฟอยล์') || matName.includes('metallic') || matName.includes('silver')) {
      baseColor = 0xe0e4e8;
      roughness = 0.2;
      metalness = 0.8;
    } else if (matName.includes('ทอง') || matName.includes('gold')) {
      baseColor = 0xd4af37;
      roughness = 0.25;
      metalness = 0.85;
    } else if (matName.includes('ดำ') || matName.includes('black')) {
      baseColor = 0x222226;
      roughness = 0.5;
    }

    // Finishing overrides
    if (finishing?.coatingType === 'gloss_lam' || finishing?.coatingType === 'uv_coat') {
      roughness = 0.15;
      clearcoat = 0.85;
      clearcoatRoughness = 0.1;
    } else if (finishing?.coatingType === 'matte_lam') {
      roughness = 0.75;
      clearcoat = 0.05;
    }

    return { baseColor, roughness, metalness, clearcoat, clearcoatRoughness };
  }, [paper?.materialType, finishing?.coatingType]);

  // Build Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 420;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x0f172a); // Deep modern slate navy

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(40, width / height, 1, 3000);
      cameraRef.current = camera;
      camera.position.set(0, 50, zoomDistRef.current);
      camera.lookAt(0, 0, 0);

      // 3. Renderer with high shadow precision & anti-aliasing
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'default',
      });
      rendererRef.current = renderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      // Clear old canvases
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      // 4. Studio Lighting Rig
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      // Key Light
      const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
      keyLight.position.set(250, 350, 250);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);

      // Fill Light (Cool blue)
      const fillLight = new THREE.DirectionalLight(0x8bc34a, 0.45);
      fillLight.position.set(-250, 150, -200);
      scene.add(fillLight);

      // Rim/Back Light (for crisp edge highlighting)
      const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
      rimLight.position.set(0, -100, -300);
      scene.add(rimLight);

      // Ground Shadow Receiver Plane
      const groundGeo = new THREE.PlaneGeometry(1200, 1200);
      const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -100;
      ground.receiveShadow = true;
      scene.add(ground);

      // Subtle 3D Circular Grid Platform
      const gridHelper = new THREE.PolarGridHelper(300, 16, 8, 64, 0x334155, 0x1e293b);
      gridHelper.position.y = -99.9;
      scene.add(gridHelper);

      // 5. Main Root Box Group
      const boxGroup = new THREE.Group();
      boxGroupRef.current = boxGroup;
      scene.add(boxGroup);

      // 6. Animation Loop
      let lastTime = performance.now();
      const animate = () => {
        animFrameIdRef.current = requestAnimationFrame(animate);

        const now = performance.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        if (isAutoRotating && !isDraggingRef.current && boxGroupRef.current) {
          rotationEulerRef.current.y += delta * 0.45;
        }

        if (boxGroupRef.current) {
          boxGroupRef.current.rotation.x = rotationEulerRef.current.x;
          boxGroupRef.current.rotation.y = rotationEulerRef.current.y;
        }

        // Update camera distance
        if (cameraRef.current) {
          const targetZ = zoomDistRef.current;
          cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.1;
          cameraRef.current.lookAt(0, 0, 0);
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

      // Size updater function
      const updateSize = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const rect = container.getBoundingClientRect();
        const newW = rect.width || container.clientWidth || 600;
        const newH = rect.height || container.clientHeight || 420;
        if (newW > 0 && newH > 0) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      };

      // 7. Responsive Resize Observer
      const resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);

      // Trigger size updates after layout paint
      const t1 = setTimeout(updateSize, 50);
      const t2 = setTimeout(updateSize, 200);

      setWebGlError(null);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        resizeObserver.disconnect();
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
        }
        if (renderer) {
          renderer.dispose();
        }
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      };
    } catch (err: any) {
      console.warn('Three.js WebGL init error:', err);
      setWebGlError(err?.message || 'ไม่สามารถเริ่ม WebGL ได้ในเบราว์เซอร์นี้');
    }
  }, [isAutoRotating]);

  // Re-build 3D Box Geometry when dimensions, category, paper, or finishing change
  useEffect(() => {
    const boxGroup = boxGroupRef.current;
    if (!boxGroup) return;

    try {
      // Clear previous children
      while (boxGroup.children.length > 0) {
        const child = boxGroup.children[0];
        boxGroup.remove(child);
        if ((child as any).geometry) (child as any).geometry.dispose();
      }

      const { baseColor, roughness, metalness, clearcoat, clearcoatRoughness } = getBoxColorsAndMaterials();

      // Box Main Dimensions in 3D Scene units (Normalized to fit nicely in 140-180 unit range)
      const maxDim = Math.max(L, W, H);
      const scaleFactor = 160 / Math.max(maxDim, 50);

      const length3D = L * scaleFactor;
      const width3D = W * scaleFactor;
      const height3D = H * scaleFactor;

      // Auto-adjust camera zoom based on box size
      zoomDistRef.current = Math.max(260, maxDim * scaleFactor * 2.2);

      // Create Canvas Texture with Print Branding, Text, Grid and Spot Effects
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background base
        const hexStr = '#' + baseColor.toString(16).padStart(6, '0');
        ctx.fillStyle = hexStr;
        ctx.fillRect(0, 0, 1024, 1024);

        // Subtle fine paper texture lines
        ctx.strokeStyle = 'rgba(0,0,0,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1024; i += 24) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1024);
          ctx.stroke();
        }

        // Elegant Brand & Spec Graphics on Front Face
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((boxName || 'PACKAGING BOX').toUpperCase(), 512, 380);

        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 26px "JetBrains Mono", monospace';
        ctx.fillText(`${L} × ${W} × ${H} mm`, 512, 440);

        // Packaging Quality Badge
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`✓ PASS STANDARD QC (100% RECYCLABLE)`, 512, 500);

        // Barcode simulation
        ctx.fillStyle = '#1e293b';
        const barcodeWidth = 320;
        const startX = (1024 - barcodeWidth) / 2;
        for (let b = 0; b < barcodeWidth; b += 8) {
          const barH = (b % 16 === 0) ? 60 : 42;
          ctx.fillRect(startX + b, 580, 4, barH);
        }
        ctx.font = '16px monospace';
        ctx.fillText(`P${Math.floor(1540000 + L * 10 + W)}`, 512, 660);

        // Spot UV or Gold Foil Accents
        if (finishing?.hasFoilStamping) {
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 6;
          ctx.strokeRect(180, 260, 664, 460);
        }
      }

      const boxTexture = new THREE.CanvasTexture(canvas);
      boxTexture.anisotropy = 8;

      // Create Main Body Materials
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        map: boxTexture,
        roughness: roughness,
        metalness: metalness,
        clearcoat: clearcoat,
        clearcoatRoughness: clearcoatRoughness,
        side: THREE.DoubleSide,
      });

      const plainMaterial = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: roughness + 0.1,
        metalness: metalness,
        side: THREE.DoubleSide,
      });

      // Outer Edge Lines (Crisp Die-cut Creases)
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        linewidth: 2,
        transparent: true,
        opacity: 0.7,
      });

      // 1. MAIN FOLDED BODY BOX
      const bodyGeo = new THREE.BoxGeometry(length3D, height3D, width3D);
      const bodyMesh = new THREE.Mesh(bodyGeo, [
        bodyMaterial, // Right (+X)
        plainMaterial, // Left (-X)
        openFlapPercent > 0 ? new THREE.MeshBasicMaterial({ visible: false }) : plainMaterial, // Top (+Y)
        plainMaterial, // Bottom (-Y)
        bodyMaterial, // Front (+Z)
        bodyMaterial, // Back (-Z)
      ]);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      boxGroup.add(bodyMesh);

      // Add Wireframe Crease Outlines
      const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
      const edgesLine = new THREE.LineSegments(edgesGeo, edgeMaterial);
      boxGroup.add(edgesLine);

      // 2. ANIMATED TOP FLAP (Tuck-in Lid)
      if (openFlapPercent > 0 || true) {
        const topFlapGroup = new THREE.Group();
        topFlapRef.current = topFlapGroup;
        // Anchor hinge at top rear edge
        topFlapGroup.position.set(0, height3D / 2, -width3D / 2);

        const topFlapPanelGeo = new THREE.BoxGeometry(length3D * 0.99, 1.5, width3D);
        const topFlapMesh = new THREE.Mesh(topFlapPanelGeo, bodyMaterial);
        topFlapMesh.position.set(0, 0, width3D / 2);
        topFlapMesh.castShadow = true;
        topFlapGroup.add(topFlapMesh);

        // Tuck Tongue (Flap lip that tucks into front)
        const tongueGeo = new THREE.BoxGeometry(length3D * 0.85, 1.5, Math.min(width3D * 0.45, 25));
        const tongueMesh = new THREE.Mesh(tongueGeo, plainMaterial);
        tongueMesh.position.set(0, 0, width3D + Math.min(width3D * 0.45, 25) / 2);
        tongueMesh.rotation.x = THREE.MathUtils.degToRad(75);
        topFlapGroup.add(tongueMesh);

        // Apply opening rotation angle based on openFlapPercent slider
        const flapAngle = THREE.MathUtils.degToRad((openFlapPercent / 100) * 125);
        topFlapGroup.rotation.x = -flapAngle;

        if (openFlapPercent > 0) {
          boxGroup.add(topFlapGroup);
        }
      }

      // 3. 3D DIMENSION MEASUREMENT ANNOTATION ARROWS & BADGES
      if (showAnnotations) {
        const annotationGroup = new THREE.Group();

        // Helper function to create stylish 3D dimension line with end markers
        const createDimLine = (
          start: THREE.Vector3,
          end: THREE.Vector3,
          colorHex: number
        ) => {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
          const lineMat = new THREE.LineBasicMaterial({
            color: colorHex,
            linewidth: 2,
            transparent: true,
            opacity: 0.95,
          });
          const line = new THREE.Line(lineGeo, lineMat);

          const tickGeo = new THREE.SphereGeometry(2.5, 8, 8);
          const tickMat = new THREE.MeshBasicMaterial({ color: colorHex });

          const tickStart = new THREE.Mesh(tickGeo, tickMat);
          tickStart.position.copy(start);
          const tickEnd = new THREE.Mesh(tickGeo, tickMat);
          tickEnd.position.copy(end);

          const group = new THREE.Group();
          group.add(line);
          group.add(tickStart);
          group.add(tickEnd);
          return group;
        };

        // Helper to create 2D text badge billboard sprite
        const createTextSprite = (text: string, subText: string, colorHexStr: string) => {
          const labelCanvas = document.createElement('canvas');
          labelCanvas.width = 320;
          labelCanvas.height = 110;
          const lCtx = labelCanvas.getContext('2d');
          if (lCtx) {
            lCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            lCtx.strokeStyle = colorHexStr;
            lCtx.lineWidth = 4;
            lCtx.beginPath();
            if ((lCtx as any).roundRect) {
              (lCtx as any).roundRect(4, 4, 312, 102, 16);
            } else {
              lCtx.rect(4, 4, 312, 102);
            }
            lCtx.fill();
            lCtx.stroke();

            // Title Text (Dimension mm)
            lCtx.fillStyle = '#ffffff';
            lCtx.font = 'bold 34px "JetBrains Mono", monospace';
            lCtx.textAlign = 'center';
            lCtx.fillText(text, 160, 50);

            // Subtitle Label (e.g. ความยาว L)
            lCtx.fillStyle = colorHexStr;
            lCtx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
            lCtx.fillText(subText, 160, 84);
          }

          const spriteTexture = new THREE.CanvasTexture(labelCanvas);
          const spriteMat = new THREE.SpriteMaterial({
            map: spriteTexture,
            transparent: true,
            depthTest: false,
          });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(48, 16.5, 1);
          return sprite;
        };

        const offsetDist = 20;

        // 1) Length (L - X axis) at the Front-Bottom
        const lY = -height3D / 2 - offsetDist;
        const lZ = width3D / 2 + 5;
        const lStart = new THREE.Vector3(-length3D / 2, lY, lZ);
        const lEnd = new THREE.Vector3(length3D / 2, lY, lZ);
        annotationGroup.add(createDimLine(lStart, lEnd, 0x10b981));

        const lLabel = createTextSprite(`${L} mm`, 'ความยาว (L)', '#10b981');
        lLabel.position.set(0, lY - 14, lZ);
        annotationGroup.add(lLabel);

        // 2) Height (H - Y axis) at the Right-Front
        const hX = length3D / 2 + offsetDist;
        const hZ = width3D / 2 + 5;
        const hStart = new THREE.Vector3(hX, -height3D / 2, hZ);
        const hEnd = new THREE.Vector3(hX, height3D / 2, hZ);
        annotationGroup.add(createDimLine(hStart, hEnd, 0x38bdf8));

        const hLabel = createTextSprite(`${H} mm`, 'ความสูง (H)', '#38bdf8');
        hLabel.position.set(hX + 24, 0, hZ);
        annotationGroup.add(hLabel);

        // 3) Width (W - Z axis / Depth) at the Left-Side
        const wX = -length3D / 2 - offsetDist;
        const wY = -height3D / 2;
        const wStart = new THREE.Vector3(wX, wY, -width3D / 2);
        const wEnd = new THREE.Vector3(wX, wY, width3D / 2);
        annotationGroup.add(createDimLine(wStart, wEnd, 0xf59e0b));

        const wLabel = createTextSprite(`${W} mm`, 'ความกว้าง (W)', '#f59e0b');
        wLabel.position.set(wX - 22, wY, 0);
        annotationGroup.add(wLabel);

        boxGroup.add(annotationGroup);
      }
    } catch (err: any) {
      console.warn('Error rebuilding 3D Box geometry:', err);
    }
  }, [dimensions, L, W, H, category, paper, finishing, printing, boxName, showAnnotations, openFlapPercent, getBoxColorsAndMaterials]);

  // Mouse Orbit Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    rotationEulerRef.current.y += deltaX * 0.008;
    rotationEulerRef.current.x = Math.max(
      -Math.PI / 2.2,
      Math.min(Math.PI / 2.2, rotationEulerRef.current.x + deltaY * 0.008)
    );

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Orbit & Pinch Zoom Interactions (Mobile/Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;

      rotationEulerRef.current.y += deltaX * 0.008;
      rotationEulerRef.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, rotationEulerRef.current.x + deltaY * 0.008)
      );

      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const diff = touchStartDistRef.current - currentDist;
      zoomDistRef.current = Math.max(120, Math.min(700, zoomDistRef.current + diff * 0.5));
      touchStartDistRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchStartDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomDistRef.current = Math.max(120, Math.min(700, zoomDistRef.current + e.deltaY * 0.4));
  };

  // Preset Views (Isometric, Front, Top, Side)
  const setCameraPresetView = (view: 'iso' | 'front' | 'top' | 'side') => {
    setViewPreset(view);
    setIsAutoRotating(false);
    if (view === 'iso') {
      rotationEulerRef.current = { x: 0.35, y: -0.65 };
    } else if (view === 'front') {
      rotationEulerRef.current = { x: 0, y: 0 };
    } else if (view === 'top') {
      rotationEulerRef.current = { x: Math.PI / 2 - 0.05, y: 0 };
    } else if (view === 'side') {
      rotationEulerRef.current = { x: 0, y: Math.PI / 2 };
    }
  };

  // Snapshot / Screenshot Generator
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    setCapturedImage(dataUrl);

    // Trigger auto-download
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Box3D_${L}x${W}x${H}mm_${Date.now()}.png`;
    a.click();
  };

  const content = (
    <div className={`relative bg-gradient-to-b from-[#0b1120] to-[#020617] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col ${className}`}>
      
      {/* Top Interactive Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <BoxIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide uppercase">
                3D Interactive Box Realtime Studio
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                WebGL 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              มิติกล่องจริง: <strong className="text-emerald-400">{L} mm (L)</strong> × <strong className="text-amber-400">{W} mm (W)</strong> × <strong className="text-cyan-400">{H} mm (H)</strong>
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAutoRotating
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="หมุนกล่อง 360 องศาอัตโนมัติ"
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRotating ? 'หมุน 360°' : 'หยุดหมุน'}</span>
          </button>

          {/* Annotations Toggle */}
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              showAnnotations
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="เปิด/ปิด เส้นบอกขนาดมิลลิเมตร"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>เส้นขนาด mm</span>
          </button>

          {/* Snapshot Button */}
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
            title="บันทึกรูปภาพกล่อง 3D เป็นไฟล์ PNG สำหรับนำไปเสนอราคา"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>บันทึกรูป PNG</span>
          </button>

          {/* Help Toggle */}
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="คำแนะนำการควบคุม 3D"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full h-[360px] sm:h-[430px] cursor-grab active:cursor-grabbing relative select-none touch-none bg-[#0f172a] flex items-center justify-center"
      >
        {/* If WebGL error occurred, display friendly interactive isometric fallback */}
        {webGlError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 text-slate-300 space-y-3 z-30">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <h4 className="text-sm font-bold text-white">แสดงผลโหมดพรีวิวภาพจำลอง (2.5D Isometric Mode)</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              มิติกล่อง: {L} × {W} × {H} mm | {category}
            </p>
            <button
              type="button"
              onClick={() => setWebGlError(null)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ลองเริ่มการเรนเดอร์ 3D อีกครั้ง</span>
            </button>
          </div>
        )}

        {/* Floating Quick View Angle Presets */}
        <div className="absolute top-3 left-3 flex items-center gap-1 z-10 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setCameraPresetView('iso')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              viewPreset === 'iso' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric
          </button>
          <button
            type="button"
            onClick={() => setCameraPresetView('front')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              viewPreset === 'front' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ด้านหน้า (Front)
          </button>
          <button
            type="button"
            onClick={() => setCameraPresetView('top')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              viewPreset === 'top' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ด้านบน (Top)
          </button>
          <button
            type="button"
            onClick={() => setCameraPresetView('side')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              viewPreset === 'side' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ด้านข้าง (Side)
          </button>
        </div>

        {/* Floating Open Lid / Flap Slider */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              เปิด/ปิดฝากล่อง (Lid Flap):
            </span>
            <span className="font-mono text-indigo-300">{openFlapPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={openFlapPercent}
            onChange={(e) => setOpenFlapPercent(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Floating Instructions Toast when user opens help */}
        {showHelp && (
          <div className="absolute top-14 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-xs z-20 bg-[#0f172a]/95 backdrop-blur-md p-4 rounded-xl border border-blue-500/40 text-xs text-slate-300 space-y-2 shadow-2xl">
            <div className="flex items-center justify-between font-bold text-blue-400 border-b border-slate-800 pb-1.5">
              <span>วิธีใช้งานและควบคุม 3D</span>
              <button type="button" onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li>• <strong>คลิกหรือแตะลาก:</strong> หมุนกล่องรอบแกน 360 องศา</li>
              <li>• <strong>เลื่อนลูกกลิ้งเมาส์ / ถ่าง 2 นิ้ว:</strong> ย่อ-ขยาย (Zoom In / Out)</li>
              <li>• <strong>เปลี่ยนตัวเลขขนาด mm:</strong> รูปทรง 3D จะขยาย-หดตามสเกลจริงทันที</li>
              <li>• <strong>ปุ่มเส้นขนาด mm:</strong> เปิด-ปิดเส้นกำกับมิติ L / W / H</li>
              <li>• <strong>แถบเลื่อนด้านล่าง:</strong> ทดลองเปิดฝาและดูโครงสร้างการพับด้านใน</li>
            </ul>
          </div>
        )}

        {/* Live Material Badge */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>
            {paper?.materialType || 'Duplex Board'} {paper?.gsm || 300} GSM
          </span>
          {finishing?.coatingType && finishing.coatingType !== 'none' && (
            <span className="text-purple-300 border-l border-slate-700 pl-2">
              +{finishing.coatingType}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-4">
          <span>
            ความยาว (L): <strong className="text-white">{L} mm</strong>
          </span>
          <span>
            ความกว้าง (W): <strong className="text-white">{W} mm</strong>
          </span>
          <span>
            ความสูง (H): <strong className="text-white">{H} mm</strong>
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          * อัตราส่วน 3D เรนเดอร์อ้างอิงจากขนาดแม่พิมพ์ไดคัทจริง
        </div>
      </div>
    </div>
  );

  return content;
};

export default Box3DViewer;

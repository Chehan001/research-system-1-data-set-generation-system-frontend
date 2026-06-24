import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop as CropIcon, RotateCcw } from 'lucide-react';

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1',  value: 1 },
  { label: '4:3',  value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

const MIN_CROP = 20;

function defaultCrop(naturalW, naturalH) {
  const size = Math.round(Math.min(naturalW, naturalH) * 0.45);
  return {
    x: Math.round((naturalW - size) / 2),
    y: Math.round((naturalH - size) / 2),
    width: size,
    height: size,
  };
}

function clampCrop(crop, naturalW, naturalH, aspect) {
  let { x, y, width, height } = crop;

  if (aspect) {
    if (width / height > aspect) width = height * aspect;
    else height = width / aspect;
  }

  width  = Math.max(MIN_CROP, Math.min(width, naturalW));
  height = Math.max(MIN_CROP, Math.min(height, naturalH));

  if (aspect) {
    if (width / height > aspect) width = height * aspect;
    else height = width / aspect;
  }

  x = Math.max(0, Math.min(x, naturalW - width));
  y = Math.max(0, Math.min(y, naturalH - height));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

const CropImagePanel = ({ bestImage, imageWidth, imageHeight, onCrop, isAnalyzing }) => {
  const containerRef = useRef(null);
  const imgRef       = useRef(null);

  const [aspect, setAspect]       = useState(null);
  const [crop, setCrop]           = useState(null);
  const [displayRect, setDisplayRect] = useState(null);
  const [dragState, setDragState] = useState(null);

  const naturalW = imageWidth  || imgRef.current?.naturalWidth  || 640;
  const naturalH = imageHeight || imgRef.current?.naturalHeight || 480;

  const updateDisplayRect = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.complete) return;

    const cRect = container.getBoundingClientRect();
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    const scale = Math.min(cRect.width / nw, cRect.height / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    const offsetX = (cRect.width - dw) / 2;
    const offsetY = (cRect.height - dh) / 2;

    setDisplayRect({ scale, offsetX, offsetY, dw, dh });
  }, []);

  useEffect(() => {
    if (bestImage) {
      const w = imageWidth  || 640;
      const h = imageHeight || 480;
      setCrop(defaultCrop(w, h));
    }
  }, [bestImage, imageWidth, imageHeight]);

  useEffect(() => {
    updateDisplayRect();
    window.addEventListener('resize', updateDisplayRect);
    return () => window.removeEventListener('resize', updateDisplayRect);
  }, [updateDisplayRect, bestImage]);

  const toDisplay = (c) => {
    if (!displayRect || !c) return null;
    return {
      left:   displayRect.offsetX + c.x * displayRect.scale,
      top:    displayRect.offsetY + c.y * displayRect.scale,
      width:  c.width  * displayRect.scale,
      height: c.height * displayRect.scale,
    };
  };

  const toNatural = (clientX, clientY) => {
    const container = containerRef.current;
    if (!container || !displayRect) return { x: 0, y: 0 };
    const cRect = container.getBoundingClientRect();
    const x = (clientX - cRect.left - displayRect.offsetX) / displayRect.scale;
    const y = (clientY - cRect.top  - displayRect.offsetY) / displayRect.scale;
    return { x, y };
  };

  const handlePointerDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    if (!crop) return;
    const pt = toNatural(e.clientX, e.clientY);
    setDragState({ handle, startX: pt.x, startY: pt.y, startCrop: { ...crop } });
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragState || !crop) return;
    const pt = toNatural(e.clientX, e.clientY);
    const dx = pt.x - dragState.startX;
    const dy = pt.y - dragState.startY;
    const sc = dragState.startCrop;
    let next = { ...sc };

    switch (dragState.handle) {
      case 'move':
        next.x = sc.x + dx;
        next.y = sc.y + dy;
        break;
      case 'nw':
        next.x = sc.x + dx;
        next.y = sc.y + dy;
        next.width  = sc.width  - dx;
        next.height = sc.height - dy;
        break;
      case 'ne':
        next.y = sc.y + dy;
        next.width  = sc.width  + dx;
        next.height = sc.height - dy;
        break;
      case 'sw':
        next.x = sc.x + dx;
        next.width  = sc.width  - dx;
        next.height = sc.height + dy;
        break;
      case 'se':
        next.width  = sc.width  + dx;
        next.height = sc.height + dy;
        break;
      default:
        break;
    }

    setCrop(clampCrop(next, naturalW, naturalH, aspect));
  }, [dragState, crop, naturalW, naturalH, aspect]);

  const handlePointerUp = useCallback(() => setDragState(null), []);

  useEffect(() => {
    if (!dragState) return;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, handlePointerMove, handlePointerUp]);

  const handleReset = () => {
    setCrop(defaultCrop(naturalW, naturalH));
  };

  const handleAspectChange = (value) => {
    setAspect(value);
    if (crop) {
      setCrop(clampCrop(crop, naturalW, naturalH, value));
    }
  };

  const handleConfirmCrop = () => {
    if (!crop) return;
    onCrop(crop);
  };

  const disp = toDisplay(crop);
  const handles = ['nw', 'ne', 'sw', 'se'];

  return (
    <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-5 glow-border flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
        <span className="font-sans font-bold text-sm tracking-wide text-blue-500">Crop Image</span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-slate-950 rounded-lg overflow-hidden border border-slate-850 select-none"
      >
        {bestImage ? (
          <img
            ref={imgRef}
            src={bestImage}
            alt="Captured frame"
            className="w-full h-full object-contain pointer-events-none"
            onLoad={() => {
              updateDisplayRect();
              if (imgRef.current) {
                setCrop(defaultCrop(imgRef.current.naturalWidth, imgRef.current.naturalHeight));
              }
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
            Waiting for camera capture...
          </div>
        )}

        {disp && (
          <>
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <div
                className="absolute bg-black/60"
                style={{ left: 0, top: 0, right: 0, height: disp.top }}
              />
              <div
                className="absolute bg-black/60"
                style={{ left: 0, top: disp.top + disp.height, right: 0, bottom: 0 }}
              />
              <div
                className="absolute bg-black/60"
                style={{ left: 0, top: disp.top, width: disp.left, height: disp.height }}
              />
              <div
                className="absolute bg-black/60"
                style={{ left: disp.left + disp.width, top: disp.top, right: 0, height: disp.height }}
              />
            </div>

            <div
              className="absolute border-2 border-white cursor-move"
              style={{
                left: disp.left,
                top: disp.top,
                width: disp.width,
                height: disp.height,
                zIndex: 20,
              }}
              onPointerDown={(e) => handlePointerDown(e, 'move')}
            >
              {handles.map((h) => (
                <div
                  key={h}
                  className={`absolute w-3.5 h-3.5 bg-white border border-slate-600 shadow-md ${
                    h === 'nw' ? '-top-1.5 -left-1.5 cursor-nw-resize' :
                    h === 'ne' ? '-top-1.5 -right-1.5 cursor-ne-resize' :
                    h === 'sw' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' :
                                 '-bottom-1.5 -right-1.5 cursor-se-resize'
                  }`}
                  onPointerDown={(e) => handlePointerDown(e, h)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Aspect Ratio outline pills */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {ASPECT_RATIOS.map((ar) => (
          <button
            key={ar.label}
            type="button"
            disabled={!bestImage}
            onClick={() => handleAspectChange(ar.value)}
            className={`px-3.5 py-1.5 rounded-md text-[11px] font-sans font-semibold border transition-all cursor-pointer ${
              aspect === ar.value
                ? 'bg-blue-600/15 border-blue-500 text-blue-400'
                : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            } ${!bestImage ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {ar.label}
          </button>
        ))}
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={isAnalyzing || !bestImage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-800 bg-white text-slate-800 text-xs font-sans font-bold uppercase tracking-wide hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={handleConfirmCrop}
          disabled={isAnalyzing || !crop || !bestImage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CropIcon className="w-3.5 h-3.5" />
          {isAnalyzing ? 'Cropping…' : 'Crop'}
        </button>
      </div>
    </div>
  );
};

export default CropImagePanel;

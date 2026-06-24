import React, { useState, useRef } from 'react';
import { Copy, Check, Info } from 'lucide-react';

// RGB to LAB conversion helper
const rgbToLab = (R, G, B) => {
  let r = R / 255;
  let g = G / 255;
  let b = B / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  // D65 Standard Illuminant
  let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  x /= 95.047;
  y /= 100.0;
  z /= 108.883;

  const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  const l = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const b_lab = 200 * (fy - fz);

  return { l, a, b: b_lab };
};

// RGB to HSV (OpenCV scaled ranges) helper
const rgbToHsv = (R, G, B) => {
  const r = R / 255;
  const g = G / 255;
  const b = B / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 180),
    s: Math.round(s * 255),
    v: Math.round(v * 255),
  };
};

const ColorDetailsPanel = ({ analysisData, onColorChange }) => {
  const [copied, setCopied] = useState(false);
  const imgRef = useRef(null);

  if (!analysisData) {
    return (
      <div className="border border-dashed border-slate-800 bg-slate-950/20 rounded-xl p-5 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-850 text-slate-500 text-xs font-bold mb-3">3</span>
        <p className="text-slate-500 font-sans text-xs">
          3. Crop image to load color &amp; details
        </p>
      </div>
    );
  }

  const { roi_image, color_features } = analysisData;
  const hex   = color_features?.hex   ?? '#000000';
  const R     = color_features?.R     ?? 0;
  const G     = color_features?.G     ?? 0;
  const B     = color_features?.B     ?? 0;
  const L     = color_features?.L     ?? 0;
  const A     = color_features?.A     ?? 0;
  const B_lab = color_features?.B_lab ?? 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageClick = (e) => {
    const img = imgRef.current;
    if (!img || !img.complete) return;

    // Create a temporary canvas to extract pixel color
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    
    const x = Math.min(Math.max(0, Math.floor(clickX * scaleX)), img.naturalWidth - 1);
    const y = Math.min(Math.max(0, Math.floor(clickY * scaleY)), img.naturalHeight - 1);

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const rVal = pixel[0];
      const gVal = pixel[1];
      const bVal = pixel[2];

      const toHex = (c) => c.toString(16).padStart(2, '0').toUpperCase();
      const nextHex = `#${toHex(rVal)}${toHex(gVal)}${toHex(bVal)}`;

      const { l: lVal, a: aVal, b: bValLab } = rgbToLab(rVal, gVal, bVal);
      const { h: hVal, s: sVal, v: vVal } = rgbToHsv(rVal, gVal, bVal);

      // Trigger callback to App.jsx to update the analysis state
      if (onColorChange) {
        onColorChange({
          hex: nextHex,
          R: rVal,
          G: gVal,
          B: bVal,
          H: hVal,
          S: sVal,
          V: vVal,
          L: lVal,
          A: aVal,
          B_lab: bValLab,
        });
      }
    } catch (err) {
      console.error("Failed to extract color from canvas: ", err);
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-5 glow-border flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
        <span className="font-sans font-bold text-sm tracking-wide text-blue-500">Color &amp; Details</span>
      </div>

      <div className="space-y-4 flex-grow">
        {/* Cropped Image section */}
        <div>
          <p className="font-sans text-[11px] font-semibold text-slate-400 mb-1.5">Cropped Image</p>
          <div className="aspect-[2.2/1] w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative">
            {roi_image ? (
              <img
                ref={imgRef}
                src={roi_image}
                alt="Cropped region"
                className="w-full h-full object-cover cursor-crosshair"
                onClick={handleImageClick}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: hex }} />
            )}
          </div>
        </div>

        {/* Selected Color Section */}
        <div>
          <p className="font-sans text-[11px] font-semibold text-slate-400 mb-1.5">Selected Color</p>
          <div className="flex gap-3 items-center">
            {/* Color block */}
            <div
              className="w-10 h-10 rounded-lg border border-slate-800 flex-shrink-0"
              style={{ backgroundColor: hex }}
            />
            {/* White input-style HEX indicator */}
            <div className="flex-grow flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-850 shadow-sm">
              <span className="font-sans font-black text-sm tracking-widest">{hex}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                title="Copy HEX"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* RGB and LAB side-by-side metric cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* RGB */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block mb-2">RGB</span>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span>R:</span>
                <span className="font-bold">{Math.round(R)}</span>
              </div>
              <div className="flex justify-between">
                <span>G:</span>
                <span className="font-bold">{Math.round(G)}</span>
              </div>
              <div className="flex justify-between">
                <span>B:</span>
                <span className="font-bold">{Math.round(B)}</span>
              </div>
            </div>
          </div>

          {/* LAB */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block mb-2">LAB</span>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span>L:</span>
                <span className="font-bold">{L.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>a:</span>
                <span className="font-bold">{A.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>b:</span>
                <span className="font-bold">{B_lab.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2 p-2.5 bg-blue-950/10 border border-blue-900/20 rounded-lg">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-slate-400 leading-normal">
            Click on the image to select a different color. The values will update automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorDetailsPanel;

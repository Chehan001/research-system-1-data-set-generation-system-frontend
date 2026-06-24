import React, { useState } from 'react';
import { Copy, Check, BarChart2 } from 'lucide-react';

const ColorMetricsPanel = ({ colorMetrics }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!colorMetrics) {
    return (
      <div className="flex flex-col items-center justify-center border border-slate-800 bg-slate-900/40 rounded-xl p-8 min-h-[350px] relative overflow-hidden glow-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          <BarChart2 className="w-12 h-12 text-slate-700 animate-pulse mb-4" />
          <h3 className="font-display font-semibold text-slate-300 text-sm tracking-wider uppercase">
            Awaiting Color Metrics
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">
            Telemetry metrics (HEX, RGB, HSV, LAB) will populate here upon capture lock.
          </p>
        </div>
      </div>
    );
  }

  const { hex, rgb, hsv, lab } = colorMetrics;

  return (
    <div className="flex flex-col gap-5 border border-slate-800 bg-slate-900/40 rounded-xl p-5 relative overflow-hidden h-full glow-border">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          <h2 className="font-display font-bold text-sm tracking-wider text-slate-200">
            COLORIMETRIC COORDINATES
          </h2>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Live Color Swatch & HEX */}
        <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800/80 p-4 rounded-lg">
          <div
            className="w-16 h-16 rounded-md border border-slate-700 shadow-md flex-shrink-0"
            style={{ backgroundColor: hex || '#000000' }}
          />
          <div className="flex-grow min-w-0">
            <span className="block font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              HEX CHROMATICITY
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-display text-xl font-bold tracking-widest text-slate-100">
                {hex}
              </span>
              <button
                onClick={() => handleCopy(hex)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 active:scale-95 transition-all cursor-pointer"
                title="Copy HEX Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* RGB Coordinates */}
        <div className="bg-slate-950/20 border border-slate-800/60 p-3.5 rounded-lg">
          <span className="block font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2.5">
            RGB (Red, Green, Blue)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-rose-500 font-bold uppercase">R</span>
              <span className="text-sm font-semibold text-slate-200">{rgb?.r ?? 0}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-emerald-500 font-bold uppercase">G</span>
              <span className="text-sm font-semibold text-slate-200">{rgb?.g ?? 0}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-blue-500 font-bold uppercase">B</span>
              <span className="text-sm font-semibold text-slate-200">{rgb?.b ?? 0}</span>
            </div>
          </div>
        </div>

        {/* HSV Coordinates */}
        <div className="bg-slate-950/20 border border-slate-800/60 p-3.5 rounded-lg">
          <span className="block font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2.5">
            HSV (Hue, Saturation, Value)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-cyan-400 uppercase">H</span>
              <span className="text-sm font-semibold text-slate-200">{hsv?.h ?? 0}°</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-cyan-400 uppercase">S</span>
              <span className="text-sm font-semibold text-slate-200">{hsv?.s ?? 0}%</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-cyan-400 uppercase">V</span>
              <span className="text-sm font-semibold text-slate-200">{hsv?.v ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* LAB Coordinates */}
        <div className="bg-slate-950/20 border border-slate-800/60 p-3.5 rounded-lg">
          <span className="block font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2.5">
            CIE L*a*b* (Lightness, A, B)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-slate-400">L*</span>
              <span className="text-sm font-semibold text-slate-200">{lab?.l ?? 0}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-slate-400">a*</span>
              <span className="text-sm font-semibold text-slate-200">{lab?.a ?? 0}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded">
              <span className="block text-[10px] text-slate-400">b*</span>
              <span className="text-sm font-semibold text-slate-200">{lab?.b ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative calibration status */}
      <div className="mt-auto pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500 uppercase">
        <div className="flex justify-between">
          <span>Colorspace Ref:</span>
          <span>D65 / 10°</span>
        </div>
      </div>
    </div>
  );
};

export default ColorMetricsPanel;

import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Crosshair } from 'lucide-react';

const AnalysisPanel = ({ captureData }) => {
  if (!captureData) {
    return (
      <div className="flex flex-col items-center justify-center border border-slate-800 bg-slate-900/40 rounded-xl p-8 min-h-[350px] relative overflow-hidden glow-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          <Crosshair className="w-12 h-12 text-slate-700 animate-spin-slow mb-4" />
          <h3 className="font-display font-semibold text-slate-300 text-sm tracking-wider uppercase">
            Awaiting Capture Data
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">
            Trigger <strong className="text-cyan-400">Capture Image</strong> to shoot 10 frames,
            auto-select the sharpest, and display color analysis.
          </p>
        </div>
      </div>
    );
  }

  const { best_image, roi_preview, blur_score, quality_status, color_features, best_frame_index, blur_scores } = captureData;
  const isGoodQuality = quality_status?.toLowerCase().includes('good');
  const blurPercentage = Math.min(100, Math.max(0, (blur_score / 30) * 100));

  // Pull color values directly from color_features
  const hex    = color_features?.hex   ?? '#000000';
  const L      = color_features?.L     ?? 0;
  const A      = color_features?.A     ?? 0;
  const B_lab  = color_features?.B_lab ?? 0;
  const R      = color_features?.R     ?? 0;
  const G      = color_features?.G     ?? 0;
  const B      = color_features?.B     ?? 0;

  return (
    <div className="flex flex-col gap-5 border border-slate-800 bg-slate-900/40 rounded-xl p-5 relative overflow-hidden glow-border">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="font-display font-bold text-sm tracking-wider text-slate-200">
            FRAME DIAGNOSTIC ANALYSIS
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isGoodQuality ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              QUALITY OPTIMAL
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              {quality_status?.toUpperCase() || 'ADJUST OPTICS'}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Best Image */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Best Frame Selected (Frame {best_frame_index ?? '—'} of 10)
          </span>
          <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 scanline">
            {best_image ? (
              <img src={best_image} alt="Best captured frame" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                No image available
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded font-mono text-[9px] text-cyan-400 uppercase">
              Sharpest Frame Auto-Selected
            </div>
          </div>

          {/* Blur scores bar strip */}
          {blur_scores && blur_scores.length > 0 && (
            <div className="flex gap-1 mt-1">
              {blur_scores.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-full rounded-sm transition-all ${
                      i === best_frame_index
                        ? 'bg-cyan-500'
                        : 'bg-slate-700'
                    }`}
                    style={{ height: `${Math.max(4, Math.min(20, score / 5))}px` }}
                    title={`Frame ${i}: ${score.toFixed(1)}`}
                  />
                  <span className={`text-[8px] font-mono ${i === best_frame_index ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {i}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col: ROI + quality + color values */}
        <div className="flex flex-col justify-between gap-4">

          {/* ROI Preview */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Region of Interest (ROI)
            </span>
            <div className="relative w-full aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {roi_preview ? (
                <img src={roi_preview} alt="ROI crop" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-600 font-mono text-[10px]">No ROI</div>
              )}
              <div className="absolute bottom-2 left-2 right-2 px-1.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-center font-mono text-[9px] text-pink-400 uppercase">
                Sensor Crop
              </div>
            </div>
          </div>

          {/* Blur Quality */}
          <div className="flex flex-col gap-2 bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase">Blur Index:</span>
              <span className={`font-bold ${isGoodQuality ? 'text-emerald-400' : 'text-amber-400'}`}>
                {blur_score?.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isGoodQuality ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${blurPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 uppercase">
              <span>Blurry</span>
              <span>Sharp</span>
            </div>
          </div>

          {/* ── COLOR RESULTS — HEX + LAB displayed immediately ── */}
          <div className="flex flex-col gap-2 bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Color Analysis</span>

            {/* HEX Swatch */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-slate-700 flex-shrink-0"
                style={{ backgroundColor: hex }}
              />
              <div>
                <span className="block text-[9px] text-slate-500 uppercase">HEX</span>
                <span className="text-sm font-bold text-slate-100 tracking-widest">{hex}</span>
              </div>
            </div>

            {/* RGB row */}
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <span className="block text-rose-500 font-bold">R</span>
                <span className="text-slate-200">{Math.round(R)}</span>
              </div>
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <span className="block text-emerald-500 font-bold">G</span>
                <span className="text-slate-200">{Math.round(G)}</span>
              </div>
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <span className="block text-blue-500 font-bold">B</span>
                <span className="text-slate-200">{Math.round(B)}</span>
              </div>
            </div>

            {/* LAB row */}
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <span className="block text-slate-400 font-bold">L*</span>
                <span className="text-slate-200">{L.toFixed(1)}</span>
              </div>
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <span className="block text-slate-400 font-bold">a*</span>
                <span className="text-slate-200">{A.toFixed(1)}</span>
              </div>
              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                <span className="block text-slate-400 font-bold">b*</span>
                <span className="text-slate-200">{B_lab.toFixed(1)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
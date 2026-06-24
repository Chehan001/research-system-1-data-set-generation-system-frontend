import React from 'react';
import { Aperture, RotateCcw } from 'lucide-react';

const CaptureControls = ({ onCapture, onRetake, isCapturing, hasCaptured, captureProgress }) => {
  return (
    <div className="flex flex-col gap-3 p-4 border border-slate-800 bg-slate-900/40 rounded-xl glow-border">
      <h3 className="font-display font-bold text-xs tracking-wider text-slate-400 mb-1">
        FRAME CONTROLS
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Capture Button */}
        <button
          onClick={onCapture}
          disabled={isCapturing}
          className={`flex items-center justify-center gap-2 py-3 px-4 font-display font-bold text-xs tracking-widest uppercase rounded-lg border transition-all duration-200 cursor-pointer ${
            isCapturing
              ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-600 cursor-not-allowed'
              : 'bg-cyan-500/10 border-cyan-500/40 hover:bg-cyan-500/25 active:bg-cyan-500/30 text-cyan-400 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95'
          }`}
        >
          <Aperture className={`w-4 h-4 ${isCapturing ? 'animate-spin' : ''}`} />
          {isCapturing ? `Capturing ${captureProgress ?? ''}` : 'Capture Image'}
        </button>

        {/* Retake Button */}
        <button
          onClick={onRetake}
          disabled={!hasCaptured || isCapturing}
          className={`flex items-center justify-center gap-2 py-3 px-4 font-display font-bold text-xs tracking-widest uppercase rounded-lg border transition-all duration-200 cursor-pointer ${
            !hasCaptured || isCapturing
              ? 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed'
              : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Retake
        </button>
      </div>

      {/* Progress bar shown during capture */}
      {isCapturing && (
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 rounded-full animate-pulse w-full" />
        </div>
      )}

      {/* Telemetry/Instructions info */}
      <div className="text-[10px] font-mono text-slate-500 uppercase leading-normal">
        <div className="flex justify-between">
          <span>Frames per Capture:</span>
          <span className="text-cyan-400 font-bold">10</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Target Hold:</span>
          <span className={hasCaptured ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
            {hasCaptured ? 'LOCKED' : 'READY'}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Best Frame:</span>
          <span className={hasCaptured ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
            {hasCaptured ? 'SELECTED' : 'PENDING'}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Stabilization:</span>
          <span className="text-emerald-400">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default CaptureControls;
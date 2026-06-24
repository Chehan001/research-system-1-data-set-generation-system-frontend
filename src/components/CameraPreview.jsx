import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, SwitchCamera, Zap } from 'lucide-react';
import { getStreamUrl } from '../api';

const CameraPreview = ({ onCapture, isCapturing, captureProgress }) => {
  const [streamError, setStreamError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const streamUrl = `${getStreamUrl()}?key=${retryKey}`;

  const handleStreamError = () => {
    setStreamError(true);
  };

  const handleStreamLoad = () => {
    setStreamError(false);
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
    setStreamError(false);
  };

  return (
    <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-5 glow-border flex flex-col h-full">
      {/* Header Info */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
        <h2 className="font-sans font-bold text-sm tracking-wide text-blue-500">
          Camera Preview
        </h2>
      </div>

      {/* Camera Video Window */}
      <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex flex-col items-center justify-center">
        {!streamError ? (
          // Real backend MJPEG Stream
          <div className="relative w-full h-full">
            {/* Tech Corner Borders */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/80 z-20 pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/80 z-20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/80 z-20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/80 z-20 pointer-events-none" />

            {/* Target Reticle (Central Circle and Tick Marks) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-20 h-20 border border-white/40 rounded-full flex items-center justify-center relative">
                {/* Horizontal Tick marks inside circle */}
                <div className="absolute w-6 h-[1px] bg-white/40" />
                <div className="absolute h-6 w-[1px] bg-white/40" />
              </div>
            </div>

            {/* Best Image Badge (Capsule) */}
            <div className="absolute top-4 right-4 z-20">
              <span className="px-3 py-1 bg-slate-900/80 text-white font-mono text-[9px] font-semibold tracking-wider rounded-md uppercase border border-slate-700/50">
                Best Image
              </span>
            </div>

            {isCapturing && (
              <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] z-20 flex items-center justify-center">
                <div className="font-display text-xs font-bold text-blue-400 animate-pulse tracking-widest">
                  CAPTURING FRAME {captureProgress}...
                </div>
              </div>
            )}
            
            <img
              src={streamUrl}
              alt="Live video stream"
              className="w-full h-full object-cover"
              onError={handleStreamError}
              onLoad={handleStreamLoad}
            />
          </div>
        ) : (
          // Stream error placeholder
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <CameraOff className="w-10 h-10 text-rose-500/70 mb-3" />
            <h3 className="font-mono text-[11px] font-bold text-slate-350 uppercase tracking-wider">
              Camera Offline
            </h3>
            <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 leading-relaxed font-mono">
              Could not connect to /video_feed stream.
            </p>
            <button
              onClick={handleRetry}
              className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-[10px] font-mono text-blue-400 rounded-md transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              RETRY
            </button>
          </div>
        )}
      </div>

      {/* Camera Swap and Flash Icons Row */}
      <div className="flex justify-between items-center px-2 py-3 text-slate-400">
        <button className="hover:text-white transition-colors cursor-pointer" title="Switch Camera">
          <SwitchCamera className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition-colors cursor-pointer" title="Toggle Flash">
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Large Blue Capture Image Button */}
      <button
        onClick={onCapture}
        disabled={isCapturing}
        className={`w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all cursor-pointer ${
          isCapturing ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <Camera className="w-4 h-4" />
        Capture Image
      </button>

      {/* Tips for Best Image */}
      <div className="border border-slate-900 bg-slate-950/20 rounded-lg p-3 mt-4">
        <h3 className="font-sans text-xs font-bold text-blue-400 mb-2">
          Tips for Best Image
        </h3>
        <ul className="space-y-1.5">
          {[
            'Well lit environment',
            'Avoid shadows',
            'Keep camera steady',
            'Focus on the object',
          ].map((tip) => (
            <li key={tip} className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[9px] font-bold">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CameraPreview;
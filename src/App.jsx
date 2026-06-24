import React, { useState } from 'react';
import { FlaskConical, AlertCircle, ArrowRight } from 'lucide-react';
import CameraPreview from './components/CameraPreview';
import CropImagePanel from './components/CropImagePanel';
import ColorDetailsPanel from './components/ColorDetailsPanel';
import DatasetForm from './components/DatasetForm';
import { captureImage, analyzeRoi, saveDataset } from './api';

function App() {
  const [isCapturing, setIsCapturing]     = useState(false);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [captureData, setCaptureData]     = useState(null);
  const [analysisData, setAnalysisData]   = useState(null);
  const [errorMsg, setErrorMsg]           = useState(null);
  const [captureProgress, setCaptureProgress] = useState('');

  const handleCapture = async () => {
    setIsCapturing(true);
    setErrorMsg(null);
    setCaptureData(null);
    setAnalysisData(null);
    setCaptureProgress('');

    let frame = 0;
    const progressInterval = setInterval(() => {
      frame = Math.min(frame + 1, 10);
      setCaptureProgress(`(${frame}/10)`);
    }, 350);

    try {
      const data = await captureImage();
      setCaptureData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Capture failed.');
    } finally {
      clearInterval(progressInterval);
      setCaptureProgress('');
      setIsCapturing(false);
    }
  };

  const handleCrop = async (crop) => {
    if (!captureData?.image_name) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const data = await analyzeRoi(captureData.image_name, crop);
      setAnalysisData(data);
    } catch (err) {
      setErrorMsg(err.message || 'ROI analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDataset = async (payload) => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await saveDataset({
        ...payload,
        image_name: captureData?.image_name,
        // Override with custom color features from state (in case of color picking on click):
        hex:   analysisData?.color_features?.hex,
        R:     analysisData?.color_features?.R,
        G:     analysisData?.color_features?.G,
        B:     analysisData?.color_features?.B,
        H:     analysisData?.color_features?.H,
        S:     analysisData?.color_features?.S,
        V:     analysisData?.color_features?.V,
        L:     analysisData?.color_features?.L,
        A:     analysisData?.color_features?.A,
        B_lab: analysisData?.color_features?.B_lab,
      });
      // Clear data on success for next run
      setCaptureData(null);
      setAnalysisData(null);
      return res;
    } catch (err) {
      setErrorMsg(err.message || 'Saving dataset failed.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const mergedCaptureData = captureData && analysisData
    ? { ...captureData, ...analysisData }
    : captureData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500/35 selection:text-blue-150">
      
      <header className="relative border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-30">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/40 border border-blue-500/30 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-display font-black text-md tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-450 to-indigo-400 leading-none">
              SYSTEM 1
            </h1>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1">
              Aquatic Chromaticity &amp; pH Dataset Generator
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 w-full max-w-[1400px] mx-auto flex flex-col gap-6">

        {errorMsg && (
          <div className="flex items-start gap-3 p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-350 font-mono text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <span className="font-bold uppercase tracking-wider block text-rose-400 mb-1">
                SYSTEM EXCEPTION TRIGGERED
              </span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-[10px] text-rose-400 hover:text-rose-200 border border-rose-500/20 px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Side-by-side 3-panel step workflow */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 w-full">
          
          {/* Step 1: Camera Preview */}
          <div className="flex-1 min-w-0">
            <CameraPreview
              onCapture={handleCapture}
              isCapturing={isCapturing}
              captureProgress={captureProgress}
            />
          </div>

          {/* Connect Arrow */}
          <div className="hidden lg:flex items-center justify-center text-blue-500 self-center">
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>

          {/* Step 2: Crop Image */}
          <div className="flex-1 min-w-0">
            <CropImagePanel
              bestImage={captureData?.best_image}
              imageWidth={captureData?.image_width}
              imageHeight={captureData?.image_height}
              onCrop={handleCrop}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Connect Arrow */}
          <div className="hidden lg:flex items-center justify-center text-blue-500 self-center">
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>

          {/* Step 3: Color & Details + Dataset Form */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex-grow">
              <ColorDetailsPanel
                analysisData={analysisData}
                onColorChange={(newColors) => {
                  setAnalysisData(prev => ({
                    ...prev,
                    color_features: newColors
                  }));
                }}
              />
            </div>
            <DatasetForm
              onSave={handleSaveDataset}
              isSaving={isSaving}
              hasCaptured={!!analysisData}
              currentCaptureData={mergedCaptureData}
            />
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-center font-mono text-[9px] text-slate-650 uppercase tracking-widest mt-auto">
        <span>System 1: Data Acquisition Unit • Connected Node: Localhost</span>
      </footer>
    </div>
  );
}

export default App;

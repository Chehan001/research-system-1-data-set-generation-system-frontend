import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const DatasetForm = ({ onSave, isSaving, hasCaptured, currentCaptureData }) => {
  const [saveName,    setSaveName]    = useState('');
  const [ph,          setPh]          = useState('');
  const [waterClass,  setWaterClass]  = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [message,     setMessage]     = useState(null);

  // Auto-classify water class from pH
  useEffect(() => {
    if (ph === '') { setWaterClass(''); return; }
    const v = parseFloat(ph);
    if (!isNaN(v)) {
      if (v < 6.5)            setWaterClass('Acidic');
      else if (v <= 8.5)      setWaterClass('Safe');
      else                    setWaterClass('Basic');
    }
  }, [ph]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!hasCaptured) {
      setMessage({ type: 'error', text: 'Please complete crop and colour analysis before saving.' });
      return;
    }

    if (!saveName.trim()) {
      setMessage({ type: 'error', text: 'Save name is required.' });
      return;
    }

    const phVal = parseFloat(ph);
    if (isNaN(phVal) || phVal < 0 || phVal > 14) {
      setMessage({ type: 'error', text: 'pH must be between 0.00 and 14.00.' });
      return;
    }

    if (!waterSource.trim()) {
      setMessage({ type: 'error', text: 'Water source is required.' });
      return;
    }

    // image_name is injected by App.jsx's handleSaveDataset
    const payload = {
      save_name:    saveName.trim(),
      ph_value:     phVal,
      water_class:  waterClass,
      water_source: waterSource.trim(),
    };

    try {
      const response = await onSave(payload);
      setMessage({
        type: 'success',
        text: response.message || 'Dataset record successfully saved!',
      });
      // Clear fields upon success
      setSaveName('');
      setPh('');
      setWaterSource('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save record.' });
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-4 relative overflow-hidden glow-border mt-4">
      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 border-b border-slate-800/60 pb-2 mb-3">
        <Database className="w-4 h-4 text-cyan-400" />
        <h2 className="font-display font-bold text-xs tracking-wider text-slate-200">
          DATASET RECORD SUBMISSION
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
        {/* Save Name */}
        <div>
          <label htmlFor="save-name-input" className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1">
            Save Name (Required)
          </label>
          <input
            id="save-name-input"
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g. sample_leaf_01"
            className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-750 focus:border-cyan-500 focus:outline-none rounded-lg py-2 px-3 font-mono text-xs text-slate-100 transition-all placeholder:text-slate-700"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* pH Input */}
          <div>
            <label htmlFor="ph-input" className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1">
              pH Value (0–14)
            </label>
            <input
              id="ph-input"
              type="number"
              step="0.01"
              min="0"
              max="14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              placeholder="e.g. 7.42"
              className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-750 focus:border-cyan-500 focus:outline-none rounded-lg py-2 px-3 font-mono text-xs text-slate-100 transition-all placeholder:text-slate-700"
              required
            />
          </div>

          {/* Water Class */}
          <div>
            <label htmlFor="water-class-select" className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1">
              Water Class (Auto)
            </label>
            <input
              id="water-class-select"
              type="text"
              value={waterClass}
              readOnly
              placeholder="Auto-calculated"
              className="w-full bg-slate-900 border border-slate-850 rounded-lg py-2 px-3 font-mono text-xs text-slate-400 focus:outline-none cursor-default"
            />
          </div>
        </div>

        {/* Water Source */}
        <div>
          <label htmlFor="water-source-input" className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1">
            Water Source
          </label>
          <input
            id="water-source-input"
            type="text"
            value={waterSource}
            onChange={(e) => setWaterSource(e.target.value)}
            placeholder="e.g. Tap, River, Lake"
            list="sources-list"
            className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-750 focus:border-cyan-500 focus:outline-none rounded-lg py-2 px-3 font-mono text-xs text-slate-100 transition-all placeholder:text-slate-700"
            required
          />
          <datalist id="sources-list">
            <option value="Tap Water" />
            <option value="River Runoff" />
            <option value="Lake Reservoir" />
            <option value="Rainwater Collector" />
            <option value="Industrial Outflow" />
          </datalist>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] font-mono ${
            message.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
            <div>
              <p className="font-bold uppercase leading-none">{message.type === 'success' ? 'SYSTEM OK' : 'SYSTEM ERROR'}</p>
              <p className="mt-1 leading-snug">{message.text}</p>
            </div>
          </div>
        )}

        {/* No capture warning */}
        {!hasCaptured && (
          <div className="flex items-center gap-2 p-2 bg-slate-950/40 border border-slate-900 rounded-lg text-slate-600 text-[10px] font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-500/40 flex-shrink-0" />
            <span>Complete capture, crop, and color analysis first.</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSaving || !hasCaptured}
            className={`w-full py-2 font-display font-bold text-xs tracking-widest uppercase rounded-lg border transition-all duration-200 cursor-pointer ${
              isSaving || !hasCaptured
                ? 'bg-slate-950/20 border-slate-900 text-slate-700 cursor-not-allowed'
                : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-[0.98]'
            }`}
          >
            {isSaving ? 'Archiving...' : 'Save Dataset Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DatasetForm;
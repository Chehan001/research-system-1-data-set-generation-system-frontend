import React from 'react';
import { Camera, Wand2, Crop, Palette, Check } from 'lucide-react';

const STEPS = [
  { id: 1, icon: Camera,  title: 'Capture Image',  desc: 'Use smartphone camera' },
  { id: 2, icon: Wand2,   title: 'Enhance Quality', desc: 'Reduce blur & improve quality' },
  { id: 3, icon: Crop,    title: 'Crop Image',      desc: 'Select area of interest' },
  { id: 4, icon: Palette, title: 'Analyze Color',   desc: 'Get HEX, RGB, and LAB values' },
];

const WorkflowSteps = ({ currentStep }) => {
  const activeStep = currentStep;

  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 glow-border">
      <h2 className="font-display font-bold text-xs tracking-wider text-slate-400 uppercase mb-4">
        Workflow Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = activeStep > step.id;
          const isActive = activeStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center text-center gap-2">
              <div
                className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : isActive
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900/60 border-slate-700 text-slate-500'
                }`}
              >
                {isDone ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.id}
                </span>
              </div>
              <div>
                <p className={`font-display text-xs font-bold tracking-wide ${isActive ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;

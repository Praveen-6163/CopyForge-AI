import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { PromptParameters } from '../types/generation';

interface AdvancedControlsProps {
  parameters: PromptParameters;
  onChange: (newParams: PromptParameters) => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({ parameters, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-800/80 bg-slate-900/40 rounded-xl overflow-hidden mb-5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-800/40 hover:bg-slate-800/70 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium text-slate-200">Advanced Prompt Controls</span>
          <span className="text-xs text-slate-500 font-mono ml-2">
            (Temp: {parameters.temperature.toFixed(2)}, Top-P: {parameters.top_p.toFixed(2)})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-5 bg-slate-950/40 border-t border-slate-800/60">
          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                Temperature
                <span className="group relative cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 rounded bg-slate-800 p-2 text-[11px] text-slate-200 opacity-0 shadow-lg group-hover:opacity-100 transition-opacity z-20">
                    Controls creativity and variation. Lower values are deterministic, higher values are creative.
                  </span>
                </span>
              </label>
              <span className="text-xs font-mono font-bold text-brand-300 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                {parameters.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={parameters.temperature}
              onChange={(e) => onChange({ ...parameters, temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Controls creativity and variation.</p>
          </div>

          {/* Top-P Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                Top-P (Nucleus Sampling)
                <span className="group relative cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 rounded bg-slate-800 p-2 text-[11px] text-slate-200 opacity-0 shadow-lg group-hover:opacity-100 transition-opacity z-20">
                    Controls the range of tokens considered during generation.
                  </span>
                </span>
              </label>
              <span className="text-xs font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                {parameters.top_p.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={parameters.top_p}
              onChange={(e) => onChange({ ...parameters, top_p: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Controls the range of tokens considered during generation.</p>
          </div>

          {/* Max Output Tokens Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Max Tokens</label>
              <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {parameters.max_tokens} tokens
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={parameters.max_tokens}
              onChange={(e) => onChange({ ...parameters, max_tokens: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Maximum output length limit (~750 tokens ≈ 500 words).</p>
          </div>
        </div>
      )}
    </div>
  );
};

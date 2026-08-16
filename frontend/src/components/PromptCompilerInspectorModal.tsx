import React, { useState } from 'react';
import { X, Terminal, Copy, Check, ShieldCheck } from 'lucide-react';

interface PromptCompilerInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  compiledPrompt: string;
}

export const PromptCompilerInspectorModal: React.FC<PromptCompilerInspectorModalProps> = ({
  isOpen,
  onClose,
  compiledPrompt,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Compiled Dynamic Prompt
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                  Backend Compiler
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Structured prompt sent to the LLM backend engine.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prompt Output Codeblock */}
        <div className="p-6 overflow-y-auto bg-slate-950/90 font-mono text-xs text-cyan-200/90 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30 selection:text-white">
          {compiledPrompt || 'No compiled prompt available for this output.'}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PipelineStage } from '../types/generation';
import { FileText, Terminal, Cpu, ShieldCheck, CheckCircle } from 'lucide-react';

interface GenerationPipelineProps {
  stage: PipelineStage;
}

const STAGES = [
  { id: 'brief', label: 'Brief Input', icon: FileText },
  { id: 'prompt_compiling', label: 'Compiling Prompt', icon: Terminal },
  { id: 'ai_generating', label: 'AI Generation', icon: Cpu },
  { id: 'validating', label: 'Output Validation', icon: ShieldCheck },
  { id: 'ready', label: 'Ready', icon: CheckCircle },
];

export const GenerationPipeline: React.FC<GenerationPipelineProps> = ({ stage }) => {
  const getStageIndex = (s: PipelineStage) => {
    switch (s) {
      case 'brief': return 0;
      case 'prompt_compiling': return 1;
      case 'ai_generating': return 2;
      case 'validating': return 3;
      case 'ready': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(stage);

  return (
    <div className="w-full bg-[#111726]/80 backdrop-blur border border-slate-800 rounded-xl p-3 mb-6 shadow-inner">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-2">
        {STAGES.map((stg, index) => {
          const Icon = stg.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <React.Fragment key={stg.id}>
              <div className="flex flex-col items-center gap-1.5 relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/40 ring-4 ring-brand-500/20 scale-110'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                <span
                  className={`text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-brand-300 font-semibold'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  {stg.label}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${
                    index < currentIndex ? 'bg-emerald-500/60' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

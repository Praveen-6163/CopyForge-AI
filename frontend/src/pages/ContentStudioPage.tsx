import React from 'react';
import { PenTool } from 'lucide-react';
import { PageWrapper } from '../components/ui';
import { GenerateRequest, GenerationResponse, ToneType, PlatformType, HistoryItem } from '../types/generation';
import { ContentBriefForm } from '../components/ContentBriefForm';
import { ContentEditor } from '../components/ContentEditor';
import { GenerationPipeline } from '../components/GenerationPipeline';
import { PipelineStage } from '../types/generation';

interface ContentStudioPageProps {
  formData: GenerateRequest;
  setFormData: React.Dispatch<React.SetStateAction<GenerateRequest>>;
  generation: GenerationResponse | null;
  isLoading: boolean;
  pipelineStage: PipelineStage;
  onGenerate: () => void;
  onRefine: (action: 'make_shorter' | 'make_longer' | 'enhance_persuasion' | 'change_tone' | 'change_platform', newTone?: ToneType, newPlatform?: PlatformType) => void;
  onRegenerate: () => void;
  onToggleSave: (id: string) => void;
  onOpenTemplates: () => void;
  onViewCompiledPrompt: () => void;
  onResetForm?: () => void;
}

export const ContentStudioPage: React.FC<ContentStudioPageProps> = ({
  formData, setFormData, generation, isLoading, pipelineStage,
  onGenerate, onRefine, onRegenerate, onToggleSave,
  onOpenTemplates, onViewCompiledPrompt, onResetForm,
}) => {
  return (
    <PageWrapper className="!max-w-none">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <PenTool className="w-5 h-5 text-brand-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Content Studio</h1>
        </div>
        <p className="text-sm text-slate-400">AI-powered copywriting workspace — generate platform-ready content</p>
      </div>

      {/* Generation Pipeline */}
      <GenerationPipeline stage={pipelineStage} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentBriefForm
          formData={formData}
          setFormData={setFormData}
          onGenerate={onGenerate}
          isLoading={isLoading}
          onOpenTemplates={onOpenTemplates}
          onResetForm={onResetForm}
        />
        <ContentEditor
          generation={generation}
          isLoading={isLoading}
          onRefine={onRefine}
          onRegenerate={onRegenerate}
          onToggleSave={onToggleSave}
          onViewCompiledPrompt={onViewCompiledPrompt}
        />
      </div>
    </PageWrapper>
  );
};

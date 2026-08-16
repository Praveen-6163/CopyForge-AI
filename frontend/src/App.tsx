import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { GenerationPipeline } from './components/GenerationPipeline';
import { ContentBriefForm } from './components/ContentBriefForm';
import { ContentEditor } from './components/ContentEditor';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TemplatesModal } from './components/TemplatesModal';
import { PromptCompilerInspectorModal } from './components/PromptCompilerInspectorModal';
import { SettingsModal } from './components/SettingsModal';

import {
  GenerateRequest, GenerationResponse, HealthStatus,
  PipelineStage, HistoryItem, TemplateItem, ToneType, PlatformType
} from './types/generation';
import {
  fetchHealth, generateCopy, improveCopy, toggleSaveItem
} from './services/api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [activeView, setActiveView] = useState<'editor' | 'history' | 'saved'>('editor');
  
  // Modals / Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedOnlyMode, setSavedOnlyMode] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Generation Form State
  const [formData, setFormData] = useState<GenerateRequest>({
    product_name: 'CopyForge AI',
    product_description: 'An automated copywriting & tone transformer application that compiles structured prompts based on product details, target platform rules, tone directives, and parameter controls to produce platform-ready marketing copy.',
    platform: 'LinkedIn',
    tone: 'Professional',
    audience: 'Professionals',
    objective: 'Product launch',
    additional_instructions: 'Focus on high-speed campaign creation and platform-specific structure.',
    parameters: {
      temperature: 0.5,
      top_p: 0.9,
      max_tokens: 750,
    },
  });

  const [generationOutput, setGenerationOutput] = useState<GenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');

  useEffect(() => {
    fetchHealth().then(setHealth).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setPipelineStage('prompt_compiling');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setPipelineStage('ai_generating');

      const result = await generateCopy(formData);

      setPipelineStage('validating');
      await new Promise((r) => setTimeout(r, 200));

      setGenerationOutput(result);
      setPipelineStage('ready');
    } catch (e: any) {
      console.error(e);
      alert(`Generation Error: ${e.response?.data?.detail || e.message}`);
      setPipelineStage('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (
    action: 'make_shorter' | 'make_longer' | 'enhance_persuasion' | 'change_tone' | 'change_platform',
    newTone?: ToneType,
    newPlatform?: PlatformType
  ) => {
    if (!generationOutput) return;
    setIsLoading(true);
    setPipelineStage('ai_generating');

    try {
      const result = await improveCopy({
        current_content: generationOutput.generated_content,
        action: action,
        product_name: formData.product_name,
        platform: formData.platform,
        tone: formData.tone,
        new_tone: newTone,
        new_platform: newPlatform,
        parameters: formData.parameters,
      });

      setPipelineStage('validating');
      setGenerationOutput(result);
      setPipelineStage('ready');
    } catch (e: any) {
      console.error(e);
      alert(`Refinement Error: ${e.response?.data?.detail || e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (id: string) => {
    try {
      const isSaved = await toggleSaveItem(id);
      if (generationOutput && generationOutput.id === id) {
        setGenerationOutput({ ...generationOutput, is_saved: isSaved });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setFormData({
      product_name: item.product_name,
      product_description: item.product_description,
      platform: item.platform,
      tone: item.tone,
      audience: item.audience,
      objective: item.objective as any,
      additional_instructions: '',
      parameters: {
        temperature: item.prompt_parameters.temperature || 0.5,
        top_p: item.prompt_parameters.top_p || 0.9,
        max_tokens: item.prompt_parameters.max_tokens || 750,
      },
    });

    // Reconstruct response output preview
    const words = item.generated_content.split(' ').length;
    const chars = item.generated_content.length;

    setGenerationOutput({
      id: item.id,
      product_name: item.product_name,
      product_description: item.product_description,
      platform: item.platform,
      tone: item.tone,
      audience: item.audience,
      objective: item.objective,
      prompt_parameters: item.prompt_parameters,
      compiled_prompt: 'Reopened from SQLite History.',
      generated_content: item.generated_content,
      formatted_content: {
        raw_text: item.generated_content,
        word_count: words,
        char_count: chars,
      },
      platform_validation: {
        is_valid: true,
        passed_rules: ['Loaded from history database'],
        warnings: [],
        platform_constraints: {},
      },
      is_demo_mode: false,
      is_saved: item.is_saved,
      created_at: item.created_at,
    });
    setPipelineStage('ready');
  };

  const handleSelectTemplate = (tpl: TemplateItem) => {
    setFormData({
      product_name: tpl.product_name_placeholder,
      product_description: tpl.product_description_placeholder,
      platform: tpl.platform,
      tone: tpl.tone,
      audience: tpl.audience,
      objective: tpl.objective,
      additional_instructions: tpl.additional_instructions,
      parameters: formData.parameters,
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f19] text-slate-100 font-sans antialiased">
      {/* SaaS Sidebar */}
      <Sidebar
        health={health}
        activeView={activeView}
        onNewGeneration={() => {
          setActiveView('editor');
          setGenerationOutput(null);
          setPipelineStage('idle');
        }}
        onOpenHistory={() => {
          setSavedOnlyMode(false);
          setIsHistoryOpen(true);
        }}
        onOpenSaved={() => {
          setSavedOnlyMode(true);
          setIsHistoryOpen(true);
        }}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar health={health} onOpenSettings={() => setIsSettingsOpen(true)} />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {/* Visual Generation Pipeline */}
          <GenerationPipeline stage={pipelineStage} />

          {/* Two-Column Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Content Brief */}
            <div className="lg:col-span-5">
              <ContentBriefForm
                formData={formData}
                setFormData={setFormData}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                onOpenTemplates={() => setIsTemplatesOpen(true)}
              />
            </div>

            {/* Right Column: Generated Content */}
            <div className="lg:col-span-7">
              <ContentEditor
                generation={generationOutput}
                isLoading={isLoading}
                onRefine={handleRefine}
                onRegenerate={handleGenerate}
                onToggleSave={handleToggleSave}
                onViewCompiledPrompt={() => setIsPromptInspectorOpen(true)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistoryItem={handleSelectHistoryItem}
        savedOnlyMode={savedOnlyMode}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <PromptCompilerInspectorModal
        isOpen={isPromptInspectorOpen}
        onClose={() => setIsPromptInspectorOpen(false)}
        compiledPrompt={generationOutput?.compiled_prompt || ''}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        health={health}
      />
    </div>
  );
};

export default App;

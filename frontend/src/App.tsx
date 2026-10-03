import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ─── Existing components (preserved) ─────────────────────────────────────────
import { Navbar } from './components/Navbar';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TemplatesModal } from './components/TemplatesModal';
import { PromptCompilerInspectorModal } from './components/PromptCompilerInspectorModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyPage } from './components/PrivacyPage';

// ─── New components ───────────────────────────────────────────────────────────
import { NewSidebar } from './components/NewSidebar';

// ─── New Pages ────────────────────────────────────────────────────────────────
import { DashboardPage }       from './pages/DashboardPage';
import { TrendRadarPage }      from './pages/TrendRadarPage';
import { ContentStudioPage }   from './pages/ContentStudioPage';
import { ImageStudioPage }     from './pages/ImageStudioPage';
import { ContentCalendarPage } from './pages/ContentCalendarPage';
import { ApprovalQueuePage }   from './pages/ApprovalQueuePage';
import { PublishedPostsPage }  from './pages/PublishedPostsPage';
import { AnalyticsPage }       from './pages/AnalyticsPage';
import { SocialAccountPage }   from './pages/SocialAccountPage';
import { AutomationPage }      from './pages/AutomationPage';
import { AIVoicePage }         from './pages/AIVoicePage';
import { SettingsPage }        from './pages/SettingsPage';

// ─── Types & Services ─────────────────────────────────────────────────────────
import {
  GenerateRequest, GenerationResponse, HealthStatus,
  PipelineStage, HistoryItem, TemplateItem, ToneType, PlatformType
} from './types/generation';
import {
  fetchHealth, generateCopy, improveCopy, toggleSaveItem
} from './services/api';

const DEFAULT_FORM: GenerateRequest = {
  product_name: 'CopyForge AI',
  product_description: 'An automated copywriting & tone transformer that compiles structured prompts based on product details, target platform rules, tone directives, and parameter controls to produce platform-ready marketing copy.',
  platform: 'LinkedIn',
  tone: 'Professional',
  audience: 'Professionals',
  objective: 'Product launch',
  additional_instructions: 'Focus on high-speed campaign creation and platform-specific structure.',
  parameters: { temperature: 0.5, top_p: 0.9, max_tokens: 750 },
};

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // ─── Modals/Drawers (existing) ──────────────────────────────────────────────
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedOnlyMode, setSavedOnlyMode] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ─── Generation State (existing) ───────────────────────────────────────────
  const [formData, setFormData] = useState<GenerateRequest>(DEFAULT_FORM);
  const [generationOutput, setGenerationOutput] = useState<GenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');

  useEffect(() => {
    fetchHealth().then(setHealth).catch(console.error);
  }, []);

  // ─── Generation Handlers (preserved exactly) ────────────────────────────────
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
        action, product_name: formData.product_name,
        platform: formData.platform, tone: formData.tone,
        new_tone: newTone, new_platform: newPlatform,
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
    } catch (e) { console.error(e); }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setFormData({
      product_name: item.product_name,
      product_description: item.product_description,
      platform: item.platform, tone: item.tone,
      audience: item.audience, objective: item.objective as any,
      additional_instructions: '',
      parameters: {
        temperature: item.prompt_parameters.temperature || 0.5,
        top_p: item.prompt_parameters.top_p || 0.9,
        max_tokens: item.prompt_parameters.max_tokens || 750,
      },
    });
    const words = item.generated_content.split(' ').length;
    const chars = item.generated_content.length;
    setGenerationOutput({
      id: item.id, product_name: item.product_name,
      product_description: item.product_description,
      platform: item.platform, tone: item.tone,
      audience: item.audience, objective: item.objective,
      prompt_parameters: item.prompt_parameters,
      compiled_prompt: 'Reopened from history.',
      generated_content: item.generated_content,
      formatted_content: { raw_text: item.generated_content, word_count: words, char_count: chars },
      platform_validation: { is_valid: true, passed_rules: ['Loaded from history'], warnings: [], platform_constraints: {} },
      is_demo_mode: false, is_saved: item.is_saved, created_at: item.created_at,
    });
    setPipelineStage('ready');
  };

  const handleSelectTemplate = (tpl: TemplateItem) => {
    setFormData({
      product_name: tpl.product_name_placeholder,
      product_description: tpl.product_description_placeholder,
      platform: tpl.platform, tone: tpl.tone,
      audience: tpl.audience, objective: tpl.objective,
      additional_instructions: tpl.additional_instructions,
      parameters: formData.parameters,
    });
  };

  const handleResetForm = () => {
    setGenerationOutput(null);
    setPipelineStage('idle');
    setFormData({
      product_name: '', product_description: '',
      platform: 'LinkedIn', tone: 'Professional',
      audience: 'General', objective: 'Product launch',
      additional_instructions: '',
      parameters: { temperature: 0.5, top_p: 0.9, max_tokens: 750 },
    });
  };

  // ─── Shell: Shared layout for all authenticated pages ───────────────────────
  const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex bg-[#0b0f19] text-slate-100 font-sans antialiased">
      <NewSidebar health={health} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar health={health} onOpenSettings={() => setIsSettingsOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Global modals — always mounted in shell */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistoryItem={(item) => {
          handleSelectHistoryItem(item);
          setIsHistoryOpen(false);
        }}
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

  return (
    <Routes>
      {/* Public route — no shell */}
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* All platform routes inside AppShell */}
      <Route path="/" element={
        <AppShell>
          <DashboardPage />
        </AppShell>
      } />

      <Route path="/trend-radar" element={
        <AppShell><TrendRadarPage /></AppShell>
      } />

      <Route path="/studio" element={
        <AppShell>
          <ContentStudioPage
            formData={formData}
            setFormData={setFormData}
            generation={generationOutput}
            isLoading={isLoading}
            pipelineStage={pipelineStage}
            onGenerate={handleGenerate}
            onRefine={handleRefine}
            onRegenerate={handleGenerate}
            onToggleSave={handleToggleSave}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onViewCompiledPrompt={() => setIsPromptInspectorOpen(true)}
            onResetForm={handleResetForm}
          />
        </AppShell>
      } />

      <Route path="/image-studio" element={
        <AppShell><ImageStudioPage /></AppShell>
      } />

      <Route path="/calendar" element={
        <AppShell><ContentCalendarPage /></AppShell>
      } />

      <Route path="/approvals" element={
        <AppShell><ApprovalQueuePage /></AppShell>
      } />

      <Route path="/published" element={
        <AppShell><PublishedPostsPage /></AppShell>
      } />

      <Route path="/analytics" element={
        <AppShell><AnalyticsPage /></AppShell>
      } />

      <Route path="/social/linkedin" element={
        <AppShell><SocialAccountPage platform="linkedin" /></AppShell>
      } />

      <Route path="/social/instagram" element={
        <AppShell><SocialAccountPage platform="instagram" /></AppShell>
      } />

      <Route path="/automation" element={
        <AppShell><AutomationPage /></AppShell>
      } />

      <Route path="/ai-voice" element={
        <AppShell><AIVoicePage /></AppShell>
      } />

      <Route path="/settings" element={
        <AppShell><SettingsPage /></AppShell>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';

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
import { SettingsPage }        from './pages/SettingsPage';

// ─── Types & Services ─────────────────────────────────────────────────────────
import {
  GenerateRequest, GenerationResponse, HealthStatus,
  PipelineStage, HistoryItem, TemplateItem, ToneType, PlatformType
} from './types/generation';
import {
  fetchHealth, generateCopy, improveCopy, toggleSaveItem
} from './services/api';
import { TrendItem } from './services/platformApi';
import { getWorkspacePreferences } from './services/workspacePreferences';

const DEFAULT_FORM: GenerateRequest = {
  product_name: 'CopyForge AI',
  product_description: 'An automated copywriting & tone transformer that compiles structured prompts based on product details, target platform rules, tone directives, and parameter controls to produce platform-ready marketing copy.',
  platform: 'LinkedIn',
  tone: 'Professional',
  audience: 'Professionals',
  objective: 'Product launch',
  content_type: 'Social post',
  additional_instructions: 'Focus on high-speed campaign creation and platform-specific structure.',
  parameters: { temperature: 0.5, top_p: 0.9, max_tokens: 750 },
};

const getDefaultForm = (): GenerateRequest => {
  const preferences = getWorkspacePreferences();
  return {
    ...DEFAULT_FORM,
    platform: preferences.defaultPlatform,
    tone: preferences.defaultTone,
    audience: preferences.defaultAudience,
    objective: preferences.defaultObjective,
  };
};

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // ─── Modals/Drawers (existing) ──────────────────────────────────────────────
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedOnlyMode, setSavedOnlyMode] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ─── Generation State (existing) ───────────────────────────────────────────
  const [formData, setFormData] = useState<GenerateRequest>(getDefaultForm);
  const [generationOutput, setGenerationOutput] = useState<GenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');

  useEffect(() => {
    fetchHealth().then(setHealth).catch(console.error);
  }, []);

  // ─── Generation Handlers ──────────────────────────────────────────────────
  const handleGenerate = async (overrideForm?: GenerateRequest) => {
    const activeForm = overrideForm || formData;
    if (!activeForm.product_name && !activeForm.product_description) {
      alert('Please provide a topic or description before generating.');
      return;
    }
    setIsLoading(true);
    setPipelineStage('prompt_compiling');
    try {
      setPipelineStage('ai_generating');
      const result = await generateCopy(activeForm);
      setPipelineStage('validating');
      setGenerationOutput(result);
      setPipelineStage('ready');
    } catch (e: any) {
      console.error('Generation error:', e);
      const errorMsg = e.response?.data?.detail || e.message || 'Generation failed';
      alert(`Generation Error: ${errorMsg}`);
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
      content_type: item.content_type,
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
      content_type: item.content_type,
      prompt_parameters: item.prompt_parameters,
      compiled_prompt: 'Reopened from history.',
      generated_content: item.generated_content,
      hook: item.hook || null,
      cta: item.cta || null,
      hashtags: item.hashtags || [],
      image_prompt: item.image_prompt || null,
      formatted_content: { raw_text: item.generated_content, word_count: words, char_count: chars },
      platform_validation: { is_valid: true, passed_rules: ['Loaded from history'], warnings: [], platform_constraints: {} },
      is_saved: item.is_saved, created_at: item.created_at,
    });
    setPipelineStage('ready');
  };

  const handleSelectTemplate = (tpl: TemplateItem) => {
    setFormData({
      product_name: tpl.product_name_placeholder,
      product_description: tpl.product_description_placeholder,
      platform: tpl.platform, tone: tpl.tone,
      audience: tpl.audience, objective: tpl.objective,
      content_type: 'Social post',
      additional_instructions: tpl.additional_instructions,
      parameters: formData.parameters,
    });
  };

  const handleDraftFromTrend = (trend: TrendItem, targetPlatform: 'LinkedIn' | 'Instagram' = 'LinkedIn') => {
    const sourceName = trend.sourceName || trend.source || 'Web Source';
    const sourceUrl = trend.sourceUrl || trend.source_url || '';
    const whyItMatters = trend.whyItMatters ? `\n\nWhy it matters: ${trend.whyItMatters}` : '';
    const sourceCitation = sourceUrl ? `\n\nSource: ${sourceName} (${sourceUrl})` : `\n\nSource: ${sourceName}`;

    setFormData((prev) => ({
      ...prev,
      product_name: trend.title,
      product_description: `${trend.summary}${whyItMatters}${sourceCitation}`,
      platform: targetPlatform as PlatformType,
      additional_instructions: `Highlight key insights from this ${trend.category || 'AI'} trend. Source: ${sourceName}.`,
    }));
  };

  const handleResetForm = () => {
    setGenerationOutput(null);
    setPipelineStage('idle');
    const defaults = getDefaultForm();
    setFormData({
      ...defaults,
      product_name: '',
      product_description: '',
      additional_instructions: '',
    });
  };

  // ─── Shell: Shared layout for all authenticated pages ───────────────────────
  const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex bg-[#0b0f19] text-slate-100 font-sans antialiased">
      <NewSidebar
        health={health}
        mobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenHistory={(savedOnly) => {
          setSavedOnlyMode(savedOnly);
          setIsHistoryOpen(true);
          setIsMobileNavOpen(false);
        }}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="cf-mobile-topbar md:hidden">
          <button type="button" aria-label="Open navigation" onClick={() => setIsMobileNavOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div><Sparkles className="h-4 w-4 text-sky-300" /> CopyForge</div>
        </div>
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
        onSettingsSaved={() => {
          fetchHealth().then(setHealth).catch(console.error);
        }}
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
          <DashboardPage
            health={health}
            onOpenHistory={(savedOnly) => {
              setSavedOnlyMode(savedOnly);
              setIsHistoryOpen(true);
            }}
          />
        </AppShell>
      } />

      <Route path="/trend-radar" element={
        <AppShell><TrendRadarPage onCreatePost={handleDraftFromTrend} /></AppShell>
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

      <Route path="/social" element={
        <AppShell><SocialAccountPage /></AppShell>
      } />
      <Route path="/social/linkedin" element={<Navigate to="/social" replace />} />
      <Route path="/social/instagram" element={<Navigate to="/social" replace />} />

      <Route path="/automation" element={
        <AppShell><AutomationPage /></AppShell>
      } />

      <Route path="/settings" element={
        <AppShell><SettingsPage health={health} /></AppShell>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

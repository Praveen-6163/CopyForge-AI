import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  PenTool,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Calendar,
  Layers,
  Send,
  Sliders,
  Maximize2,
  Eye,
  CheckSquare,
  Wand2,
  MessageSquare
} from 'lucide-react';
import { createPost, TrendItem } from '../services/platformApi';
import {
  GenerateRequest,
  GenerationResponse,
  PipelineStage,
  ToneType,
  PlatformType,
  ObjectiveType,
  ContentType
} from '../types/generation';
import { Button, Badge, Card, Input, Select, ContentPreview } from '../components/ui';

interface ContentStudioProps {
  formData: GenerateRequest;
  setFormData: React.Dispatch<React.SetStateAction<GenerateRequest>>;
  generation: GenerationResponse | null;
  isLoading: boolean;
  pipelineStage: PipelineStage;
  onGenerate: () => void;
  onRefine: (action: any, newTone?: ToneType, newPlatform?: PlatformType) => void;
  onRegenerate: () => void;
  onToggleSave: (id: string) => void;
  onOpenTemplates: () => void;
  onViewCompiledPrompt: () => void;
  onResetForm: () => void;
}

export const ContentStudioPage: React.FC<ContentStudioProps> = ({
  formData,
  setFormData,
  generation,
  isLoading,
  pipelineStage,
  onGenerate,
  onRefine,
  onRegenerate,
  onToggleSave,
  onOpenTemplates,
  onViewCompiledPrompt,
  onResetForm,
}) => {
  const location = useLocation();
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postActionBusy, setPostActionBusy] = useState(false);
  const [postActionNotice, setPostActionNotice] = useState('');
  const [postActionError, setPostActionError] = useState('');

  useEffect(() => {
    const trendState = location.state as { trend?: TrendItem; targetPlatform?: PlatformType } | null;
    if (trendState?.trend) {
      const trend = trendState.trend;
      const sourceName = trend.sourceName || trend.source || 'Web Source';
      const sourceUrl = trend.sourceUrl || trend.source_url || '';
      const whyItMatters = trend.whyItMatters ? `\n\nWhy it matters: ${trend.whyItMatters}` : '';
      const sourceCitation = sourceUrl ? `\n\nSource: ${sourceName} (${sourceUrl})` : `\n\nSource: ${sourceName}`;
      setFormData((prev) => ({
        ...prev,
        product_name: trend.title,
        product_description: `${trend.summary}${whyItMatters}${sourceCitation}`,
        platform: (trendState.targetPlatform || prev.platform || 'LinkedIn') as PlatformType,
        additional_instructions: `Highlight key insights from this ${trend.category || 'AI'} trend. Source: ${sourceName}.`,
      }));
    }
  }, [location.state, setFormData]);

  const handleCopy = () => {
    if (!generation?.generated_content) return;
    navigator.clipboard.writeText(generation.generated_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePost = async (mode: 'draft_only' | 'approval_required') => {
    if (!generation) return;
    const platform = generation.platform === 'LinkedIn'
      ? 'linkedin'
      : generation.platform === 'Instagram'
        ? 'instagram'
        : null;
    if (!platform) {
      setPostActionError('Drafts and approvals are currently supported for LinkedIn and Instagram content.');
      return;
    }

    setPostActionBusy(true);
    setPostActionNotice('');
    setPostActionError('');
    try {
      await createPost({
        topic: generation.product_name,
        description: generation.product_description,
        platform,
        content: generation.generated_content,
        tone: generation.tone,
        audience: generation.audience,
        content_type: generation.content_type,
        hook: generation.hook,
        cta: generation.cta,
        hashtags: generation.hashtags,
        image_prompt: generation.image_prompt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        mode,
      });
      setPostActionNotice(mode === 'draft_only'
        ? 'Draft saved to your Content Calendar.'
        : 'Content added to your Approval Queue.');
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setPostActionError(detail || 'Could not save this content to the backend.');
    } finally {
      setPostActionBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Studio Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            STUDIO WORKSPACE
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Content Studio
            {pipelineStage === 'ai_generating' && (
              <Badge variant="purple" dot>AI Generating</Badge>
            )}
            {pipelineStage === 'ready' && (
              <Badge variant="success" dot>Draft Ready</Badge>
            )}
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Compile structured prompt directives into platform-optimized marketing content and social releases.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={onResetForm}>
            Reset Brief
          </Button>
          <Button variant="secondary" size="sm" icon={Layers} onClick={onOpenTemplates}>
            Formulas & Templates
          </Button>
          <Button variant="outline" size="sm" icon={Sliders} onClick={onViewCompiledPrompt}>
            Inspect Prompt
          </Button>
        </div>
      </div>

      {/* ── Split Screen Studio Workspace ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT: Content Brief Form ────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-400" />
                Content Brief
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Structured Directives</span>
            </div>

            {/* Product / Topic */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Product / Topic *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="e.g. CopyForge AI or Autonomous AI Agents"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Description & Angle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Description & Key Value *
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {formData.product_description.length} / 3000
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.product_description}
                onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                placeholder="Detail core insights, metrics, benefits, or announcement angles..."
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>

            {/* Platform & Tone Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => {
                    const val = e.target.value as PlatformType;
                    setFormData({ ...formData, platform: val });
                  }}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="LinkedIn">LinkedIn (Thought Leadership)</option>
                  <option value="Instagram">Instagram (Visual + Bio CTA)</option>
                  <option value="X/Twitter">X / Twitter (Punchy Thread)</option>
                  <option value="Email">Email Newsletter</option>
                  <option value="Facebook">Facebook Community</option>
                  <option value="Website">Website / Hero Page</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tone Directive
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as ToneType })}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Professional">Professional / High Authority</option>
                  <option value="Casual">Casual / Relatable</option>
                  <option value="Persuasive">Persuasive / High Conversion</option>
                  <option value="Friendly">Friendly / Approachable</option>
                  <option value="Technical">Technical & Architectural</option>
                  <option value="Inspirational">Inspirational / Visionary</option>
                  <option value="Witty">Witty & Sharp</option>
                  <option value="Premium">Premium & Exclusive</option>
                </select>
              </div>
            </div>

            {/* Audience & Objective */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g. Founders, AI Engineers"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Content Objective
                </label>
                <select
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value as ObjectiveType })}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Product launch">Product launch</option>
                  <option value="Product promotion">Product promotion</option>
                  <option value="Awareness">Awareness</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Content Type
              </label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {['Social post', 'Carousel', 'Story', 'Reel script', 'Email newsletter', 'Video script', 'Ad copy'].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Keywords / Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Keywords & Special Instructions
              </label>
              <input
                type="text"
                value={formData.additional_instructions || ''}
                onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                placeholder="e.g. Include 3 bullet takeaways, avoid buzzwords"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Parameter Sliders Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedParams(!showAdvancedParams)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvancedParams ? 'Hide Parameter Tuning' : 'Advanced Parameters (Temperature & Top-P)'}</span>
              </button>

              {showAdvancedParams && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Temperature (Creativity)</span>
                      <span className="font-mono text-indigo-400">{formData.parameters.temperature}</span>
                    </div>
                    <input
                      type="range" min="0.0" max="1.0" step="0.05"
                      value={formData.parameters.temperature}
                      onChange={(e) => setFormData({
                        ...formData,
                        parameters: { ...formData.parameters, temperature: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Top-P (Nucleus Sampling)</span>
                      <span className="font-mono text-indigo-400">{formData.parameters.top_p}</span>
                    </div>
                    <input
                      type="range" min="0.0" max="1.0" step="0.05"
                      value={formData.parameters.top_p}
                      onChange={(e) => setFormData({
                        ...formData,
                        parameters: { ...formData.parameters, top_p: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Trigger */}
            <Button
              variant="primary"
              size="lg"
              className="w-full !py-3 font-bold"
              icon={Sparkles}
              loading={isLoading}
              onClick={onGenerate}
            >
              {isLoading ? 'Compiling & Generating...' : 'Generate Platform Copy'}
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Interactive Content Preview ───────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  Live Platform Preview
                </h3>
                {generation && (
                  <span className={`text-[11px] font-mono ${generation.platform_validation.is_valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {generation.platform_validation.is_valid ? 'Platform checks passed' : 'Review platform warnings'}
                  </span>
                )}
              </div>

            </div>

            {/* Generated Social Card Preview */}
            {generation?.generated_content ? (
              <div className="space-y-4">
                <ContentPreview
                  platform={generation.platform}
                  content={generation.generated_content}
                  hashtags={generation.hashtags}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Generated Hook</p>
                    <p className="text-xs text-white mt-1">{generation.hook || 'Not provided by the AI provider.'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Call to Action</p>
                    <p className="text-xs text-white mt-1">{generation.cta || 'Not provided by the AI provider.'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Image Prompt</p>
                    <p className="text-xs text-white mt-1">{generation.image_prompt || 'Not provided by the AI provider.'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Length</p>
                    <p className="text-xs text-white mt-1">
                      {generation.formatted_content?.word_count ?? generation.generated_content.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>
                {generation.platform_validation.warnings.length > 0 && (
                  <ul className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-200 space-y-1">
                    {generation.platform_validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                )}

                {/* Refinement Actions Toolbar */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-3">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    ✦ AI Refinement Controls
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onRefine('make_shorter')}>
                      Make Shorter
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onRefine('make_longer')}>
                      Make Longer
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onRefine('enhance_persuasion')}>
                      Make Human & Persuasive
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onRefine('change_tone', 'Casual')}>
                      More Conversational
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onRegenerate}>
                      Regenerate
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={generation.is_saved ? 'primary' : 'outline'}
                      size="sm"
                      icon={Bookmark}
                      onClick={() => onToggleSave(generation.id)}
                    >
                      {generation.is_saved ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                    <Button variant="outline" size="sm" icon={Share2} onClick={handleCopy}>
                      {copied ? 'Copied!' : 'Copy Text'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Calendar}
                      loading={postActionBusy}
                      onClick={() => void handleSavePost('draft_only')}
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckSquare}
                      loading={postActionBusy}
                      onClick={() => void handleSavePost('approval_required')}
                    >
                      Send for Approval
                    </Button>
                  </div>
                </div>
                {postActionNotice && <p role="status" className="text-xs text-emerald-300">{postActionNotice}</p>}
                {postActionError && <p role="alert" className="text-xs text-rose-300">{postActionError}</p>}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Wand2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No Content Generated Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Fill in your product topic and directives on the left, then click <strong>Generate Platform Copy</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

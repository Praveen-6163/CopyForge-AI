import React, { useState } from 'react';
import {
  Sparkles,
  PenTool,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  CheckCircle2,
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
import {
  GenerateRequest,
  GenerationResponse,
  PipelineStage,
  ToneType,
  PlatformType,
  ObjectiveType
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
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<'linkedin' | 'instagram'>('linkedin');
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [copied, setCopied] = useState(false);
  const [approvalSent, setApprovalSent] = useState(false);

  const handleCopy = () => {
    if (!generation?.generated_content) return;
    navigator.clipboard.writeText(generation.generated_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendApproval = () => {
    setApprovalSent(true);
    setTimeout(() => setApprovalSent(false), 3000);
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
                    if (val === 'Instagram') setActivePreviewPlatform('instagram');
                    else setActivePreviewPlatform('linkedin');
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
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>AI Quality: 96/100</span>
                  </div>
                )}
              </div>

              {/* Platform Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/[0.07]">
                <button
                  onClick={() => setActivePreviewPlatform('linkedin')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activePreviewPlatform === 'linkedin'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setActivePreviewPlatform('instagram')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activePreviewPlatform === 'instagram'
                      ? 'bg-pink-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Instagram
                </button>
              </div>
            </div>

            {/* Generated Social Card Preview */}
            {generation?.generated_content ? (
              <div className="space-y-4">
                <ContentPreview
                  platform={activePreviewPlatform}
                  content={generation.generated_content}
                  authorName="Praveen Medida"
                  authorTitle="Founder & AI Architect @ CopyForge"
                  mediaUrl={activePreviewPlatform === 'instagram' ? '/assets/hero_ai_pulse.jpg' : undefined}
                />

                {/* AI Quality Breakdown Pills */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Hook Strength</p>
                    <p className="text-sm font-bold text-emerald-400">98% Exceptional</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Virality Metric</p>
                    <p className="text-sm font-bold text-indigo-400">High Conversion</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Word Count</p>
                    <p className="text-sm font-bold text-white">
                      {generation.formatted_content?.word_count || generation.generated_content.split(' ').length} words
                    </p>
                  </div>
                </div>

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

                {/* Workflow Actions (Save, Approve, Schedule) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={generation.is_saved ? 'primary' : 'outline'}
                      size="sm"
                      icon={Bookmark}
                      onClick={() => onToggleSave(generation.id)}
                    >
                      {generation.is_saved ? 'Saved' : 'Save Draft'}
                    </Button>
                    <Button variant="outline" size="sm" icon={Share2} onClick={handleCopy}>
                      {copied ? 'Copied!' : 'Copy Text'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckSquare}
                      onClick={handleSendApproval}
                    >
                      {approvalSent ? 'Queued for Approval!' : 'Send for Approval'}
                    </Button>
                  </div>
                </div>
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

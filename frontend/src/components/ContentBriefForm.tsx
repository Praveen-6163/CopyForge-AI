import React from 'react';
import { 
  Sparkles, Linkedin, Instagram, Mail, Twitter, Facebook, Globe,
  LayoutTemplate, AlertCircle, RotateCcw
} from 'lucide-react';
import { 
  GenerateRequest, PlatformType, ToneType, AudienceType, ObjectiveType, ContentType, PromptParameters
} from '../types/generation';
import { AdvancedControls } from './AdvancedControls';

interface ContentBriefFormProps {
  formData: GenerateRequest;
  setFormData: React.Dispatch<React.SetStateAction<GenerateRequest>>;
  onGenerate: () => void;
  isLoading: boolean;
  onOpenTemplates: () => void;
  onResetForm?: () => void;
}

const PLATFORMS: { id: PlatformType; label: string; icon: any; color: string }[] = [
  { id: 'LinkedIn', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400 border-blue-500/30' },
  { id: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400 border-pink-500/30' },
  { id: 'Email', label: 'Email', icon: Mail, color: 'text-amber-400 border-amber-500/30' },
  { id: 'X/Twitter', label: 'X / Twitter', icon: Twitter, color: 'text-sky-400 border-sky-500/30' },
  { id: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-indigo-400 border-indigo-500/30' },
  { id: 'Website', label: 'Website Page', icon: Globe, color: 'text-emerald-400 border-emerald-500/30' },
];

const TONES: { id: ToneType; label: string }[] = [
  { id: 'Professional', label: 'Professional' },
  { id: 'Friendly', label: 'Friendly' },
  { id: 'Witty', label: 'Witty' },
  { id: 'Persuasive', label: 'Persuasive' },
  { id: 'Premium', label: 'Premium' },
  { id: 'Casual', label: 'Casual' },
  { id: 'Inspirational', label: 'Inspirational' },
  { id: 'Technical', label: 'Technical' },
];

const AUDIENCES: AudienceType[] = [
  'General', 'Students', 'Developers', 'Professionals', 'Business Owners', 'Custom'
];

const OBJECTIVES: ObjectiveType[] = [
  'Product launch', 'Product promotion', 'Awareness', 'Engagement', 'Announcement', 'Educational'
];
const CONTENT_TYPES: ContentType[] = [
  'Social post', 'Carousel', 'Story', 'Reel script', 'Email newsletter', 'Video script', 'Ad copy'
];

export const ContentBriefForm: React.FC<ContentBriefFormProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading,
  onOpenTemplates,
  onResetForm,
}) => {
  const [customAudience, setCustomAudience] = React.useState('');

  const handleAudienceChange = (aud: string) => {
    if (aud === 'Custom') {
      setFormData((prev) => ({ ...prev, audience: customAudience || 'Custom' }));
    } else {
      setFormData((prev) => ({ ...prev, audience: aud }));
    }
  };

  const isFormValid =
    formData.product_name.trim().length > 0 &&
    formData.product_description.trim().length >= 5;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800">
      {/* Header & Template Preset Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Content Brief
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Define your product parameters and generation goals.</p>
        </div>
        <div className="flex items-center gap-2">
          {onResetForm && (
            <button
              type="button"
              onClick={onResetForm}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
              title="Clear brief form for a new generation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Brief</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenTemplates}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-brand-300 border border-brand-500/30 flex items-center gap-1.5 transition-all hover:border-brand-500/60"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Browse Templates</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) onGenerate(); }} className="space-y-5">
        {/* Product Name Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Product / Offer Name <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {formData.product_name.length} / 150
            </span>
          </div>
          <input
            type="text"
            required
            maxLength={150}
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            placeholder="e.g. CopyForge AI or DevShield Pro"
            className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Product Description */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Product Description & Core Value <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {formData.product_description.length} / 3000 chars
            </span>
          </div>
          <textarea
            required
            rows={4}
            maxLength={3000}
            value={formData.product_description}
            onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
            placeholder="Describe your product features, key problem solved, pricing, target benefit, or unique value proposition..."
            className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
          />
        </div>

        {/* Target Platform Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-200 block mb-2">
            Target Platform <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((plat) => {
              const Icon = plat.icon;
              const isSelected = formData.platform === plat.id;
              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: plat.id })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                    isSelected
                      ? `bg-slate-800/90 ${plat.color} border-brand-500 ring-1 ring-brand-500 shadow-md`
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{plat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-200 block mb-2">
            Tone of Voice <span className="text-rose-400">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => {
              const isSelected = formData.tone === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, tone: t.id })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm shadow-brand-500/20 font-semibold'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Audience & Objective */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1.5">Target Audience</label>
            <select
              value={AUDIENCES.includes(formData.audience as AudienceType) ? formData.audience : 'Custom'}
              onChange={(e) => handleAudienceChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {AUDIENCES.map((aud) => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1.5">Content Objective</label>
            <select
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value as ObjectiveType })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {OBJECTIVES.map((obj) => (
                <option key={obj} value={obj}>{obj}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Audience Input if Custom selected */}
        {formData.audience === 'Custom' || !AUDIENCES.includes(formData.audience as AudienceType) ? (
          <div>
            <input
              type="text"
              placeholder="Specify custom target audience (e.g. Senior Cloud Engineers)"
              value={customAudience || formData.audience}
              onChange={(e) => {
                setCustomAudience(e.target.value);
                setFormData({ ...formData, audience: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
            />
          </div>
        ) : null}

        <div>
          <label className="text-xs font-semibold text-slate-200 block mb-1.5">Content Type</label>
          <select
            value={formData.content_type}
            onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="text-xs font-semibold text-slate-200 block mb-1.5">
            Additional Instructions <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={formData.additional_instructions || ''}
            onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
            placeholder="e.g. Include 20% discount offer, mention 14-day refund policy..."
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Advanced Controls Accordion */}
        <AdvancedControls
          parameters={formData.parameters}
          onChange={(newParams) => setFormData({ ...formData, parameters: newParams })}
        />

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            !isFormValid || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple hover:from-brand-500 hover:to-accent-purple text-white shadow-brand-600/30 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Copy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span>Generate Copy for {formData.platform}</span>
            </>
          )}
        </button>

        {!isFormValid && (
          <p className="text-[11px] text-amber-400 flex items-center justify-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> Fill in Product Name and Description to generate.
          </p>
        )}
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Image, Wand2, Download, RefreshCw, Info, Layers } from 'lucide-react';
import { SectionHeader, GlassCard, Button, Badge, PageWrapper, EmptyState } from '../components/ui';

const STYLES = ['Professional Tech', 'Futuristic AI', 'Minimal', 'News Card', 'Infographic', 'Instagram Visual', 'LinkedIn Visual'];
const RATIOS = ['1:1', '4:5', '16:9', '9:16'];
const PLATFORMS_IMG = ['LinkedIn', 'Instagram', 'Both'];

interface ImageConfig {
  topic: string;
  description: string;
  style: string;
  platform: string;
  aspectRatio: string;
}

export const ImageStudioPage: React.FC = () => {
  const [config, setConfig] = useState<ImageConfig>({
    topic: '',
    description: '',
    style: 'Professional Tech',
    platform: 'LinkedIn',
    aspectRatio: '1:1',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (!config.topic.trim()) return;
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  const isValid = config.topic.trim().length > 0;

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Image className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Image Studio</h1>
          </div>
          <p className="text-sm text-slate-400">AI-generated visuals for your social content</p>
        </div>
      </div>

      {/* Integration Notice */}
      <div className="mb-6 p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400">
          Image generation requires an image AI API (e.g. DALL-E 3, Stable Diffusion, or Ideogram). 
          Configure your image generation provider in <span className="text-brand-300">Settings → AI Provider</span> to enable this feature.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Panel */}
        <GlassCard className="p-5">
          <SectionHeader title="Visual Configuration" subtitle="Define your image parameters" icon={Layers} />

          <div className="space-y-5">
            {/* Topic */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                Topic / Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={config.topic}
                onChange={e => setConfig({ ...config, topic: e.target.value })}
                placeholder="e.g. Gemini 2.0 Flash AI Model Release"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">Description</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={e => setConfig({ ...config, description: e.target.value })}
                placeholder="Describe the visual concept, mood, colors, or key elements..."
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            {/* Visual Style */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-2">Visual Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setConfig({ ...config, style })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                      config.style === style
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/50'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform & Ratio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-2">Platform</label>
                <div className="space-y-1.5">
                  {PLATFORMS_IMG.map(p => (
                    <button
                      key={p}
                      onClick={() => setConfig({ ...config, platform: p })}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                        config.platform === p
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500/50'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-2">Aspect Ratio</label>
                <div className="space-y-1.5">
                  {RATIOS.map(r => (
                    <button
                      key={r}
                      onClick={() => setConfig({ ...config, aspectRatio: r })}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                        config.aspectRatio === r
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                icon={Wand2}
                size="md"
                loading={isGenerating}
                disabled={!isValid}
                onClick={handleGenerate}
                className="flex-1"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
              {generated && (
                <Button variant="secondary" icon={RefreshCw} size="md" onClick={handleGenerate}>
                  Regen
                </Button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Preview Panel */}
        <GlassCard className="p-5">
          <SectionHeader title="Image Preview" subtitle="Generated visual output" icon={Image} />

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-72 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center animate-pulse">
                <Wand2 className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-200 mb-1">Generating Visual...</p>
                <p className="text-xs text-slate-500">Creating {config.style} style image for {config.platform}</p>
              </div>
            </div>
          ) : generated ? (
            <div className="space-y-4">
              {/* Placeholder visual */}
              <div
                className={`relative bg-gradient-to-br from-brand-900/50 via-slate-900 to-purple-900/50 border border-brand-500/20 rounded-xl overflow-hidden flex items-center justify-center ${
                  config.aspectRatio === '9:16' ? 'aspect-[9/16]' :
                  config.aspectRatio === '4:5' ? 'aspect-[4/5]' :
                  config.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'
                }`}
              >
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-brand-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-200 mb-1">{config.topic}</p>
                  <p className="text-xs text-slate-500">{config.style} · {config.aspectRatio}</p>
                  <Badge variant="warning" size="md">
                    Connect Image AI Provider to generate
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="secondary" icon={Download} size="sm" className="flex-1" disabled>
                  Download
                </Button>
                <Button variant="primary" size="sm" className="flex-1" disabled>
                  Use in Post
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="info">{config.style}</Badge>
                <Badge variant="default">{config.aspectRatio}</Badge>
                <Badge variant="purple">{config.platform}</Badge>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Image}
              title="No image generated yet"
              description="Configure your visual parameters and click Generate Image to create platform-ready visuals."
            />
          )}
        </GlassCard>
      </div>
    </PageWrapper>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  Send,
  Maximize2
} from 'lucide-react';
import { Button, Badge, Card, Input, Select } from '../components/ui';

export const ImageStudioPage: React.FC = () => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('Autonomous Multi-Agent Architecture');
  const [description, setDescription] = useState('Minimalist matte 3D geometric network sculpture on a deep dark charcoal studio background, cinematic lighting.');
  const [visualStyle, setVisualStyle] = useState('Professional Tech');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [platform, setPlatform] = useState('LinkedIn');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>('/assets/hero_ai_pulse.jpg');

  const styles = [
    'Professional Tech',
    'AI News',
    'Futuristic',
    'Minimal',
    'Editorial',
    'Infographic'
  ];

  const aspectRatios = [
    { label: '16:9 (Landscape / Hero)', value: '16:9' },
    { label: '1:1 (Square / Feed)', value: '1:1' },
    { label: '4:5 (Portrait / Instagram)', value: '4:5' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (visualStyle === 'Editorial' || visualStyle === 'Futuristic') {
        setGeneratedImage('/assets/trend_radar_art.jpg');
      } else if (visualStyle === 'AI News') {
        setGeneratedImage('/assets/ai_agent_sculpture.jpg');
      } else {
        setGeneratedImage('/assets/hero_ai_pulse.jpg');
      }
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Studio Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            VISUAL AI ENGINE
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Image Studio
            <Badge variant="warning">Sample assets</Badge>
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Preview bundled artwork by style. No image-generation provider is configured in this demo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => navigate('/studio')}
          >
            Go to Content Studio
          </Button>
        </div>
      </div>

      {/* ── Visual Studio Workspace ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Controls Column (4 cols) ─────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Visual Parameters
            </h3>

            {/* Topic */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Visual Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI Reasoning Engine"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Description / Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Detailed Visual Directive
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lighting, mood, materials, composition..."
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Visual Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Visual Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setVisualStyle(style)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      visualStyle === style
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-slate-900/80 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {aspectRatios.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full !py-3 font-bold"
              icon={Sparkles}
              loading={isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? 'Loading Sample...' : 'Preview Sample Visual'}
            </Button>
          </div>
        </div>

        {/* ── Large Central Visual Canvas (8 cols) ──────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400">CANVAS VIEW</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-semibold">{visualStyle}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">{aspectRatio}</span>
              </div>

              {generatedImage && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleGenerate}>
                    Change Sample
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={() => window.open(generatedImage, '_blank')}
                  >
                    Open Sample Image
                  </Button>
                </div>
              )}
            </div>

            {/* Central Artwork Canvas */}
            {generatedImage ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative group bg-slate-950 max-h-[520px] flex items-center justify-center">
                  <img
                    src={generatedImage}
                    alt={topic}
                    className="w-full h-full object-contain max-h-[500px] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{topic}</p>
                      <p className="text-xs text-slate-300 font-mono">Bundled sample artwork</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      iconRight={Send}
                      onClick={() => navigate('/studio')}
                    >
                      Use in Content
                    </Button>
                  </div>
                </div>

                {/* Preset Style Library Showcase */}
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Bundled Sample Artwork
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      onClick={() => setGeneratedImage('/assets/hero_ai_pulse.jpg')}
                      className="h-24 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-indigo-500 transition-all"
                    >
                      <img src="/assets/hero_ai_pulse.jpg" alt="Artwork 1" className="w-full h-full object-cover" />
                    </div>
                    <div 
                      onClick={() => setGeneratedImage('/assets/trend_radar_art.jpg')}
                      className="h-24 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-indigo-500 transition-all"
                    >
                      <img src="/assets/trend_radar_art.jpg" alt="Artwork 2" className="w-full h-full object-cover" />
                    </div>
                    <div 
                      onClick={() => setGeneratedImage('/assets/ai_agent_sculpture.jpg')}
                      className="h-24 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-indigo-500 transition-all"
                    >
                      <img src="/assets/ai_agent_sculpture.jpg" alt="Artwork 3" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Create the visual for your next idea.</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select a style to preview bundled artwork. Custom image generation is not configured.
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Copy, Download, Image as ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { generateImage } from '../services/platformApi';

export const ImageStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:5'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await generateImage(prompt, aspectRatio);
      setGeneratedImage(result.url);
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Image generation failed. Retry when the provider is available.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      if (!response.ok) throw new Error(`Image download failed (${response.status}).`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${topic.trim() || 'copyforge-image'}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Could not download the image.');
    }
  };

  const copyImageUrl = async () => {
    if (!generatedImage) return;
    try {
      await navigator.clipboard.writeText(generatedImage);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setError('Could not copy the image URL. Check clipboard permissions.');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            IMAGE GENERATION
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Image Studio
            <Badge variant="default">Backend provider</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Generated images are stored with your account in the backend database.
          </p>
        </div>
        <Button variant="outline" size="sm" iconRight={ArrowRight} onClick={() => navigate('/studio')}>
          Content Studio
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center justify-between gap-4">
          <span>{error}</span>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => void handleGenerate()} loading={isGenerating}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          className="lg:col-span-4 editorial-card rounded-2xl p-6 border border-white/10 space-y-5"
          onSubmit={(event) => { event.preventDefault(); void handleGenerate(); }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Image brief</h2>
          <label className="block space-y-1.5 text-xs text-slate-300">
            Topic
            <input
              required
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white"
              placeholder="What should the image communicate?"
            />
          </label>
          <label className="block space-y-1.5 text-xs text-slate-300">
            Image prompt
            <textarea
              required
              rows={7}
              maxLength={4000}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white"
              placeholder="Describe subject, composition, lighting, style, and any text to avoid."
            />
          </label>
          <label className="block space-y-1.5 text-xs text-slate-300">
            Aspect ratio
            <select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as typeof aspectRatio)} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Landscape (16:9)</option>
              <option value="4:5">Portrait (4:5)</option>
            </select>
          </label>
          <Button type="submit" variant="primary" size="lg" className="w-full" icon={Sparkles} loading={isGenerating}>
            {generatedImage ? 'Generate another image' : 'Generate image'}
          </Button>
        </form>

        <section className="lg:col-span-8 editorial-card rounded-2xl p-6 border border-white/10 min-h-[420px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <h2 className="text-xs font-mono font-bold text-indigo-400">GENERATED IMAGE</h2>
            {generatedImage && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={copiedUrl ? Check : Copy} onClick={() => void copyImageUrl()}>
                  {copiedUrl ? 'URL copied' : 'Copy URL'}
                </Button>
                <Button variant="secondary" size="sm" icon={Download} onClick={() => void downloadImage()}>
                  Download
                </Button>
              </div>
            )}
          </div>
          {generatedImage ? (
            <div className="pt-5 space-y-3">
              <img src={generatedImage} alt={topic} className="max-h-[600px] w-full rounded-xl object-contain bg-slate-950" />
              <p className="text-xs text-slate-400">{topic}</p>
            </div>
          ) : (
            <div className="py-24 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No image generated yet</h3>
              <p className="text-xs text-slate-400">
                Add an image brief and generate through the configured backend provider.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

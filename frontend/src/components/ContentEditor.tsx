import React, { useState } from 'react';
import { 
  Copy, Check, Download, Bookmark, Share2, RefreshCw, 
  Scissors, Maximize2, Sparkles, Terminal, FileText, CheckCircle2,
  AlertTriangle, Mail, Twitter, Instagram, ShieldAlert
} from 'lucide-react';
import { GenerationResponse, ToneType, PlatformType } from '../types/generation';
import { createPost } from '../services/platformApi';

interface ContentEditorProps {
  generation: GenerationResponse | null;
  isLoading: boolean;
  onRefine: (action: 'make_shorter' | 'make_longer' | 'enhance_persuasion' | 'change_tone' | 'change_platform', newTone?: ToneType, newPlatform?: PlatformType) => void;
  onRegenerate: () => void;
  onToggleSave: (id: string) => void;
  onViewCompiledPrompt: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  generation,
  isLoading,
  onRefine,
  onRegenerate,
  onToggleSave,
  onViewCompiledPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<ToneType>('Professional');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('LinkedIn');
  const [isSaved, setIsSaved] = useState(generation?.is_saved || false);
  const [queueBusy, setQueueBusy] = useState(false);
  const [queueMessage, setQueueMessage] = useState('');
  const [queueError, setQueueError] = useState('');

  React.useEffect(() => {
    if (generation) {
      setIsSaved(generation.is_saved);
      setSelectedTone(generation.tone);
      setSelectedPlatform(generation.platform);
    }
  }, [generation]);

  const handleCopy = () => {
    if (!generation) return;
    navigator.clipboard.writeText(generation.generated_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!generation) return;
    const blob = new Blob([generation.generated_content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CopyForge-${generation.product_name}-${generation.platform}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = () => {
    if (!generation) return;
    const content = `# ${generation.product_name} — ${generation.platform} Marketing Copy\n\n` +
      `**Tone**: ${generation.tone} | **Audience**: ${generation.audience} | **Objective**: ${generation.objective}\n\n` +
      `---\n\n${generation.generated_content}\n\n` +
      `*Generated via CopyForge AI*`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CopyForge-${generation.product_name}-${generation.platform}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleBookmark = () => {
    if (!generation) return;
    setIsSaved(!isSaved);
    onToggleSave(generation.id);
  };

  const addToQueue = async (mode: 'draft_only' | 'approval_required') => {
    if (!generation || !['LinkedIn', 'Instagram'].includes(generation.platform)) return;
    setQueueBusy(true);
    setQueueError('');
    setQueueMessage('');
    try {
      await createPost({
        topic: generation.product_name,
        description: generation.product_description,
        platform: generation.platform.toLowerCase() as 'linkedin' | 'instagram',
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
      setQueueMessage(mode === 'approval_required' ? 'Added to the approval queue.' : 'Saved as a draft.');
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setQueueError(detail || 'Could not save this content to your account.');
    } finally {
      setQueueBusy(false);
    }
  };

  const handleShare = () => {
    if (!generation) return;
    if (navigator.share) {
      navigator.share({
        title: `CopyForge AI: ${generation.product_name}`,
        text: generation.generated_content,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 h-full flex flex-col items-center justify-center min-h-[500px] border border-slate-800">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center animate-pulse shadow-xl shadow-brand-500/30">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Transforming Copy...</h3>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Compiling dynamic prompt, enforcing platform rules, and evaluating output validation checks.
        </p>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="glass-panel rounded-2xl p-8 h-full flex flex-col items-center justify-center min-h-[500px] border border-slate-800 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-400 mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Generated Content Output</h3>
        <p className="text-xs text-slate-400 max-w-md mb-6">
          Fill in your content brief on the left panel and click <strong className="text-slate-200">Generate Copy</strong> to compile marketing text tailored for your selected platform.
        </p>
      </div>
    );
  }

  const { formatted_content, platform_validation } = generation;
  const isEmail = generation.platform === 'Email' && formatted_content.email_data;
  const isTwitter = generation.platform === 'X/Twitter';
  const twitterChars = formatted_content.twitter_char_count || formatted_content.char_count;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800 flex flex-col justify-between min-h-[500px]">
      <div>
        {/* Editor Top Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-semibold text-xs border border-brand-500/30">
              {generation.platform}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30">
              {generation.tone} Tone
            </span>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onViewCompiledPrompt}
              title="Inspect Compiled Dynamic Prompt"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-xs flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Inspect Prompt</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              title="Bookmark Copy"
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={handleCopy}
              title="Copy Content"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              title="Download TXT"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-xs"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              title="Share"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-xs"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Platform Specific Display Cards */}
        {isEmail ? (
          <div className="space-y-3 mb-5">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-amber-400" /> Subject Line
              </div>
              <p className="text-sm font-semibold text-slate-100">{formatted_content.email_data?.subject}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Preview Text</div>
              <p className="text-xs text-slate-300">{formatted_content.email_data?.preview_text}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Email Body</div>
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {formatted_content.email_data?.body}
              </div>
            </div>
          </div>
        ) : isTwitter ? (
          <div className="mb-5">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner relative">
              <div className="flex items-center gap-2 mb-3">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-300">X / Twitter Preview</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                {generation.generated_content}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Character Usage:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                  twitterChars <= 280 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {twitterChars} / 280 limit
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5 min-h-[220px]">
            <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
              {generation.generated_content}
            </p>
          </div>
        )}

        {/* Validation & Rules Bar */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-5 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-400" /> Backend Output Validation:
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {formatted_content.word_count} words | {formatted_content.char_count} chars
            </span>
          </div>

          {['LinkedIn', 'Instagram'].includes(generation.platform) && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void addToQueue('approval_required')}
                disabled={queueBusy}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-xs text-white font-semibold"
              >
                {queueBusy ? 'Saving…' : 'Send to Approval Queue'}
              </button>
              <button
                type="button"
                onClick={() => void addToQueue('draft_only')}
                disabled={queueBusy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-xs text-slate-200 border border-slate-700"
              >
                Save Draft
              </button>
              {queueMessage && <span role="status" className="text-xs text-emerald-300">{queueMessage}</span>}
              {queueError && <span role="alert" className="text-xs text-rose-300">{queueError}</span>}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {platform_validation.passed_rules.map((rule, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {rule}
              </span>
            ))}
            {platform_validation.warnings.map((warn, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {warn}
              </span>
            ))}
          </div>
        </div>

        {/* Refinement Actions Toolbar */}
        <div className="pt-4 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-300 block mb-2">Refine & Transform Content</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onRefine('make_shorter')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Make Shorter</span>
            </button>

            <button
              onClick={() => onRefine('make_longer')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Make Longer</span>
            </button>

            <button
              onClick={() => onRefine('enhance_persuasion')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Enhance Persuasion</span>
            </button>

            <button
              onClick={onRegenerate}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-brand-300 border border-brand-500/30 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Mic2, Sparkles, Tag, Users, X, Plus } from 'lucide-react';
import {
  SectionHeader, GlassCard, Button, Badge, useToast, ToastContainer, PageWrapper
} from '../components/ui';
import { AIVoiceProfile } from '../types/platform';
import { DEMO_AI_VOICE } from '../services/platformData';

const TONE_OPTIONS = ['Professional', 'Friendly', 'Educational', 'Technical', 'Bold', 'Minimal', 'Inspirational', 'Conversational'];
const STYLE_OPTIONS = ['Clear & Concise', 'Story-Driven', 'Data-Backed', 'Opinion-Led', 'How-To / Tutorial', 'Thread-Format'];

export const AIVoicePage: React.FC = () => {
  const [voice, setVoice] = useState<AIVoiceProfile>({ ...DEMO_AI_VOICE, samplePost: '' });
  const [newTopic, setNewTopic] = useState('');
  const [newWord, setNewWord] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const { toasts, show, dismiss } = useToast();

  const addTopic = () => {
    if (newTopic.trim()) {
      setVoice(v => ({ ...v, topics: [...v.topics, newTopic.trim()] }));
      setNewTopic('');
    }
  };

  const removeTopic = (t: string) => setVoice(v => ({ ...v, topics: v.topics.filter(x => x !== t) }));

  const addWord = () => {
    if (newWord.trim()) {
      setVoice(v => ({ ...v, wordsToAvoid: [...v.wordsToAvoid, newWord.trim()] }));
      setNewWord('');
    }
  };

  const removeWord = (w: string) => setVoice(v => ({ ...v, wordsToAvoid: v.wordsToAvoid.filter(x => x !== w) }));

  const addHashtag = () => {
    const tag = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
    if (newHashtag.trim()) {
      setVoice(v => ({ ...v, preferredHashtags: [...v.preferredHashtags, tag] }));
      setNewHashtag('');
    }
  };

  const removeHashtag = (h: string) => setVoice(v => ({ ...v, preferredHashtags: v.preferredHashtags.filter(x => x !== h) }));

  const generateSample = () => {
    setIsGeneratingSample(true);
    setTimeout(() => {
      setVoice(v => ({
        ...v,
        samplePost: `🚀 Generative AI isn't just a trend — it's a fundamental shift in how we build software.\n\nHere's what most developers are missing:\n\n• AI Agents can now handle end-to-end workflows autonomously\n• RAG pipelines make LLMs context-aware and accurate\n• Fine-tuning isn't always necessary — smart prompting often wins\n\nThe engineers who will thrive in 2026 aren't the ones who fear AI — they're the ones building with it.\n\nWhat are you shipping with AI this month? 👇\n\n#GenerativeAI #AIDevs #MachineLearning #OpenSource`
      }));
      setIsGeneratingSample(false);
      show('success', 'Sample post generated using your AI Voice profile!');
    }, 2000);
  };

  const handleSave = () => {
    show('success', 'AI Voice profile saved! This will be used for all future content generation.');
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mic2 className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Voice</h1>
          </div>
          <p className="text-sm text-slate-400">Define your personal content style for AI-generated posts</p>
        </div>
        <Button variant="primary" icon={Sparkles} size="sm" onClick={handleSave}>
          Save Voice Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Writing Style */}
          <GlassCard className="p-5">
            <SectionHeader title="Writing Style" icon={Mic2} />
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Style Description</label>
              <textarea
                rows={3}
                value={voice.writingStyle}
                onChange={e => setVoice({ ...voice, writingStyle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                placeholder="Describe your writing style..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Style Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setVoice({ ...voice, writingStyle: s })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                      voice.writingStyle === s
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Tone */}
          <GlassCard className="p-5">
            <SectionHeader title="Preferred Tone" />
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setVoice({ ...voice, preferredTone: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    voice.preferredTone === t
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-transparent'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Audience */}
          <GlassCard className="p-5">
            <SectionHeader title="Target Audience" icon={Users} />
            <input
              type="text"
              value={voice.audience}
              onChange={e => setVoice({ ...voice, audience: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="e.g. Developers, AI practitioners, and tech professionals"
            />
          </GlassCard>

          {/* CTA Style */}
          <GlassCard className="p-5">
            <SectionHeader title="CTA Style" subtitle="Call-to-action preference" />
            <input
              type="text"
              value={voice.ctaStyle}
              onChange={e => setVoice({ ...voice, ctaStyle: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="e.g. Question-based to drive comments"
            />
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Topics */}
          <GlassCard className="p-5">
            <SectionHeader title="Preferred Topics" icon={Tag} />
            <div className="flex flex-wrap gap-2 mb-3">
              {voice.topics.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs">
                  {t}
                  <button onClick={() => removeTopic(t)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTopic()}
                placeholder="Add a topic..."
                className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <Button variant="secondary" icon={Plus} size="xs" onClick={addTopic}>Add</Button>
            </div>
          </GlassCard>

          {/* Words to Avoid */}
          <GlassCard className="p-5">
            <SectionHeader title="Words to Avoid" subtitle="AI will avoid these in your posts" />
            <div className="flex flex-wrap gap-2 mb-3">
              {voice.wordsToAvoid.map(w => (
                <span key={w} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs">
                  {w}
                  <button onClick={() => removeWord(w)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWord()}
                placeholder="Add a word..."
                className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <Button variant="secondary" icon={Plus} size="xs" onClick={addWord}>Add</Button>
            </div>
          </GlassCard>

          {/* Hashtags */}
          <GlassCard className="p-5">
            <SectionHeader title="Preferred Hashtags" />
            <div className="flex flex-wrap gap-2 mb-3">
              {voice.preferredHashtags.map(h => (
                <span key={h} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs">
                  {h}
                  <button onClick={() => removeHashtag(h)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newHashtag}
                onChange={e => setNewHashtag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHashtag()}
                placeholder="#GenerativeAI"
                className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <Button variant="secondary" icon={Plus} size="xs" onClick={addHashtag}>Add</Button>
            </div>
          </GlassCard>

          {/* Sample Post Generator */}
          <GlassCard className="p-5 border-brand-500/30">
            <SectionHeader title="Sample Post Preview" subtitle="Generate a post using your AI Voice" icon={Sparkles} />
            {voice.samplePost ? (
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 mb-4">
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{voice.samplePost}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mb-4">Click below to generate a sample post using your voice profile settings.</p>
            )}
            <Button
              variant="primary"
              icon={Sparkles}
              size="sm"
              loading={isGeneratingSample}
              onClick={generateSample}
            >
              {isGeneratingSample ? 'Generating...' : 'Generate Sample Post'}
            </Button>
          </GlassCard>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageWrapper>
  );
};

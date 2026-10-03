import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ChevronRight, Database, Key, Brain, FileText,
  Server, Plug, LogOut, Trash2, Lock, Mail, ArrowLeft,
  Sparkles, ExternalLink, Users, Eye
} from 'lucide-react';

// ─── Section Data ────────────────────────────────────────────────────────────
const TOC_SECTIONS = [
  { id: 'overview',          label: 'Overview',                   icon: Eye },
  { id: 'data-collection',   label: 'Data We Collect',            icon: Database },
  { id: 'oauth',             label: 'OAuth Authentication',        icon: Key },
  { id: 'access-tokens',     label: 'Access Tokens',              icon: Lock },
  { id: 'ai-generation',     label: 'AI Content Generation',      icon: Brain },
  { id: 'user-content',      label: 'User-Generated Content',     icon: FileText },
  { id: 'data-storage',      label: 'Data Storage',               icon: Server },
  { id: 'third-party',       label: 'Third-Party APIs',           icon: Plug },
  { id: 'disconnection',     label: 'Account Disconnection',      icon: LogOut },
  { id: 'data-deletion',     label: 'Data Deletion',              icon: Trash2 },
  { id: 'security',          label: 'Security',                   icon: Shield },
  { id: 'contact',           label: 'Contact Us',                 icon: Mail },
];

// ─── Shared sub-components ────────────────────────────────────────────────────
const SectionHeading: React.FC<{
  id: string;
  icon: React.ElementType;
  title: string;
  gradient: string;
}> = ({ id, icon: Icon, title, gradient }) => (
  <div id={id} className="flex items-center gap-3 mb-5 scroll-mt-24">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
  </div>
);

const InfoCard: React.FC<{ children: React.ReactNode; accent?: string }> = ({
  children, accent = 'border-brand-500/40',
}) => (
  <div className={`rounded-xl bg-slate-900/60 border ${accent} p-5 mb-4 backdrop-blur-sm`}>
    {children}
  </div>
);

const BulletList: React.FC<{ items: string[]; color?: string }> = ({
  items, color = 'bg-brand-400',
}) => (
  <ul className="space-y-2.5 mt-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed">
        <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${color}`} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-brand-300 font-semibold">{children}</span>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState('overview');
  const [scrolled, setScrolled] = React.useState(false);

  const EFFECTIVE_DATE = 'October 3, 2026';
  const COMPANY_EMAIL  = 'privacy@copyforge.ai';
  const APP_URL        = 'https://copyforge.ai';

  // Sticky header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    TOC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased">

      {/* ── Sticky Top Bar ───────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0b0f19]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
            aria-label="Back to CopyForge AI"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">CopyForge AI</span>
              <p className="text-[10px] text-slate-400 leading-none">Tone Transformer</p>
            </div>
          </button>

          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
        </div>
      </header>

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[100px]" />
          <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            Legal Document
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-gradient">Privacy Policy</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            At <span className="text-white font-semibold">CopyForge AI</span>, your privacy is a first-class priority.
            This policy explains what data we collect, how we use it, and the controls you have.
          </p>

          {/* Meta chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: `Effective: ${EFFECTIVE_DATE}`, color: 'bg-slate-800 border-slate-700 text-slate-300' },
              { label: 'GDPR Aligned',    color: 'bg-emerald-900/30 border-emerald-600/40 text-emerald-300' },
              { label: 'CCPA Compliant',  color: 'bg-blue-900/30 border-blue-600/40 text-blue-300' },
              { label: 'No Data Selling', color: 'bg-purple-900/30 border-purple-600/40 text-purple-300' },
            ].map(({ label, color }) => (
              <span key={label} className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content + Sidebar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex gap-10 items-start">

          {/* ── Table of Contents (sticky sidebar) ─────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 px-1">
                Contents
              </p>
              <nav className="space-y-0.5">
                {TOC_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                      activeSection === id
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                    {activeSection === id && (
                      <ChevronRight className="w-3 h-3 ml-auto text-brand-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                  Questions? Email us at{' '}
                  <a
                    href={`mailto:${COMPANY_EMAIL}`}
                    className="text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    {COMPANY_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* ── Policy Content ───────────────────────────────────────────── */}
          <article className="flex-1 min-w-0 space-y-12">

            {/* ── 1. Overview ─────────────────────────────────── */}
            <section>
              <SectionHeading
                id="overview"
                icon={Eye}
                title="Overview"
                gradient="bg-gradient-to-br from-brand-600 to-indigo-600"
              />
              <InfoCard>
                <p className="text-slate-300 text-sm leading-relaxed">
                  This Privacy Policy applies to <Highlight>CopyForge AI</Highlight> (the "Service"), an AI-powered
                  copywriting and tone-transformation platform accessible at{' '}
                  <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                    className="text-brand-400 hover:underline inline-flex items-center gap-1">
                    {APP_URL} <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed mt-3">
                  By using CopyForge AI, you agree to the collection and use of information in accordance with this
                  policy. We do not sell, rent, or trade your personal data to third parties. We are committed to
                  transparency about our data practices.
                </p>
              </InfoCard>
              <InfoCard accent="border-amber-500/30">
                <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  ⚠ Important Notice
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  CopyForge AI integrates with third-party social platforms (LinkedIn, Instagram) via OAuth.
                  When you connect these accounts, we handle access tokens strictly in accordance with the
                  respective platform's terms of service. <Highlight>We never post on your behalf without explicit action.</Highlight>
                </p>
              </InfoCard>
            </section>

            {/* ── 2. Data We Collect ───────────────────────────── */}
            <section>
              <SectionHeading
                id="data-collection"
                icon={Database}
                title="Data We Collect"
                gradient="bg-gradient-to-br from-cyan-600 to-blue-600"
              />
              <InfoCard accent="border-cyan-500/30">
                <p className="text-slate-300 text-sm font-medium mb-1">
                  We collect only what is necessary to provide the Service:
                </p>
                <BulletList color="bg-cyan-400" items={[
                  'Account identifiers (e.g., username, profile name) from connected social platforms during OAuth sign-in.',
                  'Content brief inputs: product name, description, target audience, platform, tone, objective, and any additional instructions you provide.',
                  'AI-generated output content and associated metadata (platform, tone, word count, character count, timestamps).',
                  'Prompt parameters you configure (temperature, top-p, max tokens).',
                  'Generation history and saved copies stored in our local database for your session.',
                  'Aggregated, anonymised usage analytics (e.g., feature usage frequency) to improve the Service.',
                  'Browser and device metadata (user-agent, viewport) for compatibility and security logging.',
                ]} />
              </InfoCard>
              <InfoCard accent="border-emerald-500/30">
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  ✓ What We Do NOT Collect
                </p>
                <BulletList color="bg-emerald-400" items={[
                  'Passwords — authentication is delegated entirely to OAuth providers.',
                  'Payment or financial information.',
                  'Biometric data of any kind.',
                  'Real-time location data.',
                  'Private messages or direct messages from connected platforms.',
                  'Data from social platforms beyond what is explicitly requested during OAuth consent.',
                ]} />
              </InfoCard>
            </section>

            {/* ── 3. OAuth Authentication ──────────────────────── */}
            <section>
              <SectionHeading
                id="oauth"
                icon={Key}
                title="LinkedIn & Instagram OAuth Authentication"
                gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              />
              <InfoCard accent="border-blue-500/30">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  CopyForge AI uses <Highlight>OAuth 2.0</Highlight> to allow you to connect your LinkedIn and
                  Instagram accounts. This industry-standard protocol lets you grant us limited, revocable
                  access without ever sharing your password.
                </p>
                <p className="text-sm font-semibold text-slate-200 mb-2">How the OAuth flow works:</p>
                <ol className="space-y-3 text-sm text-slate-300">
                  {[
                    'You click "Connect LinkedIn" or "Connect Instagram" in the CopyForge AI interface.',
                    "You are redirected to the platform's official login and consent page (hosted by LinkedIn/Meta).",
                    'You review and approve the specific permissions requested (read profile, post content).',
                    "The platform issues a short-lived authorization code to CopyForge AI's server.",
                    'Our server exchanges the code for access and refresh tokens, which are stored securely.',
                    'CopyForge AI uses these tokens only to perform actions you explicitly initiate.',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </InfoCard>
              <InfoCard accent="border-slate-600/60">
                <p className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> Permissions We Request
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { platform: 'LinkedIn', perms: ['r_liteprofile – Read basic profile info', 'r_emailaddress – Read email address', 'w_member_social – Post on your behalf (only when you click "Publish")'] },
                    { platform: 'Instagram', perms: ['instagram_basic – Read public profile', 'pages_show_list – List connected Facebook pages', 'instagram_content_publish – Publish content (only on explicit request)'] },
                  ].map(({ platform, perms }) => (
                    <div key={platform} className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3">
                      <p className="text-xs font-bold text-slate-300 mb-2">{platform}</p>
                      <BulletList color="bg-blue-400" items={perms} />
                    </div>
                  ))}
                </div>
              </InfoCard>
            </section>

            {/* ── 4. Access Tokens ─────────────────────────────── */}
            <section>
              <SectionHeading
                id="access-tokens"
                icon={Lock}
                title="Access Tokens"
                gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              />
              <InfoCard accent="border-purple-500/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  OAuth access tokens are <Highlight>sensitive credentials</Highlight> that grant limited access to
                  your social accounts. We handle them with the following safeguards:
                </p>
                <BulletList color="bg-purple-400" items={[
                  'Tokens are encrypted at rest using AES-256 encryption before being stored in our database.',
                  'Tokens are transmitted only over encrypted HTTPS connections (TLS 1.2+).',
                  'Tokens are never included in client-side JavaScript bundles, API responses, logs, or error messages.',
                  'Tokens are stored server-side only — your browser never receives the raw token.',
                  'Short-lived access tokens are automatically refreshed using refresh tokens before expiry.',
                  'Tokens are scoped to the minimum permissions required for the requested functionality.',
                  'We immediately invalidate tokens upon account disconnection or deletion request.',
                ]} />
              </InfoCard>
              <InfoCard accent="border-rose-500/30">
                <p className="text-rose-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  🔒 Zero Client Exposure Policy
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  CopyForge AI enforces a <Highlight>zero client exposure policy</Highlight> — access tokens
                  are never sent to your browser, never embedded in frontend code, and never logged to console
                  or analytics systems. All token operations happen exclusively in our secured backend environment.
                </p>
              </InfoCard>
            </section>

            {/* ── 5. AI Content Generation ─────────────────────── */}
            <section>
              <SectionHeading
                id="ai-generation"
                icon={Brain}
                title="AI Content Generation"
                gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
              />
              <InfoCard accent="border-emerald-500/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  CopyForge AI uses <Highlight>OpenAI's API</Highlight> (GPT models) to generate marketing copy
                  based on your content brief inputs. Here's how this works and what it means for your privacy:
                </p>
                <BulletList color="bg-emerald-400" items={[
                  "Your content brief (product name, description, platform, tone, audience, objective) is sent to OpenAI's API to generate a response.",
                  'Prompts are compiled server-side and include only the information you explicitly provided in the form.',
                  'CopyForge AI does not send personal identifiable information (PII) to OpenAI unless you include it in your brief.',
                  'OpenAI processes your requests under their own privacy policy and API usage terms.',
                  'Generated content is stored in our local SQLite database attributed to your session.',
                  'Your generation history is used solely to provide the History and Saved Copies features within the app.',
                  'We do not use your generation history to train our own models or share it with third parties.',
                ]} />
              </InfoCard>
              <InfoCard accent="border-teal-500/30">
                <p className="text-sm font-semibold text-slate-200 mb-2">OpenAI Data Processing</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  By using CopyForge AI, you acknowledge that your prompt data is processed by OpenAI. OpenAI's
                  API usage policies apply to this processing. You can review OpenAI's privacy practices at{' '}
                  <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1">
                    openai.com/policies/privacy-policy <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
              </InfoCard>
            </section>

            {/* ── 6. User-Generated Content ────────────────────── */}
            <section>
              <SectionHeading
                id="user-content"
                icon={FileText}
                title="User-Generated Content"
                gradient="bg-gradient-to-br from-amber-600 to-orange-600"
              />
              <InfoCard accent="border-amber-500/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Content you create using CopyForge AI — including your content briefs, AI-generated copy, saved
                  posts, and any edits — is considered <Highlight>User-Generated Content (UGC)</Highlight>.
                </p>
                <BulletList color="bg-amber-400" items={[
                  'You retain full ownership of all content you create using CopyForge AI.',
                  'CopyForge AI does not claim any intellectual property rights over your generated content.',
                  'Content is stored to provide the History and Saved Copies features.',
                  'Content is not shared with other users, third parties, or used in advertising without your consent.',
                  'You may export, copy, or delete your content at any time through the application interface.',
                  "If you choose to publish content to LinkedIn or Instagram using CopyForge AI, that content is then subject to those platforms' terms.",
                ]} />
              </InfoCard>
            </section>

            {/* ── 7. Data Storage ──────────────────────────────── */}
            <section>
              <SectionHeading
                id="data-storage"
                icon={Server}
                title="Data Storage"
                gradient="bg-gradient-to-br from-slate-600 to-slate-500"
              />
              <InfoCard accent="border-slate-600/60">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  CopyForge AI stores data in the following systems:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: 'SQLite Database (Primary)',
                      desc: 'Stores your generation history, saved copies, prompt parameters, and metadata. This database is hosted on our secure backend server.',
                      color: 'border-slate-600 bg-slate-800/60',
                      badge: 'Server-Side',
                      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    },
                    {
                      name: 'Session Storage (Browser)',
                      desc: "Temporary form state and UI preferences stored in your browser's session storage. Cleared when you close the browser tab.",
                      color: 'border-slate-700 bg-slate-800/40',
                      badge: 'Client-Side',
                      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    },
                    {
                      name: 'Encrypted Token Store',
                      desc: 'OAuth access tokens and refresh tokens, encrypted using AES-256 and stored separately from other user data on our secured backend.',
                      color: 'border-purple-700/40 bg-purple-900/20',
                      badge: 'Encrypted',
                      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                    },
                  ].map(({ name, desc, color, badge, badgeColor }) => (
                    <div key={name} className={`rounded-lg border p-4 ${color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-200">{name}</p>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>{badge}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>
              <InfoCard accent="border-blue-500/30">
                <p className="text-sm font-semibold text-slate-200 mb-2">Data Retention</p>
                <BulletList color="bg-blue-400" items={[
                  'Generation history is retained indefinitely unless you manually delete individual entries or request full data deletion.',
                  'OAuth tokens are deleted immediately upon account disconnection or user deletion request.',
                  'Anonymised analytics data may be retained for up to 12 months for service improvement purposes.',
                  'Backup copies of the database are retained for up to 30 days for disaster recovery purposes.',
                ]} />
              </InfoCard>
            </section>

            {/* ── 8. Third-Party APIs ───────────────────────────── */}
            <section>
              <SectionHeading
                id="third-party"
                icon={Plug}
                title="Third-Party APIs & Services"
                gradient="bg-gradient-to-br from-pink-600 to-rose-600"
              />
              <InfoCard accent="border-pink-500/30">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  CopyForge AI integrates with several third-party services. Below is a summary of each:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: 'OpenAI',
                      purpose: 'AI content generation (GPT models)',
                      data: 'Content briefs (product details, tone, platform, audience, objective)',
                      policy: 'https://openai.com/policies/privacy-policy',
                      color: 'border-emerald-600/30 bg-emerald-900/15',
                    },
                    {
                      name: 'LinkedIn (Microsoft)',
                      purpose: 'OAuth authentication & content publishing',
                      data: 'Profile info (name, email, profile photo URL). OAuth tokens stored server-side.',
                      policy: 'https://www.linkedin.com/legal/privacy-policy',
                      color: 'border-blue-600/30 bg-blue-900/15',
                    },
                    {
                      name: 'Meta (Instagram)',
                      purpose: 'OAuth authentication & content publishing',
                      data: 'Basic public profile info. OAuth tokens stored server-side.',
                      policy: 'https://privacycenter.instagram.com/policy',
                      color: 'border-pink-600/30 bg-pink-900/15',
                    },
                  ].map(({ name, purpose, data, policy, color }) => (
                    <div key={name} className={`rounded-lg border p-4 ${color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-200">{name}</p>
                        <a href={policy} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                          Privacy Policy <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400"><span className="text-slate-300 font-medium">Purpose:</span> {purpose}</p>
                      <p className="text-xs text-slate-400 mt-0.5"><span className="text-slate-300 font-medium">Data Shared:</span> {data}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>
              <InfoCard accent="border-rose-500/30">
                <p className="text-rose-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  🔗 Third-Party Responsibility
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  CopyForge AI is not responsible for the privacy practices of third-party services. We encourage
                  you to review the privacy policies of LinkedIn, Meta (Instagram), and OpenAI directly. Data
                  processed by these platforms is subject to their respective terms.
                </p>
              </InfoCard>
            </section>

            {/* ── 9. Account Disconnection ─────────────────────── */}
            <section>
              <SectionHeading
                id="disconnection"
                icon={LogOut}
                title="Account Disconnection"
                gradient="bg-gradient-to-br from-orange-600 to-amber-600"
              />
              <InfoCard accent="border-orange-500/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  You can disconnect your LinkedIn or Instagram account from CopyForge AI at any time via the
                  <Highlight> Settings & API Key</Highlight> panel in the sidebar. When you disconnect:
                </p>
                <BulletList color="bg-orange-400" items={[
                  'Your OAuth access token and refresh token are immediately deleted from our systems.',
                  'CopyForge AI loses all ability to authenticate with the disconnected platform on your behalf.',
                  'Your generation history and saved copies are not deleted — only the social connection is removed.',
                  'You may reconnect the account at any time by going through the OAuth flow again.',
                  "Revoking access from within LinkedIn/Instagram settings will also immediately invalidate our tokens.",
                ]} />
              </InfoCard>
              <InfoCard accent="border-amber-500/30">
                <p className="text-sm font-semibold text-slate-200 mb-2">Revoking from Platform Settings</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  You can also revoke CopyForge AI's access directly from your social platform settings:
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-20 text-slate-300 font-medium">LinkedIn:</span>
                    <a href="https://www.linkedin.com/psettings/permitted-services" target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1">
                      linkedin.com/psettings/permitted-services <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-20 text-slate-300 font-medium">Instagram:</span>
                    <a href="https://www.instagram.com/accounts/manage_access/" target="_blank" rel="noopener noreferrer"
                      className="text-pink-400 hover:underline flex items-center gap-1">
                      instagram.com/accounts/manage_access <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </InfoCard>
            </section>

            {/* ── 10. Data Deletion ─────────────────────────────── */}
            <section>
              <SectionHeading
                id="data-deletion"
                icon={Trash2}
                title="Data Deletion"
                gradient="bg-gradient-to-br from-red-600 to-rose-600"
              />
              <InfoCard accent="border-red-500/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  You have the right to request deletion of all data CopyForge AI holds about you.
                  We honour deletion requests within <Highlight>30 days</Highlight>.
                </p>
                <BulletList color="bg-red-400" items={[
                  'In-app deletion: Delete individual generation history entries from the History panel at any time.',
                  'Full data deletion: Email us at privacy@copyforge.ai with subject line "Data Deletion Request" and your account identifier.',
                  'Upon receiving a verified deletion request, we will delete all personal data, generation history, saved copies, and OAuth tokens associated with your account.',
                  'Anonymised, aggregated analytics data that cannot be linked back to you is exempt from deletion.',
                  'Backup data is purged within 30 days of the primary deletion, aligned with our backup retention schedule.',
                ]} />
              </InfoCard>
              <InfoCard accent="border-slate-600/60">
                <p className="text-sm font-semibold text-slate-200 mb-2">
                  Rights Under Privacy Regulations
                </p>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  Depending on your jurisdiction, you may have additional rights including:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Right to access your data',
                    'Right to correct inaccurate data',
                    'Right to restrict processing',
                    'Right to data portability',
                    'Right to object to processing',
                    'Right to withdraw consent',
                  ].map((right) => (
                    <div key={right} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {right}
                    </div>
                  ))}
                </div>
              </InfoCard>
            </section>

            {/* ── 11. Security ───────────────────────────────────── */}
            <section>
              <SectionHeading
                id="security"
                icon={Shield}
                title="Security"
                gradient="bg-gradient-to-br from-brand-600 to-purple-600"
              />
              <InfoCard accent="border-brand-500/30">
                <p className="text-slate-300 text-sm leading-relaxed">
                  We implement industry-standard security measures to protect your data against unauthorised access,
                  alteration, disclosure, or destruction:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {[
                    { label: 'TLS 1.2+ Encryption', desc: 'All data in transit is encrypted using TLS.' },
                    { label: 'AES-256 at Rest',      desc: 'Sensitive data (tokens) encrypted at rest.' },
                    { label: 'HTTPS Only',            desc: 'The app enforces HTTPS for all connections.' },
                    { label: 'API Key Isolation',     desc: 'API keys live only in server environment variables.' },
                    { label: 'Input Validation',      desc: 'All inputs are sanitised to prevent injection attacks.' },
                    { label: 'Rate Limiting',         desc: 'API endpoints are rate-limited to prevent abuse.' },
                    { label: 'CORS Policies',         desc: 'Strict CORS rules restrict cross-origin requests.' },
                    { label: 'Audit Logging',         desc: 'Security events are logged for anomaly detection.' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-3">
                      <p className="text-xs font-bold text-brand-300 mb-1">{label}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>
              <InfoCard accent="border-amber-500/30">
                <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  ⚠ Security Breach Notification
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  In the event of a data breach that affects your personal data, we will notify you and relevant
                  authorities within <Highlight>72 hours</Highlight> of becoming aware of the breach, in accordance
                  with GDPR Article 33. Notifications will be sent to the email address associated with your account.
                </p>
              </InfoCard>
            </section>

            {/* ── 12. Contact ────────────────────────────────────── */}
            <section>
              <SectionHeading
                id="contact"
                icon={Mail}
                title="Contact Us"
                gradient="bg-gradient-to-br from-teal-600 to-cyan-600"
              />
              <InfoCard accent="border-teal-500/30">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle
                  your data, please reach out to us:
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Privacy Inquiries',      value: COMPANY_EMAIL,          link: `mailto:${COMPANY_EMAIL}` },
                    { label: 'General Support',        value: 'support@copyforge.ai', link: 'mailto:support@copyforge.ai' },
                    { label: 'Data Deletion Requests', value: COMPANY_EMAIL,          link: `mailto:${COMPANY_EMAIL}?subject=Data%20Deletion%20Request` },
                    { label: 'Website',                value: APP_URL,                link: APP_URL },
                  ].map(({ label, value, link }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">{label}</span>
                      <a href={link} target={link.startsWith('mailto') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center gap-1">
                        {value}
                        {!link.startsWith('mailto') && <ExternalLink className="w-3 h-3" />}
                      </a>
                    </div>
                  ))}
                </div>
              </InfoCard>
              <InfoCard accent="border-slate-700/60">
                <p className="text-slate-400 text-xs leading-relaxed">
                  We aim to respond to all privacy-related inquiries within <Highlight>5 business days</Highlight>.
                  For GDPR-related Data Subject Requests, we will respond within <Highlight>30 days</Highlight> as
                  required by law.
                </p>
              </InfoCard>
            </section>

            {/* ── Policy Footer ──────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-r from-brand-900/30 via-slate-900/50 to-purple-900/30 border border-slate-800/80 p-6 text-center">
              <p className="text-slate-400 text-sm">
                This Privacy Policy was last updated on{' '}
                <span className="text-white font-semibold">{EFFECTIVE_DATE}</span>.
                We reserve the right to update this policy periodically. Material changes will be communicated
                via email or a prominent notice in the application.
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to CopyForge AI
                </button>
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Mail className="w-4 h-4" />
                  Contact Privacy Team
                </a>
              </div>
            </div>

          </article>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 bg-slate-950/60 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">CopyForge AI</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CopyForge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-300 transition-colors">Privacy Policy</button>
            <span>·</span>
            <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-slate-300 transition-colors">{COMPANY_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, KeyRound, ShieldCheck } from 'lucide-react';

const SECTIONS = [
  {
    id: 'account',
    title: 'Account identity and social connections',
    body: 'LinkedIn OAuth is used to sign in. CopyForge stores the LinkedIn profile identifier and display name with your account. Social access tokens are encrypted and remain on the backend.',
    icon: KeyRound,
  },
  {
    id: 'content',
    title: 'Content and generated images',
    body: 'Content briefs, generated content, posts, schedules, and generated image data are stored in the backend database and associated with the LinkedIn account used to sign in.',
    icon: Database,
  },
  {
    id: 'providers',
    title: 'External providers',
    body: 'Content and image-generation requests are sent from the backend to its configured AI provider. Trend Radar retrieves current articles from the publisher feeds shown with each article.',
    icon: ShieldCheck,
  },
  {
    id: 'browser',
    title: 'Browser storage',
    body: 'The browser stores an opaque sign-in session in session storage so requests can be associated with the account. Content defaults are stored locally on this device.',
    icon: ShieldCheck,
  },
];

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CopyForge
        </button>
        <header className="space-y-3">
          <p className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">DATA HANDLING</p>
          <h1 className="text-4xl font-extrabold text-white">Privacy and data</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            This page describes the application data flow currently implemented in CopyForge. Review your organization’s legal and compliance requirements before production use.
          </p>
        </header>
        <div className="space-y-4">
          {SECTIONS.map(({ id, title, body, icon: Icon }) => (
            <section key={id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="flex items-center gap-3 text-lg font-bold text-white">
                <Icon className="w-5 h-5 text-indigo-400" /> {title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-3">{body}</p>
            </section>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          You can review and disconnect social integrations from the Social Accounts page.
        </p>
      </div>
    </main>
  );
};

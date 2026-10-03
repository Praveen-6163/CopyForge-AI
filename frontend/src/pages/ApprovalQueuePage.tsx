import React, { useState } from 'react';
import {
  CheckSquare, Check, X, Edit3, RefreshCw, Clock, ExternalLink,
  Linkedin, Instagram, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  SectionHeader, GlassCard, Badge, Button, EmptyState,
  ConfidenceBar, PlatformBadge, useToast, ToastContainer, ConfirmDialog, PageWrapper
} from '../components/ui';
import { DEMO_APPROVAL_ITEMS } from '../services/platformData';
import { ApprovalItem } from '../types/platform';

export const ApprovalQueuePage: React.FC = () => {
  const [items, setItems] = useState<ApprovalItem[]>(DEMO_APPROVAL_ITEMS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const { toasts, show, dismiss } = useToast();

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' } : i));
    show('success', 'Content approved and added to schedule!');
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    show('info', 'Content rejected and removed from queue.');
    setConfirmReject(null);
  };

  const pending = items.filter(i => i.status === 'pending');
  const approved = items.filter(i => i.status === 'approved');

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Approval Queue</h1>
          </div>
          <p className="text-sm text-slate-400">Review AI-generated content before publishing</p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Badge variant="warning" dot size="md">{pending.length} Pending</Badge>
          )}
          {approved.length > 0 && (
            <Badge variant="success" dot size="md">{approved.length} Approved</Badge>
          )}
        </div>
      </div>

      {/* Demo Banner */}
      <div className="mb-6 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 flex items-center gap-3">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/20 uppercase flex-shrink-0">Demo Data</span>
        <p className="text-xs text-slate-400">Items below are AI-generated demo content. Real content will appear here when the Automation engine runs.</p>
      </div>

      {items.length === 0 ? (
        <GlassCard className="p-8">
          <EmptyState
            icon={CheckSquare}
            title="Queue is empty"
            description="No content awaiting approval. Enable Automation to start generating content automatically."
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <GlassCard key={item.id} className={`p-5 transition-all ${
              item.status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/5' :
              item.status === 'rejected' ? 'border-rose-500/30 opacity-60' : ''
            }`}>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <PlatformBadge platform={item.platform} />
                    <Badge variant="purple">{item.contentType}</Badge>
                    {item.status === 'approved' && <Badge variant="success" dot>Approved</Badge>}
                    {item.status === 'pending' && <Badge variant="warning" dot>Pending Review</Badge>}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">{item.topic}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {item.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-36">
                  <ConfidenceBar value={item.aiConfidence} label="AI Confidence" />
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Generated Content</span>
                  <button
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {expanded === item.id ? <><ChevronUp className="w-3.5 h-3.5" /> Collapse</> : <><ChevronDown className="w-3.5 h-3.5" /> Expand</>}
                  </button>
                </div>
                <p className={`text-sm text-slate-200 leading-relaxed whitespace-pre-wrap ${expanded !== item.id ? 'line-clamp-3' : ''}`}>
                  {item.content}
                </p>
              </div>

              {/* Hashtags */}
              {item.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.hashtags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {item.status === 'pending' && (
                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/60">
                  <Button variant="success" icon={Check} size="sm" onClick={() => handleApprove(item.id)}>
                    Approve
                  </Button>
                  <Button variant="danger" icon={X} size="sm" onClick={() => setConfirmReject(item.id)}>
                    Reject
                  </Button>
                  <Button variant="secondary" icon={Edit3} size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" icon={RefreshCw} size="sm">
                    Regenerate
                  </Button>
                  <Button variant="secondary" icon={Clock} size="sm" className="ml-auto">
                    Schedule
                  </Button>
                </div>
              )}
              {item.status === 'approved' && (
                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/60">
                  <Badge variant="success" dot size="md">Content approved — ready to schedule</Badge>
                  <Button variant="primary" size="sm" icon={Clock} className="ml-auto">Schedule Post</Button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmReject}
        title="Reject Content?"
        message="This content will be removed from the approval queue. You can regenerate it from the Trend Radar page."
        confirmLabel="Yes, Reject"
        variant="danger"
        onConfirm={() => confirmReject && handleReject(confirmReject)}
        onCancel={() => setConfirmReject(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageWrapper>
  );
};

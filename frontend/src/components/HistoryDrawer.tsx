import React, { useState, useEffect } from 'react';
import { 
  X, Search, Filter, Trash2, ArrowUpRight, Bookmark, 
  Linkedin, Instagram, Mail, Twitter, Facebook, Globe, RefreshCcw 
} from 'lucide-react';
import { HistoryItem, PlatformType, ToneType } from '../types/generation';
import { fetchHistory, deleteHistoryItem, toggleSaveItem } from '../services/api';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  savedOnlyMode?: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectHistoryItem,
  savedOnlyMode = false,
}) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [toneFilter, setToneFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(search, platformFilter, toneFilter, savedOnlyMode);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, search, platformFilter, toneFilter, savedOnlyMode]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteHistoryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isSaved = await toggleSaveItem(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_saved: isSaved } : i))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0d121f] border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {savedOnlyMode ? (
                <>
                  <Bookmark className="w-5 h-5 text-emerald-400" /> Saved Copies
                </>
              ) : (
                'Generation History'
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {savedOnlyMode
                ? 'Your bookmarked copy outputs.'
                : 'Browse, filter, and reopen past AI generations.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name or output..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300"
            >
              <option value="All">All Platforms</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Email">Email</option>
              <option value="X/Twitter">X/Twitter</option>
              <option value="Facebook">Facebook</option>
              <option value="Website">Website</option>
            </select>

            <select
              value={toneFilter}
              onChange={(e) => setToneFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300"
            >
              <option value="All">All Tones</option>
              <option value="Professional">Professional</option>
              <option value="Friendly">Friendly</option>
              <option value="Witty">Witty</option>
              <option value="Persuasive">Persuasive</option>
              <option value="Premium">Premium</option>
              <option value="Casual">Casual</option>
              <option value="Inspirational">Inspirational</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading history...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No generations found matching query.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-brand-300 transition-colors">
                      {item.product_name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[10px]">
                      {item.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                      {item.tone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleBookmark(item.id, e)}
                      className={`p-1.5 rounded hover:bg-slate-800 text-xs ${
                        item.is_saved ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-2 font-sans">
                  {item.generated_content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="text-brand-400 group-hover:underline flex items-center gap-0.5">
                    Reopen <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';
import { pinyin } from 'pinyin-pro';
import type { Bookmark } from '../types';
import { cn } from '../utils/cn';
import { SafeImage } from './SafeImage';

interface Props {
  bookmarks: Bookmark[];
  onNavigate: (bm: Bookmark | string) => void;
}

const SEARCH_ENGINES = {
  google: { prefixes: ['?gg ', '？gg '], url: 'https://www.google.com/search?q=', label: 'Google' },
  googleai: { prefixes: ['?gw ', '？gw '], url: 'https://www.google.com/search?udm=50&q=', label: 'Google AI' },
  baidu: { prefixes: ['?bd ', '？bd ', '?', '？'], url: 'https://www.baidu.com/s?wd=', label: '百度' },
  bing: { prefixes: ['?bi ', '？bi '], url: 'https://www.bing.com/search?q=', label: '必应' },
};

const HISTORY_KEY = 'search_url_history';

const normalizeUrl = (url: string) => {
  try {
    const u = new URL(url.toLowerCase());
    return (u.hostname + u.pathname + u.search).replace(/\/$/, '').trim();
  } catch (e) {
    return url.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
};

export const CommandCenter: React.FC<Props> = ({ bookmarks, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { setHistory([]); }
    }
  }, []);

  const saveToHistory = (url: string) => {
    if (!url || !url.startsWith('http')) return;
    const norm = normalizeUrl(url);
    const newHistory = [url, ...history.filter(h => normalizeUrl(h) !== norm)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // 1. 强化索引：使用 pattern: 'first' 确保首字母匹配直觉
  const indexedBookmarks = useMemo(() => {
    const start = performance.now();
    const items = bookmarks.map(bm => {
      const title = bm.title.toLowerCase();
      const cleanTitle = title.replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
      
      // 关键修复：使用 'first' 模式获取首字符 (c)，而不是 'initial' 模式获取声母 (ch)
      const pinyinFull = pinyin(cleanTitle, { toneType: 'none' }).replace(/\s/g, '');
      const pinyinFirst = pinyin(cleanTitle, { pattern: 'first', toneType: 'none' }).replace(/\s/g, '');
      
      const searchIndex = `${title} ${bm.url.toLowerCase()} ${pinyinFull} ${pinyinFirst}`.trim();

      return {
        ...bm,
        searchIndex,
        pinyinFirst, // 调试用
        normUrl: normalizeUrl(bm.url)
      };
    });
    console.log(`[Search Index] Indexed ${items.length} bookmarks in ${Math.round(performance.now() - start)}ms`);
    return items;
  }, [bookmarks]);

  const searchContext = useMemo(() => {
    const input = query.trim();
    for (const [key, engine] of Object.entries(SEARCH_ENGINES)) {
      for (const prefix of engine.prefixes) {
        if (input.startsWith(prefix)) return { engine: key, label: engine.label, query: input.slice(prefix.length).trim(), url: engine.url };
      }
    }
    return null;
  }, [query]);

  // 2. 搜索与去重
  const searchResults = useMemo(() => {
    const rawSearch = query.toLowerCase().trim();
    if (!rawSearch || (searchContext && searchContext.query)) return [];

    console.group(`[Search Debug] Query: "${rawSearch}"`);
    const resultsMap = new Map<string, any>();

    // A. 书签匹配
    indexedBookmarks.forEach(bm => {
      if (bm.searchIndex.includes(rawSearch)) {
        const key = bm.normUrl;
        const existing = resultsMap.get(key);
        // 如果重复，保留 ID 较小或点击量较高的
        if (!existing || (bm.click_count > (existing.click_count || 0))) {
          resultsMap.set(key, bm);
        }
      }
    });
    console.log(`Matched Bookmarks: ${resultsMap.size}`);

    // B. 历史记录匹配 (不覆盖已有的书签)
    let historyCount = 0;
    history.forEach(url => {
      const norm = normalizeUrl(url);
      if (!resultsMap.has(norm) && url.toLowerCase().includes(rawSearch)) {
        resultsMap.set(norm, { url, isHistory: true });
        historyCount++;
      }
    });
    console.log(`Matched History: ${historyCount}`);

    const finalResults = Array.from(resultsMap.values())
      .sort((a, b) => {
        if (a.isHistory !== b.isHistory) return a.isHistory ? 1 : -1;
        return (b.click_count || 0) - (a.click_count || 0);
      })
      .slice(0, 12);

    console.log('Final Results:', finalResults);
    console.groupEnd();
    return finalResults;
  }, [query, indexedBookmarks, history, searchContext]);

  const internalNavigate = (target: any) => {
    const url = typeof target === 'string' ? target : target.url;
    saveToHistory(url);
    onNavigate(target);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (searchResults.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (searchResults.length || 1)) % (searchResults.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchContext && searchContext.query) {
          internalNavigate(`${searchContext.url}${encodeURIComponent(searchContext.query)}`);
          return;
        }
        if (searchResults.length > 0 && searchResults[selectedIndex]) {
          internalNavigate(searchResults[selectedIndex]);
          return;
        }
        const trimmed = query.trim();
        if (trimmed) {
          if (trimmed.includes('.') && !trimmed.includes(' ')) {
            internalNavigate(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
          } else {
            internalNavigate(`${SEARCH_ENGINES.baidu.url}${encodeURIComponent(trimmed)}`);
          }
        }
      } else if (e.key === 'Escape') {
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex, query, searchContext, onNavigate]);

  useEffect(() => setSelectedIndex(0), [query]);

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 overflow-hidden transition-all duration-500 focus-within:ring-brand-500/30">
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="拼音首字母 (dcd), 标题或网址..."
          className="w-full h-18 pl-16 pr-6 text-xl text-slate-800 border-none focus:ring-0 focus:outline-none bg-transparent placeholder:text-slate-300 font-medium"
          autoFocus
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
          {searchContext ? (
            <span className="px-2.5 py-1 text-[10px] font-black text-brand-600 bg-brand-50 border border-brand-200 rounded-lg animate-in zoom-in">{searchContext.label} 模式</span>
          ) : (
            <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] font-bold text-slate-300 border border-slate-100 rounded-md uppercase tracking-tighter">CMD+K</kbd>
          )}
        </div>
      </div>

      {query && (
        <div className="max-h-[60vh] overflow-y-auto border-t border-slate-50 py-2">
          {searchContext && searchContext.query && (
            <div className="px-5 py-6 bg-brand-50/30 cursor-pointer flex items-center gap-4" onClick={() => internalNavigate(`${searchContext.url}${encodeURIComponent(searchContext.query)}`)}>
               <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">🔍</div>
               <div className="flex-1">
                 <div className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">使用 {searchContext.label} 搜索</div>
                 <div className="text-lg font-bold text-slate-900 truncate">"{searchContext.query}"</div>
               </div>
               <kbd className="px-2 py-1 text-xs font-bold text-brand-500 bg-white border border-brand-100 rounded shadow-sm">Enter</kbd>
            </div>
          )}
          
          {searchResults.map((item: any, index) => (
            <div key={item.id || item.url} onMouseEnter={() => setSelectedIndex(index)} onClick={() => internalNavigate(item)} className={cn("relative flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-all", index === selectedIndex ? "bg-brand-50/80" : "")}>
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {item.isHistory ? (
                  <ClockIcon className="w-5 h-5 text-slate-300" />
                ) : (
                  <SafeImage src={item.favicon_path} className="w-6 h-6 object-contain" fallbackEmoji="🌍" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-700 truncate">{item.title || item.url}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{item.url}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!item.isHistory && <span className="text-[10px] text-slate-300 font-mono">Hits: {item.click_count || 0}</span>}
                {index === selectedIndex && <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-brand-500 bg-white border border-brand-100 rounded shadow-sm">Enter</kbd>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
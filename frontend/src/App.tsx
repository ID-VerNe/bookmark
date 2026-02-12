import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { PlusIcon, Cog6ToothIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import { getBookmarks, addBookmark, editBookmark, deleteBookmark, addCollection, deleteCollection, clickBookmark } from './api';
import type { Bookmark } from './types';
import { CommandCenter } from './components/CommandCenter';
import { CategoryPanel } from './components/CategoryPanel';
import { BookmarkModal } from './components/BookmarkModal';
import { CollectionModal } from './components/CollectionModal';
import { SafeImage } from './components/SafeImage';

function App() {
  const queryClient = useQueryClient();
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  
  // 验证状态
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({ 
    queryKey: ['bookmarks'], 
    queryFn: getBookmarks,
    retry: false, // 失败后不自动重试，方便处理 401
    enabled: isAuthenticated === true
  });

  // 处理验证逻辑
  useEffect(() => {
    const savedPwd = localStorage.getItem('auth_password');
    if (savedPwd) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // 监听后端返回的 401 错误
  useEffect(() => {
    if (isError && (error as any)?.response?.status === 401) {
      localStorage.removeItem('auth_password');
      setIsAuthenticated(false);
    }
  }, [isError, error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('auth_password', passwordInput);
    // 立即尝试请求一次
    try {
      await refetch();
      setIsAuthenticated(true);
      toast.success('欢迎回来');
    } catch (err) {
      localStorage.removeItem('auth_password');
      toast.error('密码错误');
    }
  };

  const addMutation = useMutation({ mutationFn: addBookmark, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); toast.success('已添加'); setIsBookmarkModalOpen(false); } });
  const editMutation = useMutation({ mutationFn: editBookmark, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); toast.success('已更新'); setIsBookmarkModalOpen(false); setEditingBookmark(null); } });
  const deleteMutation = useMutation({ mutationFn: deleteBookmark, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); toast.success('已删除'); setIsBookmarkModalOpen(false); setEditingBookmark(null); } });
  const addCollMutation = useMutation({ mutationFn: addCollection, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); toast.success('分类已创建'); } });
  const deleteCollMutation = useMutation({ mutationFn: deleteCollection, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); toast.success('分类已删除'); } });

  const handleNavigate = async (target: Bookmark | string) => {
    const url = typeof target === 'string' ? target : target.url;
    window.open(url, '_blank', 'noopener');
    if (typeof target !== 'string') {
      try {
        await clickBookmark(target.id);
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.querySelector('input')?.focus(); }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 1. 加载态 (验证前)
  if (isAuthenticated === null) return null;

  // 2. 登录页面
  if (isAuthenticated === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <Toaster position="top-center" />
        <form onSubmit={handleLogin} className="w-full max-w-sm p-10 bg-white rounded-[2.5rem] shadow-2xl ring-1 ring-slate-200 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-brand-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-brand-500/30">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2 italic">DASH<span className="text-brand-500">.</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Access Restricted</p>
          
          <input
            type="password"
            autoFocus
            className="w-full rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all py-4 px-6 text-center text-lg font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:text-slate-300"
            placeholder="ENTER PASSCODE"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          
          <button
            type="submit"
            className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  // 3. 数据加载中
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const collections = data?.collections || [];
  const bookmarks = data?.bookmarks || [];
  const topVisited = [...bookmarks].sort((a, b) => b.click_count - a.click_count).slice(0, 12);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <Toaster position="bottom-center" />
      <header className="pt-12 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <CommandCenter bookmarks={bookmarks} onNavigate={handleNavigate} />
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-[1800px] space-y-6">
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 whitespace-nowrap">Pinned</h2>
            <div className="h-px bg-slate-100 w-full"></div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
            {topVisited.map(bm => (
              <a key={bm.id} href={bm.url} onClick={(e) => { e.preventDefault(); handleNavigate(bm); }} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm ring-1 ring-slate-100 hover:ring-brand-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors overflow-hidden relative">
                  <SafeImage src={bm.favicon_path} className="h-6 w-6 object-contain text-lg" fallbackEmoji="🌍" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-600 transition-colors truncate w-full text-center px-1">{bm.title}</span>
              </a>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-4 mb-2 pt-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 whitespace-nowrap">Dashboard</h2>
          <div className="h-px bg-slate-100 w-full"></div>
        </div>
        
        <div className="space-y-4">
          {collections.map(coll => {
            const collBookmarks = bookmarks.filter(b => b.collection_id === coll.id);
            if (collBookmarks.length === 0) return null;
            return <CategoryPanel key={coll.id} collection={coll} bookmarks={collBookmarks} onEdit={(bm) => { setEditingBookmark(bm); setIsBookmarkModalOpen(true); }} onDelete={(id) => deleteMutation.mutate(id)} onClick={handleNavigate} />;
          })}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button onClick={() => setIsCollectionModalOpen(true)} className="p-3.5 bg-white text-slate-400 rounded-2xl shadow-lg ring-1 ring-slate-100 hover:text-brand-500 transition-all active:scale-90"><Cog6ToothIcon className="w-6 h-6" /></button>
        <button onClick={() => setIsBookmarkModalOpen(true)} className="p-3.5 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-90"><PlusIcon className="w-6 h-6" /></button>
      </div>

      <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => { setIsBookmarkModalOpen(false); setEditingBookmark(null); }} collections={collections} editingBookmark={editingBookmark} onDelete={(id) => deleteMutation.mutate(id)} onSubmit={(fd) => editingBookmark ? editMutation.mutate(fd) : addMutation.mutate(fd)} />
      <CollectionModal isOpen={isCollectionModalOpen} onClose={() => setIsCollectionModalOpen(false)} collections={collections} onAdd={(name) => addCollMutation.mutate(name)} onDelete={(name) => deleteCollMutation.mutate(name)} />
    </div>
  );
}

export default App;
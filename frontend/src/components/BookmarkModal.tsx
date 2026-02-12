import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PhotoIcon, LinkIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Bookmark, Collection } from '../types';
import { previewTitle } from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  onDelete?: (id: number) => void; // 新增删除回调
  editingBookmark: Bookmark | null;
  collections: Collection[];
}

export const BookmarkModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  editingBookmark, 
  collections 
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [iconPath, setIconPath] = useState('');
  const [collection, setCollection] = useState('');
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setIconPath(editingBookmark.favicon_path || '');
      const coll = collections.find(c => c.id === editingBookmark.collection_id);
      setCollection(coll?.name || '');
      setIsNewFolder(false);
    } else {
      setUrl('');
      setTitle('');
      setIconPath('');
      setCollection(collections[0]?.name || '');
      setIsNewFolder(false);
      setNewFolderName('');
    }
  }, [editingBookmark, collections, isOpen]);

  const handleUrlBlur = async () => {
    if (!url || editingBookmark || title) return;
    setIsLoadingTitle(true);
    try {
      const data = await previewTitle(url);
      if (data.title) setTitle(data.title);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTitle(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIconPath(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingBookmark) formData.append('id', editingBookmark.id.toString());
    formData.append('url', url);
    formData.append('title', title);
    formData.append('favicon_path', iconPath);
    if (isNewFolder && newFolderName.trim()) {
      formData.append('new_collection', newFolderName.trim());
    } else {
      formData.append('collection', collection);
    }
    onSubmit(formData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all ring-1 ring-slate-200">
                <Dialog.Title as="h3" className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-brand-500 rounded-full" />
                  {editingBookmark ? '编辑书签' : '添加新书签'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Website URL</label>
                    <div className="relative group">
                      <input type="text" required className="w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm py-3 pl-4 pr-10" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} onBlur={handleUrlBlur} />
                      <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Display Title {isLoadingTitle && <span className="animate-pulse text-brand-500">(FETCHING...)</span>}</label>
                    <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm py-3 px-4" placeholder="留空自动获取" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Icon</label>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-[10px] font-black text-brand-500 hover:text-brand-600"><ArrowUpTrayIcon className="w-3 h-3" /> UPLOAD</button>
                    </div>
                    <div className="relative group">
                      <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm py-3 pl-4 pr-10" placeholder="URL 或 Base64" value={iconPath} onChange={(e) => setIconPath(e.target.value)} />
                      <PhotoIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    {iconPath && (
                      <div className="mt-2 flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl ring-1 ring-slate-100">
                        <div className="flex items-center gap-3">
                          <img src={iconPath} className="w-8 h-8 rounded-lg shadow-sm object-contain bg-white" alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/static/images/default-favicon.ico'; }} />
                          <span className="text-[9px] font-black text-slate-400 uppercase">Preview</span>
                        </div>
                        <button type="button" onClick={() => setIconPath('')} className="text-[9px] font-bold text-slate-400 hover:text-red-500 px-2">CLEAR</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                      <button type="button" onClick={() => setIsNewFolder(!isNewFolder)} className="text-[10px] font-black text-brand-500 hover:text-brand-600">{isNewFolder ? 'EXISTING' : 'NEW?'}</button>
                    </div>
                    {isNewFolder ? (
                      <input type="text" autoFocus required className="w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm py-3 px-4" placeholder="New category name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                    ) : (
                      <select className="w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm py-3 px-4" value={collection} onChange={(e) => setCollection(e.target.value)}>
                        {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    {editingBookmark ? (
                      <button 
                        type="button" 
                        onClick={() => onDelete && onDelete(editingBookmark.id)}
                        className="flex items-center gap-1 px-4 py-3 text-xs font-black text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    ) : <div />}
                    
                    <div className="flex gap-2">
                      <button type="button" className="px-6 py-3 text-xs font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors uppercase" onClick={onClose}>Cancel</button>
                      <button type="submit" className="px-8 py-3 text-xs font-black text-white bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-xl shadow-brand-500/20 transition-all uppercase tracking-widest">Save</button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
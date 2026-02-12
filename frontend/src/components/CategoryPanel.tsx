import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Bookmark, Collection } from '../types';
import { SafeImage } from './SafeImage';

interface Props {
  collection: Collection;
  bookmarks: Bookmark[];
  onEdit: (bm: Bookmark) => void;
  onDelete: (id: number) => void;
  onClick: (bm: Bookmark) => void;
}

export const CategoryPanel: React.FC<Props> = ({ collection, bookmarks, onEdit, onDelete, onClick }) => {
  return (
    <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-slate-50">
        <h2 className="text-[11px] font-black text-slate-700 flex items-center gap-2 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          {collection.name}
        </h2>
        <span className="text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded-full bg-slate-50">{bookmarks.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {bookmarks.map((bm) => (
          <div key={bm.id} className="group/item flex items-center gap-2 rounded-lg px-2 py-1.5 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-brand-500/20 transition-all cursor-pointer relative overflow-hidden h-9" onClick={() => onClick(bm)} title={bm.title}>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center relative">
              <SafeImage 
                src={bm.favicon_path} 
                className="h-4 w-4 object-contain text-[10px]" 
                fallbackEmoji="🌍"
              />
            </div>
            <div className="text-[11px] text-slate-600 font-bold truncate flex-1 leading-tight">{bm.title}</div>

            <div className="opacity-0 group-hover/item:opacity-100 flex items-center absolute right-0 bg-white shadow-[-12px_0_8px_white] pl-2 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onEdit(bm); }} className="p-1 text-slate-300 hover:text-brand-500 transition-colors">
                <PencilSquareIcon className="w-3 h-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`确定删除 "${bm.title}" 吗？`)) onDelete(bm.id); }} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

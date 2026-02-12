import React from 'react';
import { PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { Bookmark } from '../types';

interface Props {
  bookmark: Bookmark;
  isEditMode: boolean;
  onEdit: (bm: Bookmark) => void;
  onDelete: (id: number) => void;
  onUploadIcon: (id: number) => void;
}

export const BookmarkCard: React.FC<Props> = ({ 
  bookmark, 
  isEditMode, 
  onEdit, 
  onDelete,
  onUploadIcon 
}) => {
  const { title, url, favicon_path } = bookmark;
  
  const displayIcon = favicon_path 
    ? (favicon_path.startsWith('http') ? favicon_path : favicon_path) 
    : null;

  return (
    <div className="group relative flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 overflow-hidden">
        {displayIcon ? (
          <img 
            src={displayIcon} 
            alt={title} 
            className="h-6 w-6 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ''; 
            }}
          />
        ) : (
          <div className="text-lg grayscale group-hover:grayscale-0 transition-all">🔗</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
        <p className="truncate text-[10px] text-slate-400 font-mono tracking-tight">
          {new URL(url).hostname}
        </p>
      </div>

      {!isEditMode && (
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer" 
          className="absolute inset-0 z-0" 
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {isEditMode && (
        <div className="absolute -right-2 -top-2 z-10 flex gap-1 animate-in fade-in zoom-in duration-200">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }}
            className="rounded-full bg-white p-1.5 text-blue-600 shadow-lg ring-1 ring-slate-200 hover:bg-blue-600 hover:text-white transition-all"
            title="编辑"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onUploadIcon(bookmark.id); }}
            className="rounded-full bg-white p-1.5 text-amber-600 shadow-lg ring-1 ring-slate-200 hover:bg-amber-600 hover:text-white transition-all"
            title="上传图标"
          >
            <PhotoIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
            className="rounded-full bg-white p-1.5 text-red-600 shadow-lg ring-1 ring-slate-200 hover:bg-red-600 hover:text-white transition-all"
            title="删除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

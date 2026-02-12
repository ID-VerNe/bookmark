import React from 'react';
import type { Bookmark, Collection } from '../types';
import { BookmarkCard } from './BookmarkCard';

interface Props {
  collection: Collection;
  bookmarks: Bookmark[];
  isEditMode: boolean;
  onEdit: (bm: Bookmark) => void;
  onDelete: (id: number) => void;
  onUploadIcon: (id: number) => void;
}

export const SectionGroup: React.FC<Props> = ({ 
  collection, 
  bookmarks, 
  ...props 
}) => {
  if (bookmarks.length === 0 && !props.isEditMode) return null;

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-1.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
        <h2 className="text-xl font-bold tracking-tight text-slate-800">{collection.name}</h2>
        <span className="flex h-5 items-center rounded-full bg-slate-100 px-2 text-[10px] font-bold text-slate-400">
          {bookmarks.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {bookmarks.map((bm) => (
          <BookmarkCard key={bm.id} bookmark={bm} {...props} />
        ))}
        
        {props.isEditMode && bookmarks.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
            暂无书签
          </div>
        )}
      </div>
    </section>
  );
};

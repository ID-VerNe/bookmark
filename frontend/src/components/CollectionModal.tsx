import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Collection } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}

export const CollectionModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  collections,
  onAdd,
  onDelete
}) => {
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 mb-6">
                  分类管理
                </Dialog.Title>

                {/* 添加新分类 */}
                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500 text-sm"
                    placeholder="新分类名称..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </form>

                {/* 列表 */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {collections.map((coll) => (
                    <div key={coll.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                      <span className="text-sm font-bold text-slate-700">{coll.name}</span>
                      {coll.name !== '默认' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`确定要删除分类 "${coll.name}" 吗？该分类下的书签不会被删除。`)) {
                              onDelete(coll.name);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    onClick={onClose}
                  >
                    关闭
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

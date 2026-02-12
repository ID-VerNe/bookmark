import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  bookmarkId: number | null;
}

export const IconUploadModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  bookmarkId 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || bookmarkId === null) return;
    const formData = new FormData();
    formData.append('bookmark_id', bookmarkId.toString());
    formData.append('icon', selectedFile);
    onSubmit(formData);
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4">
                  更换图标
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-brand-500 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      required
                    />
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-20 w-20 object-contain" />
                    ) : (
                      <>
                        <PhotoIcon className="h-12 w-12 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400">点击或拖拽图片到此处</p>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                      onClick={onClose}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile}
                      className="px-4 py-2 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上传
                    </button>
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

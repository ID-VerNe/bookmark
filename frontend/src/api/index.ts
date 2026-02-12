import axios from 'axios';
import type { AllData, Bookmark } from '../types';

const api = axios.create({
  baseURL: '/php_backend/index.php',
});

// 请求拦截器：动态添加验证头
api.interceptors.request.use((config) => {
  const pwd = localStorage.getItem('auth_password');
  if (pwd) {
    config.headers['X-Auth-Password'] = pwd;
  }
  return config;
});

export const getBookmarks = async (): Promise<AllData> => {
  const { data } = await api.get('', { params: { action: 'get_all_data' } });
  return data;
};

export const clickBookmark = async (id: number) => {
  return api.get('', { params: { action: 'click_bookmark', id } });
};

export const addBookmark = async (formData: FormData) => {
  return api.post('', formData, { params: { action: 'add_bookmark' } });
};

export const editBookmark = async (formData: FormData) => {
  return api.post('', formData, { params: { action: 'edit_bookmark' } });
};

export const deleteBookmark = async (id: number) => {
  return api.get('', { params: { action: 'delete_bookmark', id } });
};

export const addCollection = async (name: string) => {
  return api.post('', { name }, { params: { action: 'add_collection' } });
};

export const deleteCollection = async (name: string) => {
  return api.post('', { name }, { params: { action: 'delete_collection' } });
};

export const previewTitle = async (url: string) => {
  const { data } = await api.post('', { url }, { params: { action: 'preview_title' } });
  return data;
};

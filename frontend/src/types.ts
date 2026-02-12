export interface Bookmark {
  id: number;
  url: string;
  title: string;
  favicon_path: string | null;
  collection_id: number;
  order_index: number;
  click_count: number;
  created_at: string;
}

export interface Collection {
  id: number;
  name: string;
}

export interface AllData {
  collections: Collection[];
  bookmarks: Bookmark[];
}
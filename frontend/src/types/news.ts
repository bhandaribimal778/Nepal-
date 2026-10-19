export type NewsCategory = 
  | 'all'
  | 'politics'
  | 'economy'
  | 'society'
  | 'sports'
  | 'opinion'
  | 'world'
  | 'tech'
  | 'entertainment';

export interface CategoryInfo {
  slug: NewsCategory;
  name: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface ArticleComment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
}

export interface Article {
  id: string;
  title: string;
  slug?: string;
  summary: string;
  content: string[];
  category: NewsCategory;
  categoryLabel: string;
  category_id?: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  published_at?: string | null;
  relativeTime?: string;
  readTimeMinutes: number;
  imageUrl: string;
  altText?: string;
  status?: 'draft' | 'published' | 'archived';
  isBreaking?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type PageRoute = 
  | { type: 'home' }
  | { type: 'category'; category: NewsCategory }
  | { type: 'search'; query?: string }
  | { type: 'saved' }
  | { type: 'article'; articleId: string }
  | { type: 'admin-login' }
  | { type: 'admin-dashboard' };

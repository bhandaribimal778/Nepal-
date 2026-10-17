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

export interface ArticleComment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: NewsCategory;
  categoryLabel: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  tags?: string[];
}

export type PageRoute = 
  | { type: 'home' }
  | { type: 'category'; category: NewsCategory }
  | { type: 'search'; query?: string }
  | { type: 'saved' }
  | { type: 'article'; articleId: string }
  | { type: 'admin-login' }
  | { type: 'admin-dashboard' };

/**
 * Supabase Client Integration for Nepal News
 * Connected to: https://yaawyaimhhfqpnexuxgb.supabase.co
 */

import { Article, NewsCategory, CategoryItem } from '../types/news';
import { FIXTURE_ARTICLES } from '../fixtures/newsFixtures';
import { formatArticlePublishedAt } from './nepaliCalendar';

export const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://yaawyaimhhfqpnexuxgb.supabase.co';
export const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GL8kxO4n5o9CPx7Y198PXA_D3TWGMsY';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Fetch all categories from Supabase categories table
 */
export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/categories?select=*&is_active=eq.true&order=display_order.asc`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch categories from Supabase, using fallback');
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch published articles directly from Supabase REST API (Strictly status = 'published')
 */
export async function getPublishedArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured) {
    return FIXTURE_ARTICLES;
  }

  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/articles?select=*,categories(id,slug,name)&status=eq.published&order=published_at.desc`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Supabase fetch returned error status, using fixtures:', response.statusText);
      return FIXTURE_ARTICLES;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return FIXTURE_ARTICLES;
    }

    return data.map((item: any): Article => {
      const pubInfo = formatArticlePublishedAt(item.published_at);
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: Array.isArray(item.content) ? item.content : [item.content],
        category: (item.categories?.slug || 'politics') as NewsCategory,
        categoryLabel: item.categories?.name || 'समाचार',
        category_id: item.category_id,
        author: 'नेपाल न्यूज डेस्क',
        authorRole: 'सम्पादकीय टोली',
        publishedAt: pubInfo.fullDateTime || 'नेपाल समय',
        published_at: item.published_at,
        relativeTime: pubInfo.relativeTime,
        readTimeMinutes: item.read_time_minutes || 3,
        imageUrl: item.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        altText: item.alt_text || item.title || 'नेपाल न्यूज समाचार फोटो',
        status: item.status || 'published',
        isBreaking: Boolean(item.is_breaking),
        isFeatured: Boolean(item.is_featured),
        viewCount: item.view_count || 0,
        tags: item.tags || []
      };
    });
  } catch (error) {
    console.error('Error querying Supabase articles:', error);
    return FIXTURE_ARTICLES;
  }
}

/**
 * Check if a slug is unique in Supabase articles table
 */
export async function checkSlugUnique(slug: string, excludeArticleId?: string): Promise<boolean> {
  try {
    let endpoint = `${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=id`;
    if (excludeArticleId) {
      endpoint += `&id=neq.${excludeArticleId}`;
    }

    const res = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) return true;
    const data = await res.json();
    return Array.isArray(data) && data.length === 0;
  } catch {
    return true;
  }
}

/**
 * Upload article cover image to Supabase Storage 'article-covers' bucket
 */
export async function uploadArticleCover(
  file: File,
  accessToken: string
): Promise<{ url: string; error?: string }> {
  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!allowedMimeTypes.includes(file.type)) {
    return { 
      url: '', 
      error: 'कृपया मान्य फोटो फाइल छान्नुहोस् (JPG, PNG, WEBP, GIF मात्र अनुमति छ)' 
    };
  }

  // Validate file size (max 5MB)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return { 
      url: '', 
      error: `फाइल साइज धेरै ठूलो भयो (${(file.size / (1024 * 1024)).toFixed(1)}MB)। ५ MB भन्दा सानो फोटो अपलोड गर्नुहोस्।` 
    };
  }

  try {
    // Generate safe unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now();
    const filePath = `covers/${timestamp}-${randomId}.${fileExt}`;

    const endpoint = `${SUPABASE_URL}/storage/v1/object/article-covers/${filePath}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: file
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.message || errData.error || response.statusText;
      let nepaliHelp = `स्टोरेज अपलोड त्रुटि (${msg})।`;
      if (msg.includes('row-level security') || msg.includes('Bucket not found') || msg.includes('NoSuchBucket') || response.status === 403 || response.status === 404) {
        nepaliHelp = `Supabase मा 'article-covers' बकेट बनेको छैन वा RLS नीति बाँकी छ। कृपया तलको SQL कमाण्ड चलाउनुहोस् वा सिधै फोटोको लिङ्क (URL) राख्नुहोस्।`;
      }
      return { 
        url: '', 
        error: nepaliHelp 
      };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/article-covers/${filePath}`;
    return { url: publicUrl };
  } catch (err: any) {
    return { 
      url: '', 
      error: `अपलोड गर्दा त्रुटि आयो: ${err.message || 'Network error'}` 
    };
  }
}

/**
 * Delete cover image from Supabase Storage bucket
 */
export async function deleteArticleCover(
  imageUrl: string,
  accessToken: string
): Promise<boolean> {
  try {
    if (!imageUrl.includes('/storage/v1/object/public/article-covers/')) {
      return true; // Not in supabase storage bucket, nothing to delete
    }

    const filePath = imageUrl.split('/storage/v1/object/public/article-covers/')[1];
    if (!filePath) return true;

    const endpoint = `${SUPABASE_URL}/storage/v1/object/article-covers/${filePath}`;
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.ok;
  } catch {
    return false;
  }
}

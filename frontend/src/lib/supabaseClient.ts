/**
 * Supabase Client Integration for Nepal News
 * Connected to: https://yaawyaimhhfqpnexuxgb.supabase.co
 */

import { Article, NewsCategory } from '../types/news';
import { FIXTURE_ARTICLES } from '../fixtures/newsFixtures';

const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://yaawyaimhhfqpnexuxgb.supabase.co';
const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GL8kxO4n5o9CPx7Y198PXA_D3TWGMsY';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Fetch published articles directly from Supabase REST API or fallback to fixtures.
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
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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

    return data.map((item: any): Article => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: Array.isArray(item.content) ? item.content : [item.content],
      category: (item.categories?.slug || 'politics') as NewsCategory,
      categoryLabel: item.categories?.name || 'समाचार',
      author: 'नेपाल न्यूज डेस्क',
      authorRole: 'सम्पादकीय टोली',
      publishedAt: item.published_at ? new Date(item.published_at).toLocaleDateString('ne-NP') : '१० मिनेट अगाडि',
      readTimeMinutes: item.read_time_minutes || 3,
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      isBreaking: Boolean(item.is_breaking),
      isFeatured: Boolean(item.is_featured),
      viewCount: item.view_count || 0,
      tags: item.tags || []
    }));
  } catch (error) {
    console.error('Error querying Supabase articles:', error);
    return FIXTURE_ARTICLES;
  }
}

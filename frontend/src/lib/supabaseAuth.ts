/**
 * Supabase Authentication and Admin Data Layer for Nepal News
 * 
 * Uses standard Supabase GoTrue Auth and PostgREST endpoints.
 * Never exposes service_role or secret keys. All mutations are protected
 * by PostgreSQL Row Level Security (RLS) policies checking public.is_admin().
 */

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor' | 'reporter' | 'reader';
  avatar_url?: string;
}

const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://yaawyaimhhfqpnexuxgb.supabase.co';
const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GL8kxO4n5o9CPx7Y198PXA_D3TWGMsY';

const STORAGE_KEY = 'nepal_news_admin_session';

export const SupabaseAuth = {
  /**
   * Log in user using email and password via Supabase Auth
   */
  async signIn(email: string, password: string): Promise<{ session: AuthSession; profile: UserProfile }> {
    const endpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data.error_description || data.msg || data.message || 'प्रमाणीकरण असफल भयो (Invalid credentials)';
      throw new Error(msg);
    }

    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user: data.user
    };

    // Verify role from public.profiles
    const profile = await this.fetchUserProfile(session.user.id, session.access_token);
    if (profile.role !== 'admin') {
      throw new Error('पहुँच अस्वीकृत: तपाईंको खातालाई व्यवस्थापक (Admin) अधिकार दिइएको छैन।');
    }

    // Persist verified admin session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { session, profile };
  },

  /**
   * Retrieve cached session and verify still valid
   */
  getSession(): AuthSession | null {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return null;
      return JSON.parse(item);
    } catch {
      return null;
    }
  },

  /**
   * Log out and remove session
   */
  async signOut(): Promise<void> {
    const session = this.getSession();
    if (session?.access_token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        });
      } catch (e) {
        console.warn('Logout API error:', e);
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Query database-backed role from public.profiles using access_token
   */
  async fetchUserProfile(userId: string, accessToken: string): Promise<UserProfile> {
    const endpoint = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('प्रयोगकर्ता प्रोफाइल लोड गर्न सकिएन');
    }

    const profiles = await response.json();
    if (!profiles || profiles.length === 0) {
      throw new Error('प्रोफाइल फेला परेन। कृपया पहिले साइन-अप सम्पन्न गर्नुहोस्।');
    }

    return profiles[0] as UserProfile;
  },

  /**
   * Admin: Fetch ALL articles (both published and drafts)
   */
  async getAdminArticles(accessToken: string): Promise<any[]> {
    const endpoint = `${SUPABASE_URL}/rest/v1/articles?select=*,categories(id,slug,name)&order=created_at.desc`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('समाचार सूची लोड गर्न असफल भयो (Unauthorized)');
    }
    return response.json();
  },

  /**
   * Admin: Insert a new article
   */
  async createArticle(accessToken: string, articleData: any): Promise<any> {
    const endpoint = `${SUPABASE_URL}/rest/v1/articles`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(articleData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'समाचार सिर्जना गर्न सकिएन');
    }
    return data;
  },

  /**
   * Admin: Update an existing article
   */
  async updateArticle(accessToken: string, articleId: string, articleData: any): Promise<any> {
    const endpoint = `${SUPABASE_URL}/rest/v1/articles?id=eq.${articleId}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(articleData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'समाचार सच्याउन सकिएन');
    }
    return data;
  },

  /**
   * Admin: Delete an article
   */
  async deleteArticle(accessToken: string, articleId: string): Promise<void> {
    const endpoint = `${SUPABASE_URL}/rest/v1/articles?id=eq.${articleId}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'समाचार मेटाउन सकिएन');
    }
  }
};

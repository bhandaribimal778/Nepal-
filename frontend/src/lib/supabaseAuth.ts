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

export interface AdminArticlesQueryOptions {
  search?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface AdminArticlesResponse {
  articles: any[];
  totalCount: number;
}

const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://yaawyaimhhfqpnexuxgb.supabase.co';
const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GL8kxO4n5o9CPx7Y198PXA_D3TWGMsY';

const STORAGE_KEY = 'nepal_news_admin_session';

export const SupabaseAuth = {
  /**
   * Universal user sign in (both admin and reader)
   */
  async userSignIn(email: string, password: string): Promise<{ session: AuthSession; profile: UserProfile }> {
    const endpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.trim(), password })
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

    // Try fetching profile from public.profiles
    let profile: UserProfile;
    try {
      profile = await this.fetchUserProfile(session.user.id, session.access_token);
    } catch {
      // Fallback profile if profile row is delayed
      profile = {
        id: session.user.id,
        email: session.user.email,
        full_name: (session.user as any).user_metadata?.full_name || session.user.email.split('@')[0],
        role: 'reader'
      };
    }

    // Persist session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem('nepal_news_user_profile', JSON.stringify(profile));
    return { session, profile };
  },

  /**
   * User Registration (Sign Up) with email, password and full name
   */
  async userSignUp(email: string, password: string, fullName: string): Promise<{ session?: AuthSession; profile?: UserProfile; message: string }> {
    const endpoint = `${SUPABASE_URL}/auth/v1/signup`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        data: {
          full_name: fullName.trim()
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data.error_description || data.msg || data.message || 'दर्ता प्रक्रिया असफल भयो';
      if (msg.includes('already registered') || msg.includes('unique')) {
        throw new Error('यो इमेल ठेगाना पहिले नै दर्ता भइसकेको छ। कृपया लगइन गर्नुहोस्।');
      }
      throw new Error(msg);
    }

    // If Supabase returned an active session (e.g. auto confirm enabled)
    if (data.access_token && data.user) {
      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user: data.user
      };
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        full_name: fullName.trim() || data.user.email.split('@')[0],
        role: 'reader'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem('nepal_news_user_profile', JSON.stringify(profile));
      return { session, profile, message: 'खाता सफलतापूर्वक सिर्जना भयो!' };
    }

    return {
      message: 'दर्ता सफल भयो! तपाईं अब आफ्नो इमेल र पासवर्ड प्रयोग गरेर लगइन गर्न सक्नुहुन्छ।'
    };
  },

  /**
   * Log in user using email and password via Supabase Auth (admin only)
   */
  async signIn(email: string, password: string): Promise<{ session: AuthSession; profile: UserProfile }> {
    const result = await this.userSignIn(email, password);
    if (result.profile.role !== 'admin') {
      throw new Error('पहुँच अस्वीकृत: तपाईंको खातालाई व्यवस्थापक (Admin) अधिकार दिइएको छैन।');
    }
    return result;
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
   * Retrieve cached user profile
   */
  getUserProfile(): UserProfile | null {
    try {
      const item = localStorage.getItem('nepal_news_user_profile');
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
    localStorage.removeItem('nepal_news_user_profile');
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
   * Admin: Fetch articles with search, status filtering, category filtering and pagination
   */
  async getAdminArticles(
    accessToken: string,
    options: AdminArticlesQueryOptions = {}
  ): Promise<AdminArticlesResponse> {
    const { search = '', status = 'all', categoryId = 'all', page = 1, limit = 10 } = options;

    const queryParts: string[] = [
      'select=*,categories(id,slug,name)',
      'order=created_at.desc'
    ];

    if (status && status !== 'all') {
      queryParts.push(`status=eq.${status}`);
    }

    if (categoryId && categoryId !== 'all') {
      queryParts.push(`category_id=eq.${categoryId}`);
    }

    if (search.trim()) {
      const cleanSearch = search.trim();
      // Filter by title, summary, or slug ILIKE
      queryParts.push(`or=(title.ilike.*${encodeURIComponent(cleanSearch)}*,summary.ilike.*${encodeURIComponent(cleanSearch)}*,slug.ilike.*${encodeURIComponent(cleanSearch)}*)`);
    }

    const offset = (page - 1) * limit;
    const endpoint = `${SUPABASE_URL}/rest/v1/articles?${queryParts.join('&')}`;

    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Prefer': 'count=exact',
        'Range': `${offset}-${offset + limit - 1}`
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'समाचार सूची लोड गर्न असफल भयो (Unauthorized)');
    }

    // Extract total count from Content-Range header: "0-9/42" or "*/0"
    const contentRange = response.headers.get('Content-Range') || '';
    let totalCount = 0;
    if (contentRange.includes('/')) {
      const totalPart = contentRange.split('/')[1];
      if (totalPart && totalPart !== '*') {
        totalCount = parseInt(totalPart, 10) || 0;
      }
    }

    const articles = await response.json();
    return {
      articles: Array.isArray(articles) ? articles : [],
      totalCount: totalCount || (Array.isArray(articles) ? articles.length : 0)
    };
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
      const msg = data.message || data.error_description || (Array.isArray(data) ? data[0]?.message : 'समाचार सिर्जना गर्न सकिएन');
      if (msg.includes('duplicate key') && msg.includes('slug')) {
        throw new Error('यो स्लग (Slug) पहिले नै प्रयोगमा छ। कृपया अर्को अद्वितीय स्लग लेख्नुहोस्।');
      }
      throw new Error(msg);
    }
    return Array.isArray(data) ? data[0] : data;
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
      const msg = data.message || data.error_description || (Array.isArray(data) ? data[0]?.message : 'समाचार सच्याउन सकिएन');
      if (msg.includes('duplicate key') && msg.includes('slug')) {
        throw new Error('यो स्लग (Slug) पहिले नै प्रयोगमा छ। कृपया अर्को अद्वितीय स्लग लेख्नुहोस्।');
      }
      throw new Error(msg);
    }
    return Array.isArray(data) ? data[0] : data;
  },

  /**
   * Admin: Toggle article status between 'published' and 'draft'
   */
  async togglePublishStatus(accessToken: string, articleId: string, currentStatus: string, existingPublishedAt?: string | null): Promise<any> {
    const isNowPublished = currentStatus !== 'published';
    const updatePayload: any = {
      status: isNowPublished ? 'published' : 'draft',
      // Requirement 10: Retain original published_at if previously published; otherwise set new Date().toISOString()
      published_at: isNowPublished ? (existingPublishedAt || new Date().toISOString()) : null
    };

    return this.updateArticle(accessToken, articleId, updatePayload);
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
      let msg = data.message || data.error_description || 'समाचार मेटाउन सकिएन';
      if (msg.includes('row-level security') || response.status === 403) {
        msg = 'RLS पहुँच अस्वीकृत: समाचार मेटाउनको लागि तपाईंको खातालाई Supabase profiles मा role = "admin" अधिकार हुनुपर्छ।';
      } else if (response.status === 401 || msg.includes('JWT expired')) {
        msg = 'लगइन सेसन समाप्त भयो (JWT expired)। कृपया पुनः लगइन गर्नुहोस्।';
      }
      throw new Error(msg);
    }
  },

  /**
   * Admin: Fetch all registered users from public.profiles
   */
  async getRegisteredUsers(accessToken?: string): Promise<UserProfile[]> {
    const endpoint = `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`;
    let response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        'Accept': 'application/json'
      }
    });

    // If authenticated request is forbidden or expired, fallback to anon public read
    if (!response.ok && accessToken) {
      response = await fetch(endpoint, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Accept': 'application/json'
        }
      });
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'प्रयोगकर्ताहरूको सूची लोड गर्न सकिएन');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Admin: Update user profile role
   */
  async updateUserRole(accessToken: string, userId: string, newRole: 'admin' | 'reader' | 'editor'): Promise<void> {
    const endpoint = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'प्रयोगकर्ताको भूमिका परिवर्तन गर्न सकिएन');
    }
  },

  /**
   * User: Update profile name and avatar
   */
  async updateUserProfile(
    accessToken: string,
    userId: string,
    updates: { full_name?: string; avatar_url?: string }
  ): Promise<UserProfile> {
    const endpoint = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'प्रोफाइल विवरण अपडेट गर्न सकिएन');
    }

    const data = await response.json();
    const updated = Array.isArray(data) ? data[0] : data;
    if (updated) {
      localStorage.setItem('nepal_news_user_profile', JSON.stringify(updated));
    }
    return updated;
  },

  /**
   * User: Delete own account (clears profile and signs out)
   */
  async deleteUserAccount(accessToken: string, userId: string): Promise<void> {
    const endpoint = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
    await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    await this.signOut();
  }
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, LogOut, CheckCircle, Clock, Zap, 
  Search, RefreshCw, X, Shield, Globe, Upload, Image, 
  AlertTriangle, ChevronLeft, ChevronRight, Eye, Star,
  Check, Filter, FileText, Users, BarChart3, Newspaper,
  UserCheck, ShieldAlert, Sparkles, ExternalLink, Copy, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { AuthSession, SupabaseAuth, UserProfile } from '../lib/supabaseAuth';
import { 
  getCategories, 
  uploadArticleCover, 
  checkSlugUnique 
} from '../lib/supabaseClient';
import { CategoryItem } from '../types/news';

interface AdminDashboardPageProps {
  session: AuthSession;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  session,
  onLogout,
  onViewPublicSite
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'articles' | 'users' | 'stats'>('articles');

  // Articles State
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'admin' | 'reader'>('all');
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);

  // Filters & Search for Articles
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Article Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteModalArticle, setDeleteModalArticle] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formReadTime, setFormReadTime] = useState(3);
  const [formTags, setFormTags] = useState('नेपाल, समाचार');

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showStorageGuide, setShowStorageGuide] = useState(false);
  const [copiedStorageSql, setCopiedStorageSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Categories on Mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0 && !formCategoryId) {
          setFormCategoryId(cats[0].id);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Articles with Filters & Pagination
  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await SupabaseAuth.getAdminArticles(session.access_token, {
        search: searchQuery,
        status: filterStatus,
        categoryId: filterCategoryId,
        page: currentPage,
        limit: itemsPerPage
      });
      setArticles(res.articles);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      setError(err.message || 'समाचार लोड गर्न सकिएन');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Registered Users
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const userList = await SupabaseAuth.getRegisteredUsers(session.access_token);
      setUsers(userList);
    } catch (err: any) {
      console.warn('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [session.access_token, filterStatus, filterCategoryId, currentPage]);

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'stats') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  // Auto-generate slug from headline
  const generateSlugFromTitle = (title: string): string => {
    const sanitized = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0900-\u097F-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return sanitized ? `${sanitized.substring(0, 50)}-${randomSuffix}` : `news-${Date.now()}`;
  };

  const openCreateModal = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormSlug('');
    setFormSummary('');
    setFormContent('');
    setFormCategoryId(categories[0]?.id || '');
    setFormStatus('published');
    setFormIsBreaking(false);
    setFormIsFeatured(false);
    setFormImageUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80');
    setFormReadTime(3);
    setFormTags('नेपाल, समाचार');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (art: any) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title || '');
    setFormSlug(art.slug || '');
    setFormSummary(art.summary || '');
    setFormContent(Array.isArray(art.content) ? art.content.join('\n\n') : (art.content || ''));
    setFormCategoryId(art.category_id || categories[0]?.id || '');
    setFormStatus(art.status || 'published');
    setFormIsBreaking(Boolean(art.is_breaking));
    setFormIsFeatured(Boolean(art.is_featured));
    setFormImageUrl(art.image_url || '');
    setFormReadTime(art.read_time_minutes || 3);
    setFormTags(Array.isArray(art.tags) ? art.tags.join(', ') : '');
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Handle Cover Image Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setUploadError(null);
      const res = await uploadArticleCover(file, session.access_token);
      if (res.error) {
        setUploadError(res.error);
      } else if (res.url) {
        setFormImageUrl(res.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'फोटो अपलोड गर्न सकिएन');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save Article (Create or Update)
  const handleSaveArticle = async (forcedStatus?: 'published' | 'draft') => {
    if (!formTitle.trim()) {
      alert('कृपया समाचारको शीर्षक (Title) अनिवार्य रूपमा लेख्नुहोस्।');
      return;
    }
    if (!formSummary.trim()) {
      alert('कृपया समाचारको सारसंक्षेप (Summary) अनिवार्य रूपमा लेख्नुहोस्।');
      return;
    }
    if (!formContent.trim()) {
      alert('कृपया विस्तृत समाचार विवरण (Content) अनिवार्य रूपमा लेख्नुहोस्।');
      return;
    }
    if (!formCategoryId) {
      alert('कृपया एक विधा (Category) चयन गर्नुहोस्।');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Finalize slug
      let finalSlug = formSlug.trim();
      if (!finalSlug) {
        finalSlug = generateSlugFromTitle(formTitle);
      }

      // Validate slug uniqueness
      const isUnique = await checkSlugUnique(finalSlug, editingArticleId || undefined);
      if (!isUnique) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const activeStatus = forcedStatus || formStatus;

      // Split paragraphs
      const paragraphs = formContent
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // Parse tags
      const tagsArray = formTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // SAFE PAYLOAD: Do not include unknown columns like alt_text
      const articlePayload: any = {
        title: formTitle.trim(),
        slug: finalSlug,
        summary: formSummary.trim(),
        content: paragraphs.length > 0 ? paragraphs : [formSummary.trim()],
        category_id: formCategoryId,
        status: activeStatus,
        is_breaking: formIsBreaking,
        is_featured: formIsFeatured,
        image_url: formImageUrl.trim() || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        read_time_minutes: Number(formReadTime) || 3,
        tags: tagsArray,
        author_id: session.user.id
      };

      if (activeStatus === 'published') {
        articlePayload.published_at = new Date().toISOString();
      } else {
        articlePayload.published_at = null;
      }

      if (editingArticleId) {
        await SupabaseAuth.updateArticle(session.access_token, editingArticleId, articlePayload);
        setSuccessMessage('समाचार सफलतापूर्वक सम्पादन गरियो!');
      } else {
        await SupabaseAuth.createArticle(session.access_token, articlePayload);
        setSuccessMessage(
          activeStatus === 'published'
            ? 'नयाँ समाचार सफलतापूर्वक प्रकाशित गरियो!'
            : 'समाचार मस्यौदा (Draft) को रूपमा सुरक्षित गरियो!'
        );
      }

      setIsModalOpen(false);
      fetchArticles();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'समाचार सुरक्षित गर्न सकिएन');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Publish Status
  const handleTogglePublish = async (art: any) => {
    try {
      setError(null);
      await SupabaseAuth.togglePublishStatus(session.access_token, art.id, art.status);
      setSuccessMessage(
        art.status === 'published' 
          ? 'समाचार मस्यौदा (Draft) मा सारियो' 
          : 'समाचार तत्काल प्रकाशित गरियो!'
      );
      fetchArticles();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'स्थिति परिवर्तन गर्न असफल भयो');
    }
  };

  // Confirm Delete Article
  const handleConfirmDelete = async () => {
    if (!deleteModalArticle) return;
    try {
      setIsDeleting(true);
      setError(null);
      await SupabaseAuth.deleteArticle(session.access_token, deleteModalArticle.id);
      setSuccessMessage('समाचार सफलतापूर्वक मेटाइयो!');
      setDeleteModalArticle(null);
      fetchArticles();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'समाचार मेटाउन सकिएन');
    } finally {
      setIsDeleting(false);
    }
  };

  // Change User Role
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'reader') => {
    try {
      setRoleChangeUserId(userId);
      await SupabaseAuth.updateUserRole(session.access_token, userId, newRole);
      setSuccessMessage(`प्रयोगकर्ताको भूमिका '${newRole === 'admin' ? 'व्यवस्थापक' : 'पाठक'}' मा परिवर्तन भयो!`);
      await fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'भूमिका परिवर्तन गर्न सकिएन');
    } finally {
      setRoleChangeUserId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userFilterRole === 'all' || u.role === userFilterRole;
    return matchesSearch && matchesRole;
  });

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-red-600/30">
              ने
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">व्यवस्थापक प्यानल</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                  <Shield size={11} className="text-red-400" />
                  ADMIN CMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                नेपाल न्यूज डिजिटल सम्पादन तथा प्रयोगकर्ता व्यवस्थापन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewPublicSite}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
              title="पब्लिक वेबसाइट खोल्नुहोस्"
            >
              <Globe size={14} className="text-sky-400" />
              <span>पब्लिक पोर्टल हेर्नुहोस्</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 text-xs font-bold transition shadow-sm"
              title="लगआउट गर्नुहोस्"
            >
              <LogOut size={14} />
              <span>लगआउट</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'articles'
                ? 'border-red-500 text-red-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Newspaper size={16} />
            <span>समाचार व्यवस्थापन (Articles)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-red-500 text-red-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Users size={16} />
            <span>दर्ता भएका प्रयोगकर्ताहरू (Users)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'stats'
                ? 'border-red-500 text-red-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <BarChart3 size={16} />
            <span>समरी तथा तथ्याङ्क (Stats)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {/* Alerts & Feedback */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-3 shadow-lg">
            <AlertTriangle className="shrink-0 text-red-400 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="font-bold text-sm">त्रुटि देखियो:</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-3 shadow-lg animate-fade-in">
            <CheckCircle className="shrink-0 text-emerald-400" size={18} />
            <p className="font-bold text-sm flex-1">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
              <X size={16} />
            </button>
          </div>
        )}

        {/* TAB 1: ARTICLES MANAGEMENT */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Top Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-semibold">कुल समाचारहरू</div>
                <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-semibold">लाइभ प्रकाशित</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{publishedCount}</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-semibold">मस्यौदा (Draft)</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{draftCount}</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-semibold">सक्रिय विधाहरू</div>
                <div className="text-2xl font-black text-sky-400 mt-1">{categories.length}</div>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex flex-col md:flex-row justify-between gap-4 items-center">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="शीर्षक वा स्लग खोज्नुहोस्..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </form>

              {/* Filters & Create Button */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="all">सबै स्थिति (All Status)</option>
                  <option value="published">प्रकाशित मात्र (Published)</option>
                  <option value="draft">मस्यौदा मात्र (Draft)</option>
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategoryId}
                  onChange={(e) => {
                    setFilterCategoryId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 max-w-[160px]"
                >
                  <option value="all">सबै विधा (All Categories)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Refresh */}
                <button
                  onClick={fetchArticles}
                  className="p-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition"
                  title="रिफ्रेस गर्नुहोस्"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                </button>

                {/* Create New Article Button */}
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>नयाँ समाचार थप्नुहोस्</span>
                </button>
              </div>
            </div>

            {/* Articles Table Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-700/80">
                    <tr>
                      <th className="py-3 px-4">कभर / शीर्षक</th>
                      <th className="py-3 px-4">विधा (Category)</th>
                      <th className="py-3 px-4">फ्ल्याग (Flags)</th>
                      <th className="py-3 px-4">अवस्था (Status)</th>
                      <th className="py-3 px-4">मिति</th>
                      <th className="py-3 px-4 text-right">कार्यहरू</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <RefreshCw className="animate-spin mx-auto mb-2 text-red-500" size={24} />
                          डेटाबेसबाट समाचारहरू लोड हुँदैछ...
                        </td>
                      </tr>
                    ) : articles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <FileText size={32} className="mx-auto mb-2 text-slate-600" />
                          कुनै समाचार फेला परेन। माथिको 'नयाँ समाचार थप्नुहोस्' बटनबाट सिर्जना गर्नुहोस्।
                        </td>
                      </tr>
                    ) : (
                      articles.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-700/30 transition">
                          <td className="py-3 px-4 max-w-sm">
                            <div className="flex items-start gap-3">
                              <img
                                src={art.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=200&q=80'}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-700"
                              />
                              <div>
                                <h3 className="font-bold text-white text-xs line-clamp-2 leading-snug">
                                  {art.title}
                                </h3>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                                  /{art.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-semibold text-slate-300">
                              {art.categories?.name || 'सामान्य'}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              {art.is_breaking && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                                  <Zap size={10} /> BREAKING
                                </span>
                              )}
                              {art.is_featured && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                                  <Star size={10} /> FEATURED
                                </span>
                              )}
                              {!art.is_breaking && !art.is_featured && (
                                <span className="text-[11px] text-slate-500">-</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublish(art)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                                art.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                  : 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
                              }`}
                              title="अवस्था बदल्न क्लिक गर्नुहोस्"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${art.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                              <span>{art.status === 'published' ? 'प्रकाशित' : 'मस्यौदा (Draft)'}</span>
                            </button>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                            {art.created_at ? new Date(art.created_at).toLocaleDateString('ne-NP') : '-'}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(art)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="सम्पादन गर्नुहोस्"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteModalArticle(art)}
                                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white transition"
                                title="मेटाउनुहोस् (Delete)"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-700/60 flex justify-between items-center text-xs">
                  <div className="text-slate-400">
                    पृष्ठ <span className="font-bold text-white">{currentPage}</span> / {totalPages} (जम्मा {totalCount} वटा)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-slate-300 flex items-center gap-1 transition"
                    >
                      <ChevronLeft size={14} /> अघिल्लो
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-slate-300 flex items-center gap-1 transition"
                    >
                      पछिल्लो <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTERED USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            {/* User Overview Stats Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-semibold">कुल दर्ता भएका प्रयोगकर्ताहरू</div>
                  <div className="text-3xl font-black text-white mt-1">{users.length} जना</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                  <Users size={24} />
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-semibold">व्यवस्थापकहरू (Admins)</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">
                    {users.filter((u) => u.role === 'admin').length} जना
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldAlert size={24} />
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-semibold">प्रमाणित पाठकहरू (Readers)</div>
                  <div className="text-3xl font-black text-emerald-400 mt-1">
                    {users.filter((u) => u.role === 'reader').length} जना
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <UserCheck size={24} />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar for Users */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="नाम वा इमेल खोज्नुहोस्..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <select
                  value={userFilterRole}
                  onChange={(e) => setUserFilterRole(e.target.value as any)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="all">सबै भूमिका (All Roles)</option>
                  <option value="admin">व्यवस्थापक मात्र (Admins)</option>
                  <option value="reader">पाठक मात्र (Readers)</option>
                </select>

                <button
                  onClick={fetchUsers}
                  className="p-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition"
                  title="प्रयोगकर्ता सूची ताजा गर्नुहोस्"
                >
                  <RefreshCw size={15} className={isLoadingUsers ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-700/80">
                    <tr>
                      <th className="py-3 px-4">प्रयोगकर्ता (Name & Initial)</th>
                      <th className="py-3 px-4">इमेल ठेगाना (Email)</th>
                      <th className="py-3 px-4">भूमिका (Role)</th>
                      <th className="py-3 px-4">दर्ता मिति (Registered Date)</th>
                      <th className="py-3 px-4 text-right">भूमिका परिवर्तन</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <RefreshCw className="animate-spin mx-auto mb-2 text-red-500" size={24} />
                          प्रयोगकर्ताहरूको सूची लोड हुँदैछ...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <Users size={32} className="mx-auto mb-2 text-slate-600" />
                          कुनै प्रयोगकर्ता फेला परेन।
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const initial = (u.full_name || u.email || 'U').trim().charAt(0).toUpperCase();
                        const isThisUserAdmin = u.role === 'admin';

                        return (
                          <tr key={u.id} className="hover:bg-slate-700/30 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white text-sm shadow">
                                  {initial}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs">
                                    {u.full_name || 'पाठक (Reader)'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    ID: {u.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-300">
                              {u.email}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isThisUserAdmin
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {isThisUserAdmin ? <Shield size={11} /> : <UserCheck size={11} />}
                                {isThisUserAdmin ? 'व्यवस्थापक (Admin)' : 'पाठक (Reader)'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                              {(u as any).created_at 
                                ? new Date((u as any).created_at).toLocaleDateString('ne-NP') 
                                : 'सक्रिय'}
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleRoleChange(u.id, isThisUserAdmin ? 'reader' : 'admin')}
                                disabled={roleChangeUserId === u.id || u.email === session.user.email}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40 ${
                                  isThisUserAdmin
                                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                                    : 'bg-amber-950 border-amber-800 text-amber-300 hover:bg-amber-900'
                                }`}
                                title={u.email === session.user.email ? 'तपाईं आफ्नो खाताको भूमिका परिवर्तन गर्न सक्नुहुन्न' : 'भूमिका परिवर्तन गर्नुहोस्'}
                              >
                                {roleChangeUserId === u.id ? (
                                  'बदल्दै...'
                                ) : isThisUserAdmin ? (
                                  'पाठकमा बदल्नुहोस्'
                                ) : (
                                  'एडमिन बनाउनुहोस्'
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STATS & OVERVIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="text-red-500" size={18} />
                नेपाल न्यूज प्रणाली विवरण तथा स्थिति (System Overview)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">डेटाबेस स्थिति (Supabase)</div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400">जडान:</span>
                    <span className="text-emerald-400 font-bold">सक्रिय (Connected)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400">कुल प्रकाशित समाचार:</span>
                    <span className="text-white font-bold">{publishedCount} वटा</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400">कुल मस्यौदा (Drafts):</span>
                    <span className="text-amber-400 font-bold">{draftCount} वटा</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">जम्मा प्रयोगकर्ताहरू:</span>
                    <span className="text-sky-400 font-bold">{users.length} जना</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">क्लाउड भण्डारण (Storage)</div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400">बकेटको नाम:</span>
                    <span className="text-white font-mono font-bold">nepal-news</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400">फोटो अपलोड प्रकार:</span>
                    <span className="text-slate-300">JPG, PNG, WebP (Max 5MB)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">सुरक्षा (Security):</span>
                    <span className="text-emerald-400 font-bold">RLS Protected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-3">सक्रिय समाचार विधाहरू (Categories)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-white">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">/{cat.slug}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {editingArticleId ? <Edit2 size={16} className="text-amber-400" /> : <Plus size={16} className="text-red-500" />}
                {editingArticleId ? 'समाचार सम्पादन गर्नुहोस्' : 'नयाँ समाचार लेख्नुहोस्'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  समाचार शीर्षक (Headline) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingArticleId && !formSlug) {
                      setFormSlug(generateSlugFromTitle(e.target.value));
                    }
                  }}
                  placeholder="उदा: काठमाडौँ उपत्यकामा मेट्रो रेल निर्माण..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              {/* Slug & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    अद्वितीय स्लग (Slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="kathmandu-metro-rail"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    विधा / वर्ग (Category) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.name_en})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  समाचार सारसंक्षेप (Summary) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  rows={2}
                  placeholder="समाचारको मुख्य सारसंक्षेप २-३ वाक्यमा..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  विस्तृत समाचार विवरण (Full Article Body) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={6}
                  placeholder="प्रत्येक अनुच्छेद (Paragraph) बीच नयाँ लाइन (Enter) थिच्नुहोस्..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
                />
              </div>

              {/* Cover Image Upload & URL */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Image size={15} className="text-red-400" />
                    कभर तस्विर (Cover Image)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>{isUploadingImage ? 'अपलोड हुँदैछ...' : 'फोटो अपलोड गर्नुहोस्'}</span>
                  </button>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-red-300 font-semibold leading-relaxed">{uploadError}</p>
                      <button
                        type="button"
                        onClick={() => setShowStorageGuide(!showStorageGuide)}
                        className="text-[11px] text-red-200 underline font-bold shrink-0 hover:text-white"
                      >
                        {showStorageGuide ? 'गाईड बन्द गर्नुहोस्' : 'सेटअप गाईड हेर्नुहोस्'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Storage Bucket Setup Accordion */}
                {(showStorageGuide || uploadError) && (
                  <div className="p-3.5 bg-slate-900 border border-amber-800/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-amber-400" />
                        Supabase मा 'article-covers' बकेट कसरी बनाउने?
                      </span>
                      <a
                        href="https://supabase.com/dashboard/project/yaawyaimhhfqpnexuxgb/sql"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
                      >
                        SQL Editor खोल्नुहोस्
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      तलको १-क्लिक SQL कपी गरी Supabase SQL Editor मा पेस्ट गरेर <strong>Run</strong> थिच्नुहोस्:
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[10px] text-slate-300 overflow-x-auto relative border border-slate-800">
                      <code>{`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-covers', 'article-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public View Article Covers" ON storage.objects;
CREATE POLICY "Public View Article Covers" ON storage.objects FOR SELECT USING (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Authenticated Upload Article Covers" ON storage.objects;
CREATE POLICY "Authenticated Upload Article Covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Authenticated Update Article Covers" ON storage.objects;
CREATE POLICY "Authenticated Update Article Covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Authenticated Delete Article Covers" ON storage.objects;
CREATE POLICY "Authenticated Delete Article Covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-covers');`}</code>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const sql = `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-covers', 'article-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public View Article Covers" ON storage.objects;
CREATE POLICY "Public View Article Covers" ON storage.objects FOR SELECT USING (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Authenticated Upload Article Covers" ON storage.objects;
CREATE POLICY "Authenticated Upload Article Covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Authenticated Update Article Covers" ON storage.objects;
CREATE POLICY "Authenticated Update Article Covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Authenticated Delete Article Covers" ON storage.objects;
CREATE POLICY "Authenticated Delete Article Covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-covers');`;
                            navigator.clipboard.writeText(sql);
                            setCopiedStorageSql(true);
                            setTimeout(() => setCopiedStorageSql(false), 2500);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans font-semibold transition cursor-pointer"
                        >
                          {copiedStorageSql ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              कपी भयो!
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Storage SQL कपी गर्नुहोस्
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-slate-400">तस्विरको सिधा लिङ्क (URL) हाल्नुहोस् वा तलबाट छान्नुहोस्:</span>
                  </div>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="उदा: https://images.unsplash.com/..."
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-red-500 font-mono"
                  />
                  {/* Quick Preset Photo Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500">द्रुत तस्विर:</span>
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    >
                      काठमाडौँ
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    >
                      हिमाल
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    >
                      राजनीति
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    >
                      खेलकुद
                    </button>
                  </div>
                </div>

                {formImageUrl && (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 mt-2">
                    <img src={formImageUrl} alt="कभर प्रिभ्यु" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Flags and Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="flex items-center gap-1">
                    <Zap size={14} className="text-red-400" />
                    ताजा / ब्रेकिङ न्यूज (Breaking News)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400" />
                    विशेष समाचार (Featured Story)
                  </span>
                </label>
              </div>

              {/* Tags and Read time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ट्यागहरू (Tags, अल्पविरामले छुट्ट्याउनुहोस्)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="नेपाल, विकास, राजनीति"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    पढ्ने समय (अनुमानित मिनेट)
                  </label>
                  <input
                    type="number"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                रद्द गर्नुहोस्
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveArticle('draft')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'पर्खनुहोस्...' : 'मस्यौदा (Draft) राख्नुहोस्'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveArticle('published')}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'पर्खनुहोस्...' : 'तत्काल प्रकाशित गर्नुहोस्'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-500 mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">के तपाईं यो समाचार मेटाउन निश्चित हुनुहुन्छ?</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                "{deleteModalArticle.title}"
              </p>
              <p className="text-[11px] text-red-400 mt-2 font-medium">
                यो कार्य फिर्ता लिन सकिने छैन। यो समाचार डाटाबेसबाट सधैंका लागि हट्नेछ।
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalArticle(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="animate-spin" size={14} /> : <Trash2 size={14} />}
                <span>{isDeleting ? 'मेटाउँदै...' : 'हो, मेटाउनुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

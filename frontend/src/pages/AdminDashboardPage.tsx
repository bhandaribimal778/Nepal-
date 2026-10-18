import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, LogOut, CheckCircle, Clock, Zap, 
  Search, RefreshCw, X, Shield, Globe, Upload, Image, 
  AlertTriangle, ChevronLeft, ChevronRight, Eye, Star,
  Check, Filter, FileText
} from 'lucide-react';
import { AuthSession, SupabaseAuth } from '../lib/supabaseAuth';
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
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
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
  const [formAltText, setFormAltText] = useState('');
  const [formReadTime, setFormReadTime] = useState(3);
  const [formTags, setFormTags] = useState('नेपाल, समाचार');

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Categories on Mount
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0 && !formCategoryId) {
        setFormCategoryId(cats[0].id);
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

  useEffect(() => {
    fetchArticles();
  }, [session.access_token, filterStatus, filterCategoryId, currentPage]);

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
    setFormAltText('समाचार कभर फोटो');
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
    setFormAltText(art.alt_text || art.title || '');
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
        if (!formAltText) {
          setFormAltText(formTitle || file.name);
        }
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
        alt_text: formAltText.trim() || formTitle.trim(),
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
          ? 'समाचार अप्रकाशित (Draft) गरियो' 
          : 'समाचार तत्काल प्रकाशित गरियो!'
      );
      fetchArticles();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'स्थिति परिवर्तन गर्न असफल भयो');
    }
  };

  // Confirm Delete
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

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xl shadow">
              ने
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">व्यवस्थापक प्यानल</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                  <Shield size={11} className="text-red-400" />
                  ADMIN RLS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                नेपाल न्यूज कन्टेन्ट म्यानेजमेन्ट (CMS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              title="पब्लिक वेबसाइट खोल्नुहोस्"
            >
              <Globe size={14} className="text-sky-400" />
              <span>पब्लिक पोर्टल</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold transition"
              title="लगआउट"
            >
              <LogOut size={14} />
              <span>लगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Alerts */}
        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" />
              <span className="text-sm font-semibold">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-950/80 border border-red-600 text-red-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Dashboard Control Header */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-red-500" />
                समाचार व्यवस्थापन (Article CRUD)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                कुल समाचार संख्या: <strong className="text-slate-200">{totalCount}</strong> | पृष्ठ {currentPage} / {totalPages}
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-950 transition hover:scale-[1.02] cursor-pointer"
            >
              <Plus size={18} />
              <span>नयाँ समाचार सिर्जना गर्नुहोस्</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शीर्षक, सारसंक्षेप वा स्लग खोज्नुहोस्..."
                className="w-full pl-9 pr-20 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold"
              >
                खोज्नुहोस्
              </button>
            </form>

            {/* Status Filter */}
            <div className="md:col-span-3 flex items-center gap-2">
              <Filter size={15} className="text-slate-500 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">सबै स्थिति (All Status)</option>
                <option value="published">प्रकाशित (Published)</option>
                <option value="draft">मस्यौदा (Draft)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={filterCategoryId}
                onChange={(e) => {
                  setFilterCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">सबै विधा (All Categories)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <div className="md:col-span-1 flex justify-end">
              <button
                onClick={fetchArticles}
                disabled={isLoading}
                className="p-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition"
                title="रिफ्रेस गर्नुहोस्"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin text-red-400' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Articles Table View */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw size={28} className="animate-spin text-red-500 mx-auto" />
              <p className="text-sm text-slate-400">डाटाबेसबाट समाचारहरू लोड हुँदैछन्...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText size={36} className="text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">कुनै समाचार भेटिएन</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                तपाईंको खोजी वा फिल्टर अनुसार कुनै पनि समाचार फेला परेन।
              </p>
              <button
                onClick={openCreateModal}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                <Plus size={14} /> पहिलो समाचार थप्नुहोस्
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">फोटो</th>
                    <th className="py-3.5 px-4 font-semibold">शीर्षक र स्लग</th>
                    <th className="py-3.5 px-4 font-semibold">विधा</th>
                    <th className="py-3.5 px-4 font-semibold">स्थिति</th>
                    <th className="py-3.5 px-4 font-semibold">ट्याग / ब्याज</th>
                    <th className="py-3.5 px-4 font-semibold text-right">कार्यहरू (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-900/40 transition">
                      {/* Thumbnail */}
                      <td className="py-3 px-4 w-16">
                        <img
                          src={art.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=200&q=80'}
                          alt={art.alt_text || art.title}
                          className="w-14 h-10 object-cover rounded-md border border-slate-800 bg-slate-900"
                          loading="lazy"
                        />
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-bold text-white text-sm line-clamp-1 hover:text-red-400 transition cursor-pointer" onClick={() => openEditModal(art)}>
                          {art.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-500">slug:</span>
                          <span className="truncate max-w-xs">{art.slug}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {art.categories?.name || 'समाचार'}
                        </span>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(art)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            art.status === 'published'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900/70'
                              : 'bg-amber-950/60 text-amber-400 border-amber-800 hover:bg-amber-900/70'
                          }`}
                          title="स्थिति परिवर्तन गर्न क्लिक गर्नुहोस्"
                        >
                          {art.status === 'published' ? (
                            <>
                              <CheckCircle size={12} /> प्रकाशित
                            </>
                          ) : (
                            <>
                              <Clock size={12} /> मस्यौदा (Draft)
                            </>
                          )}
                        </button>
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {art.is_breaking && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 flex items-center gap-0.5">
                              <Zap size={10} /> ताजा
                            </span>
                          )}
                          {art.is_featured && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-0.5">
                              <Star size={10} /> मुख्य
                            </span>
                          )}
                          {!art.is_breaking && !art.is_featured && (
                            <span className="text-[11px] text-slate-500">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(art)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                            title="सम्पादन गर्नुहोस् (Edit)"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModalArticle(art)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 transition"
                            title="मेटाउनुहोस् (Delete)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-slate-900/70 border-t border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                कुल {totalCount} मध्ये {(currentPage - 1) * itemsPerPage + 1} देखि{' '}
                {Math.min(currentPage * itemsPerPage, totalCount)} सम्म
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs text-slate-300 font-semibold flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> अघिल्लो
                </button>

                <span className="text-xs font-semibold px-2 text-slate-300">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs text-slate-300 font-semibold flex items-center gap-1"
                >
                  पछिल्लो <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE / EDIT ARTICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {editingArticleId ? (
                  <>
                    <Edit2 size={18} className="text-sky-400" />
                    समाचार सम्पादन (Edit Article)
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-red-500" />
                    नयाँ समाचार सिर्जना (New Article)
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Title & Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  समाचारको शीर्षक (Headline) <span className="text-red-400">*</span>
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
                  placeholder="उदा: काठमाडौँमा नयाँ विद्युतीय बस सेवा सञ्चालन"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Unique Slug */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    अद्वितीय स्लग (Unique URL Slug) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormSlug(generateSlugFromTitle(formTitle))}
                    className="text-[11px] text-sky-400 hover:underline font-semibold"
                  >
                    शीर्षकबाट नयाँ स्लग बनाउनुहोस्
                  </button>
                </div>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\u0900-\u097F-]/g, '-'))}
                  placeholder="kathmandu-electric-bus-service"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  यो स्लग लेखको स्थायी वेब लिङ्क (URL) बन्नेछ।
                </p>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    विधा / श्रेणी (Category) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.name_en || cat.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    प्रकाशन स्थिति (Status)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="published">प्रकाशित (Published - तुरुन्तै लाइभ हुने)</option>
                    <option value="draft">मस्यौदा (Draft - अप्रकाशित राख्ने)</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  सारसंक्षेप (Summary) <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="समाचारको मुख्य मुख्य अंश १-२ वाक्यमा..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Full Article Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex justify-between">
                  <span>पूर्ण समाचार विवरण (Article Body) <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-slate-500">हरेक अनुच्छेद (Paragraph) बीच खाली लाइन छोड्नुहोस्</span>
                </label>
                <textarea
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="विस्तृत समाचार यहाँ लेख्नुहोस्..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Cover Image & Supabase Storage Upload */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Image size={15} className="text-sky-400" />
                    कभर फोटो (Cover Image & Storage)
                  </label>
                  <span className="text-[10px] text-slate-500">अधिकतम ५ MB (JPG, PNG, WEBP)</span>
                </div>

                {uploadError && (
                  <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded-lg border border-red-900">
                    {uploadError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      id="cover-upload-input"
                    />
                    <label
                      htmlFor="cover-upload-input"
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-600 hover:border-sky-400 bg-slate-900 hover:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-300 transition ${
                        isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload size={14} className={isUploadingImage ? 'animate-bounce text-sky-400' : ''} />
                      <span>{isUploadingImage ? 'अपलोड हुँदैछ...' : 'फोटो अपलोड गर्नुहोस् (Storage)'}</span>
                    </label>
                  </div>

                  {/* Direct URL Input */}
                  <div>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="वा सिधै फोटोको URL राख्नुहोस्..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Alt Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    फोटो विवरण (Image Alt Text - SEO र पहुँचका लागि):
                  </label>
                  <input
                    type="text"
                    value={formAltText}
                    onChange={(e) => setFormAltText(e.target.value)}
                    placeholder="उदा: काठमाडौँमा चल्ने नयाँ विद्युतीय बसको दृश्य"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Image Preview */}
                {formImageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-40 bg-slate-900 flex items-center justify-center">
                    <img
                      src={formImageUrl}
                      alt={formAltText || 'Preview'}
                      className="max-h-40 w-auto object-contain"
                      onError={() => setUploadError('फोटो लोड हुन सकेन। कृपया URL जाँच गर्नुहोस्।')}
                    />
                  </div>
                )}
              </div>

              {/* Flags & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <Zap size={14} className="text-red-400" />
                  <span>ताजा अपडेट (Breaking News Ticker)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <Star size={14} className="text-amber-400" />
                  <span>मुख्य समाचार (Featured Hero Story)</span>
                </label>
              </div>

              {/* Tags & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-400">ट्यागहरू (Tags, comma separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="यातायात, काठमाडौँ, विकास"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">पढ्न लाग्ने समय (मिनेट)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                रद्द गर्नुहोस् (Cancel)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveArticle('draft')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Clock size={14} />
                  <span>मस्यौदा सुरक्षित (Draft)</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveArticle('published')}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-950 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>{editingArticleId ? 'सच्याएर प्रकाशित गर्नुहोस्' : 'तत्काल प्रकाशित गर्नुहोस्'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-500 border border-red-800 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-base font-bold text-white">के तपाईं यो समाचार मेटाउन निश्चित हुनुहुन्छ?</h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                "{deleteModalArticle.title}"
              </p>
              <p className="text-[11px] text-red-400 font-medium">
                यो कार्य फिर्ता लिन सकिने छैन। यो समाचार डाटाबेसबाट स्थायी रूपमा हटाइनेछ।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalArticle(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>मेटाउनुहोस् (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

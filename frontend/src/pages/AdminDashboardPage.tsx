import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, LogOut, CheckCircle, Clock, Zap, 
  ExternalLink, Search, RefreshCw, X, Shield, Globe 
} from 'lucide-react';
import { AuthSession, SupabaseAuth } from '../lib/supabaseAuth';
import { CATEGORIES } from '../fixtures/newsFixtures';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('politics');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formReadTime, setFormReadTime] = useState(3);
  const [formTags, setFormTags] = useState('नेपाल, समाचार');

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await SupabaseAuth.getAdminArticles(session.access_token);
      setArticles(data);
    } catch (err: any) {
      setError(err.message || 'समाचार लोड गर्न सकिएन');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [session.access_token]);

  const openCreateModal = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormSlug('');
    setFormSummary('');
    setFormContent('');
    setFormCategorySlug('politics');
    setFormStatus('published');
    setFormIsBreaking(false);
    setFormIsFeatured(false);
    setFormImageUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80');
    setFormReadTime(3);
    setFormTags('नेपाल, समाचार');
    setIsModalOpen(true);
  };

  const openEditModal = (art: any) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormSlug(art.slug);
    setFormSummary(art.summary);
    setFormContent(Array.isArray(art.content) ? art.content.join('\n\n') : art.content);
    setFormCategorySlug(art.categories?.slug || 'politics');
    setFormStatus(art.status || 'published');
    setFormIsBreaking(Boolean(art.is_breaking));
    setFormIsFeatured(Boolean(art.is_featured));
    setFormImageUrl(art.image_url || '');
    setFormReadTime(art.read_time_minutes || 3);
    setFormTags(Array.isArray(art.tags) ? art.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      alert('कृपया शीर्षक र सारसंक्षेप अनिवार्य रूपमा लेख्नुहोस्।');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Generate slug if empty
      const cleanSlug = formSlug.trim() || 
        formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
        `news-${Date.now()}`;

      // Convert content to array of paragraphs
      const paragraphs = formContent
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      // Resolve category UUID from slug
      // Note: In Supabase, categories has slug 'politics', 'economy', etc.
      // We query categories from current articles list or default to current article's category_id
      const matchedCategory = articles.find(a => a.categories?.slug === formCategorySlug)?.category_id ||
        articles[0]?.category_id;

      const payload = {
        title: formTitle.trim(),
        slug: cleanSlug,
        summary: formSummary.trim(),
        content: paragraphs.length ? paragraphs : [formSummary.trim()],
        category_id: matchedCategory,
        status: formStatus,
        is_breaking: formIsBreaking,
        is_featured: formIsFeatured,
        image_url: formImageUrl.trim(),
        read_time_minutes: Number(formReadTime) || 3,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        published_at: formStatus === 'published' ? new Date().toISOString() : null
      };

      if (editingArticleId) {
        await SupabaseAuth.updateArticle(session.access_token, editingArticleId, payload);
        setSuccessMessage('समाचार सफलतापूर्वक सच्याइयो!');
      } else {
        await SupabaseAuth.createArticle(session.access_token, payload);
        setSuccessMessage('नयाँ समाचार सफलतापूर्वक सिर्जना गरियो!');
      }

      setIsModalOpen(false);
      await fetchArticles();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`त्रुटि: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`के तपाईं निश्चित रूपमा यो समाचार मेटाउन चाहनुहुन्छ?\n\n"${title}"`)) {
      return;
    }

    try {
      await SupabaseAuth.deleteArticle(session.access_token, id);
      setSuccessMessage('समाचार सफलतापूर्वक मेटाइयो!');
      await fetchArticles();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`त्रुटि: ${err.message}`);
    }
  };

  const handleToggleStatus = async (art: any) => {
    const nextStatus = art.status === 'published' ? 'draft' : 'published';
    try {
      await SupabaseAuth.updateArticle(session.access_token, art.id, {
        status: nextStatus,
        published_at: nextStatus === 'published' ? new Date().toISOString() : null
      });
      await fetchArticles();
    } catch (err: any) {
      alert(`त्रुटि: ${err.message}`);
    }
  };

  // Filtered list
  const filtered = articles.filter(art => {
    const matchesStatus = filterStatus === 'all' || art.status === filterStatus;
    const matchesSearch = !searchQuery.trim() || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const breakingCount = articles.filter(a => a.is_breaking).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Top Admin Navigation */}
      <header className="bg-slate-900 text-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xl">
              ने
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">नेपाल न्यूज एडमिन प्यानल</h1>
                <span className="bg-red-600/30 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={10} /> व्यवस्थापक (Admin)
                </span>
              </div>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewPublicSite}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Globe size={14} /> सार्वजनिक पोर्टल हेर्नुहोस्
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-500/30"
            >
              <LogOut size={14} /> लगआउट
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">कुल समाचार</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{articles.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={14} /> प्रकाशित (Live)
            </p>
            <p className="text-3xl font-black text-emerald-700 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock size={14} /> मस्यौदा (Drafts)
            </p>
            <p className="text-3xl font-black text-amber-700 mt-1">{draftCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap size={14} /> ताजा अपडेट (Breaking)
            </p>
            <p className="text-3xl font-black text-red-600 mt-1">{breakingCount}</p>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow flex items-center gap-2 transition-all w-full md:w-auto justify-center"
            >
              <Plus size={18} /> नयाँ समाचार लेख्नुहोस्
            </button>
            <button
              onClick={fetchArticles}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shrink-0"
              title="रिफ्रेस गर्नुहोस्"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-bold text-slate-700 shrink-0">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg ${filterStatus === 'all' ? 'bg-white shadow text-slate-900' : ''}`}
              >
                सबै ({articles.length})
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-3 py-1.5 rounded-lg ${filterStatus === 'published' ? 'bg-white shadow text-emerald-700' : ''}`}
              >
                प्रकाशित ({publishedCount})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-3 py-1.5 rounded-lg ${filterStatus === 'draft' ? 'bg-white shadow text-amber-700' : ''}`}
              >
                मस्यौदा ({draftCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-60">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शीर्षक खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading && articles.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">समाचारहरू लोड हुँदैछ...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">कुनै समाचार भेटिएन।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">समाचार शीर्षक</th>
                    <th className="px-4 py-3.5">विधा</th>
                    <th className="px-4 py-3.5">स्थिति</th>
                    <th className="px-4 py-3.5">विशेषताहरू</th>
                    <th className="px-4 py-3.5 text-right">कार्यहरू (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 leading-snug line-clamp-1 max-w-md">
                          {art.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">
                          {art.summary}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded">
                          {art.categories?.name || 'अन्य'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(art)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            art.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="स्थिति परिवर्तन गर्न क्लिक गर्नुहोस्"
                        >
                          {art.status === 'published' ? '● प्रकाशित (Live)' : '○ मस्यौदा (Draft)'}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap space-x-1.5">
                        {art.is_breaking && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            ताजा
                          </span>
                        )}
                        {art.is_featured && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            मुख्य
                          </span>
                        )}
                        {!art.is_breaking && !art.is_featured && (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => openEditModal(art)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                          title="सम्पादन गर्नुहोस्"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="मेटाउनुहोस्"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-black text-slate-900">
                {editingArticleId ? 'समाचार सम्पादन गर्नुहोस्' : 'नयाँ समाचार लेख्नुहोस्'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  समाचार शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="उदा: काठमाडौँ उपत्यकाको सार्वजनिक यातायात सुधार..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    विधा / श्रेणी (Category)
                  </label>
                  <select
                    value={formCategorySlug}
                    onChange={(e) => setFormCategorySlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  >
                    {CATEGORIES.filter(c => c.slug !== 'all').map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    प्रकाशन स्थिति (Status)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  >
                    <option value="published">प्रकाशित (Live - Published)</option>
                    <option value="draft">मस्यौदा (Draft - Unlisted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  सारसंक्षेप (Summary / Lead) *
                </label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="समाचारको छोटो सारांश..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  विस्तृत सामग्री (Full Content - अनुच्छेदहरू)
                </label>
                <textarea
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="हरेक नयाँ अनुच्छेदका लागि Enter थिचेर खाली लाइन छोड्नुहोस्..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  तस्बिर लिङ्क (Image URL)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span>🔴 ताजा अपडेट टिकरमा देखाउनुहोस् (Breaking News)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span>⭐ मुख्य समाचार बनाउनुहोस् (Featured Hero)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow transition-all disabled:opacity-70"
                >
                  {isSubmitting ? 'सुरक्षित गरिँदै...' : editingArticleId ? 'सच्याउनुहोस्' : 'सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

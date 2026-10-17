import React, { useState, useEffect } from 'react';
import { Article, NewsCategory, PageRoute } from './types/news';
import { FIXTURE_ARTICLES } from './fixtures/newsFixtures';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NewsCard } from './components/NewsCard';
import { EmptyState } from './components/EmptyState';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { getPublishedArticles } from './lib/supabaseClient';
import { AuthSession, SupabaseAuth } from './lib/supabaseAuth';
import { Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>({ type: 'home' });
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['art-1', 'art-3']));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [articles, setArticles] = useState<Article[]>(FIXTURE_ARTICLES);
  const [adminSession, setAdminSession] = useState<AuthSession | null>(() => SupabaseAuth.getSession());

  const loadData = async () => {
    try {
      setIsLoading(true);
      const liveArticles = await getPublishedArticles();
      setArticles(liveArticles);
      setHasError(false);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShare = (article: Article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert(`समाचार साझा गरियो:\n\n${article.title}\n\nनेपाल न्यूज पोर्टल`);
    }
  };

  const navigateToArticle = (article: Article) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute({ type: 'article', articleId: article.id });
  };

  const handleLogout = async () => {
    await SupabaseAuth.signOut();
    setAdminSession(null);
    setCurrentRoute({ type: 'home' });
  };

  const selectedArticle =
    currentRoute.type === 'article'
      ? articles.find((a) => a.id === currentRoute.articleId) || articles[0]
      : null;

  const savedArticles = articles.filter((a) => bookmarkedIds.has(a.id));

  // Determine if on admin portal screens
  const isAdminView = currentRoute.type === 'admin-login' || currentRoute.type === 'admin-dashboard';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Public Header (only shown outside admin dashboard) */}
      {!isAdminView && (
        <Header
          onSearchClick={() => setCurrentRoute({ type: 'search' })}
          onSavedClick={() => setCurrentRoute({ type: 'saved' })}
          savedCount={bookmarkedIds.size}
        />
      )}

      {/* Public Category Navigation (only shown outside admin dashboard) */}
      {!isAdminView && (
        <Navigation
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
          selectedCategory={selectedCategory}
          onCategorySelect={(cat) => {
            setSelectedCategory(cat);
            if (currentRoute.type !== 'home') {
              setCurrentRoute({ type: 'category', category: cat });
            }
          }}
        />
      )}

      <main className="flex-1">
        {/* Admin Login Route */}
        {currentRoute.type === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={() => {
              const sess = SupabaseAuth.getSession();
              setAdminSession(sess);
              setCurrentRoute({ type: 'admin-dashboard' });
            }}
            onBackToHome={() => setCurrentRoute({ type: 'home' })}
          />
        )}

        {/* Protected Admin Dashboard Route */}
        {currentRoute.type === 'admin-dashboard' && (
          adminSession ? (
            <AdminDashboardPage
              session={adminSession}
              onLogout={handleLogout}
              onViewPublicSite={() => {
                loadData();
                setCurrentRoute({ type: 'home' });
              }}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => {
                const sess = SupabaseAuth.getSession();
                setAdminSession(sess);
                setCurrentRoute({ type: 'admin-dashboard' });
              }}
              onBackToHome={() => setCurrentRoute({ type: 'home' })}
            />
          )
        )}

        {/* Public Routes */}
        {!isAdminView && (
          isLoading ? (
            <LoadingSkeleton />
          ) : hasError ? (
            <ErrorState
              message="इन्टरनेट वा सर्भरमा समस्या देखिएको छ। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।"
              onRetry={loadData}
            />
          ) : (
            <>
              {currentRoute.type === 'home' && (
                <HomePage
                  articles={articles}
                  selectedCategory={selectedCategory}
                  bookmarkedIds={bookmarkedIds}
                  onArticleClick={navigateToArticle}
                  onBookmarkToggle={handleBookmarkToggle}
                  onShare={handleShare}
                  onResetCategory={() => setSelectedCategory('all')}
                />
              )}

              {currentRoute.type === 'category' && (
                <CategoryPage
                  category={currentRoute.category}
                  articles={articles}
                  bookmarkedIds={bookmarkedIds}
                  onArticleClick={navigateToArticle}
                  onBookmarkToggle={handleBookmarkToggle}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setCurrentRoute({ type: 'category', category: cat });
                  }}
                />
              )}

              {currentRoute.type === 'search' && (
                <SearchPage
                  articles={articles}
                  bookmarkedIds={bookmarkedIds}
                  onArticleClick={navigateToArticle}
                  onBookmarkToggle={handleBookmarkToggle}
                  initialQuery={currentRoute.query}
                />
              )}

              {currentRoute.type === 'saved' && (
                <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-20">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-black text-slate-900 border-l-4 border-red-600 pl-3">
                      सुरक्षित गरिएका समाचारहरू
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      तपाईंले पछि पढ्नका लागि सञ्चय गरेका समाचारहरू
                    </p>
                  </div>

                  {savedArticles.length === 0 ? (
                    <EmptyState
                      title="कुनै समाचार सुरक्षित छैन"
                      message="समाचार पढ्दै गर्दा बुकमार्क आइकन थिचेर सुरक्षित राख्न सक्नुहुन्छ।"
                      actionText="ताजा समाचार हेर्नुहोस्"
                      onAction={() => setCurrentRoute({ type: 'home' })}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedArticles.map((art) => (
                        <NewsCard
                          key={art.id}
                          article={art}
                          isBookmarked={true}
                          onArticleClick={navigateToArticle}
                          onBookmarkToggle={handleBookmarkToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentRoute.type === 'article' && selectedArticle && (
                <ArticleDetailPage
                  article={selectedArticle}
                  allArticles={articles}
                  isBookmarked={bookmarkedIds.has(selectedArticle.id)}
                  onBack={() => setCurrentRoute({ type: 'home' })}
                  onBookmarkToggle={handleBookmarkToggle}
                  onShare={handleShare}
                  onArticleClick={navigateToArticle}
                />
              )}
            </>
          )
        )}
      </main>

      {/* Footer with Admin Portal Access */}
      {!isAdminView && (
        <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                ने
              </span>
              <span className="text-white font-bold text-sm">नेपाल न्यूज</span>
              <span>| निष्पक्ष, विश्वसनीय र द्रुत समाचार</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  if (adminSession) {
                    setCurrentRoute({ type: 'admin-dashboard' });
                  } else {
                    setCurrentRoute({ type: 'admin-login' });
                  }
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
              >
                <Shield size={14} className="text-red-500" />
                व्यवस्थापक प्यानल (Admin)
              </button>
              <div className="text-slate-500">
                © {new Date().getFullYear()} नेपाल न्यूज पोर्टल (Nepal News).
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;

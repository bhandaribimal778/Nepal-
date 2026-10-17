import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Share2, Volume2, Pause, MessageSquare } from 'lucide-react';
import { Article } from '../types/news';
import { FIXTURE_COMMENTS } from '../fixtures/newsFixtures';
import { NewsCard } from '../components/NewsCard';

interface ArticleDetailPageProps {
  article: Article;
  allArticles: Article[];
  isBookmarked: boolean;
  onBack: () => void;
  onBookmarkToggle: (articleId: string) => void;
  onShare: (article: Article) => void;
  onArticleClick: (article: Article) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  allArticles,
  isBookmarked,
  onBack,
  onBookmarkToggle,
  onShare,
  onArticleClick
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const related = allArticles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-lg leading-relaxed';
      case 'xlarge': return 'text-xl leading-loose';
      default: return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top back bar and actions */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-red-600 font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          पछाडि फर्कनुहोस्
        </button>

        <div className="flex items-center gap-2">
          {/* Font size toggles */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs font-bold text-slate-700">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white shadow text-slate-900' : ''}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-white shadow text-slate-900' : ''}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded ${fontSize === 'xlarge' ? 'bg-white shadow text-slate-900' : ''}`}
            >
              A++
            </button>
          </div>

          <button
            onClick={() => onBookmarkToggle(article.id)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="सुरक्षित राख्नुहोस्"
          >
            <Bookmark size={20} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
          <button
            onClick={() => onShare(article)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="साझेदारी गर्नुहोस्"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Category & Headline */}
      <div className="space-y-3">
        <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
          {article.categoryLabel}
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">✍️ {article.author}</span>
            <span>• {article.authorRole}</span>
          </div>
          <div>
            <span>प्रकाशित: {article.publishedAt}</span> • <span>{article.readTimeMinutes} मिनेट पढाइ</span>
          </div>
        </div>
      </div>

      {/* Audio Reader Simulator Bar */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow"
          >
            {isPlayingAudio ? <Pause size={20} /> : <Volume2 size={20} />}
          </button>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {isPlayingAudio ? 'समाचार वाचन भइरहेको छ...' : 'समाचार अडियो सुन्नुहोस्'}
            </p>
            <p className="text-xs text-slate-500">स्वचालित नेपाली बोली रूपान्तरण</p>
          </div>
        </div>
        {isPlayingAudio && (
          <div className="flex gap-1 items-end h-5">
            <span className="w-1 bg-red-600 h-2 animate-bounce"></span>
            <span className="w-1 bg-red-600 h-5 animate-bounce delay-75"></span>
            <span className="w-1 bg-red-600 h-3 animate-bounce delay-150"></span>
          </div>
        )}
      </div>

      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden shadow-sm max-h-[480px]">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Summary Box */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl">
        <p className="font-semibold text-red-950 text-sm md:text-base leading-relaxed">
          सारसंक्षेप: {article.summary}
        </p>
      </div>

      {/* Article Paragraphs */}
      <div className={`space-y-5 text-slate-800 ${getFontSizeClass()}`}>
        {article.content.map((p, idx) => (
          <p key={idx} className="tracking-normal">
            {p}
          </p>
        ))}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Comment Section with Development Notice */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-red-600" size={20} />
          <h3 className="font-bold text-slate-900 text-lg">टिप्पणीहरू</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>डेभलपमेन्ट सूचना:</strong> Supabase ब्याकइन्ड जोडिएपछि पाठकहरूले प्रत्यक्ष टिप्पणी पोस्ट गर्न सक्नेछन्।
        </div>
        <div className="space-y-3 divide-y divide-slate-100">
          {FIXTURE_COMMENTS.map((c) => (
            <div key={c.id} className="pt-3 first:pt-0">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-800">{c.author}</span>
                <span>{c.timeAgo}</span>
              </div>
              <p className="text-sm text-slate-700">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related News */}
      {related.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="font-black text-slate-900 text-xl border-l-4 border-red-600 pl-3">
            सम्बन्धित समाचारहरू
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                isBookmarked={false}
                onArticleClick={onArticleClick}
                onBookmarkToggle={onBookmarkToggle}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Loader2, KeyRound, Copy, Check, ChevronDown, ChevronUp, ExternalLink, HelpCircle } from 'lucide-react';
import { SupabaseAuth } from '../lib/supabaseAuth';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptedEmail, setAttemptedEmail] = useState<string>('');
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAttemptedEmail(email.trim());

    if (!email.trim() || !password) {
      setErrorMessage('कृपया इमेल र पासवर्ड दुवै भर्नुहोस्।');
      return;
    }

    try {
      setIsLoading(true);
      await SupabaseAuth.signIn(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'लगइन गर्न सकिएन। विवरण जाँच गर्नुहोस्।');
      if (err.message?.includes('व्यवस्थापक (Admin) अधिकार दिइएको छैन') || err.message?.includes('पहुँच अस्वीकृत')) {
        setShowSqlHelp(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sqlCommand = attemptedEmail 
    ? `UPDATE public.profiles SET role = 'admin' WHERE email = '${attemptedEmail}';`
    : `UPDATE public.profiles SET role = 'admin' WHERE email = 'तपाईंको_इमेल';`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCommand);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-slate-950 p-6 text-white text-center relative border-b border-slate-800">
          <button
            onClick={onBackToHome}
            className="absolute left-4 top-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="गृहपृष्ठ फर्कनुहोस्"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-lg shadow-red-600/30">
            ने
          </div>
          <h2 className="text-xl font-black tracking-tight">व्यवस्थापक पोर्टल (Admin Portal)</h2>
          <p className="text-xs text-slate-400 mt-1">नेपाल न्यूज समाचार तथा प्रयोगकर्ता सम्पादकीय प्रणाली</p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 text-xs">
              <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm text-red-800">लगइन असफल:</p>
                <p className="mt-1 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                इमेल ठेगाना (Admin Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  प्रमाणीकरण भइरहेको छ...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  व्यवस्थापक लगइन गर्नुहोस्
                </>
              )}
            </button>
          </form>

          {/* Admin Instructions Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
            <button
              type="button"
              onClick={() => setShowSqlHelp(!showSqlHelp)}
              className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-500" />
                व्यवस्थापक (Admin) कसरी लगइन गर्ने?
              </span>
              {showSqlHelp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSqlHelp && (
              <div className="p-4 pt-1 border-t border-slate-200 text-xs text-slate-600 space-y-3">
                <p>
                  १. तपाईंको खातालाई Supabase डेटाबेसमा <code>role = 'admin'</code> तोकिनुपर्छ।
                </p>
                <p>
                  २. <strong>Supabase SQL Editor</strong> मा जानुहोस् र यो १-लाइन कमाण्ड चलाउनुहोस्:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative overflow-x-auto">
                  <code>{sqlCommand}</code>
                  <button
                    onClick={handleCopySql}
                    className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-sans font-semibold transition"
                  >
                    {copiedSql ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        कपी गरियो!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        SQL कमाण्ड कपी गर्नुहोस्
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <a
                    href="https://supabase.com/dashboard/project/yaawyaimhhfqpnexuxgb/sql"
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 underline"
                  >
                    Supabase SQL Editor खोल्नुहोस्
                    <ExternalLink size={12} />
                  </a>
                  <span className="text-slate-400">Direct Link: #admin</span>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>डेटाबेस Row Level Security (RLS) र Supabase Auth द्वारा सुरक्षित।</span>
          </div>
        </div>
      </div>
    </div>
  );
};

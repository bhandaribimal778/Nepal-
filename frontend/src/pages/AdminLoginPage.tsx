import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onBackToHome}
            className="absolute left-4 top-5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="गृहपृष्ठ फर्कनुहोस्"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow">
            ने
          </div>
          <h2 className="text-xl font-black">व्यवस्थापक पोर्टल (Admin Portal)</h2>
          <p className="text-xs text-slate-400 mt-1">नेपाल न्यूज सम्पादकीय व्यवस्थापन प्रणाली</p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">लगइन त्रुटि:</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                इमेल ठेगाना (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-sm transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-1">
            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              डेटाबेस RLS द्वारा सुरक्षित
            </p>
            <p>
              साधारण पाठक खाताबाट एडमिन प्यानल खुल्ने छैन। केवल <code>public.profiles</code> मा <code>role = 'admin'</code> प्रमाणित भएका प्रयोगकर्ताहरूले मात्र समाचार सम्पादन गर्न सक्नेछन्।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

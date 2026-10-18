import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { SupabaseAuth, UserProfile } from '../lib/supabaseAuth';

interface UserAuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile, isNewRegistration?: boolean) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('कृपया आफ्नो इमेल ठेगाना लेख्नुहोस्।');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('कृपया मान्य इमेल ठेगाना लेख्नुहोस् (उदा: user@example.com)');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्दछ।');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('कृपया आफ्नो पूरा नाम लेख्नुहोस्।');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('दुवै पासवर्डहरू मेल खाएनन्। कृपया जाँच गर्नुहोस्।');
        return;
      }
    }

    try {
      setIsLoading(true);

      if (mode === 'login') {
        const { profile } = await SupabaseAuth.userSignIn(cleanEmail, password);
        setSuccessMessage('लगइन सफल भयो! स्वागत छ।');
        setTimeout(() => {
          onAuthSuccess(profile, false);
          onClose();
        }, 600);
      } else {
        const result = await SupabaseAuth.userSignUp(cleanEmail, password, fullName.trim());
        if (result.profile) {
          setSuccessMessage(result.message || 'खाता सिर्जना सम्पन्न भयो! तपाईं लगइन हुनुभयो।');
          setTimeout(() => {
            onAuthSuccess(result.profile!, true);
            onClose();
          }, 800);
        } else {
          setSuccessMessage(result.message);
          // Switch to login tab so user can sign in
          setTimeout(() => {
            setMode('login');
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'प्रक्रिया सम्पन्न हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
          aria-label="बन्द गर्नुहोस्"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-lg ring-4 ring-white/10">
            ने
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {mode === 'login' ? 'प्रयोगकर्ता लगइन' : 'नयाँ खाता दर्ता'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            नेपाल न्यूज पोर्टलमा पाठक वा सम्पादकको रूपमा जोडिनुहोस्
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-5 border border-slate-700">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              लगइन (Sign In)
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              नयाँ दर्ता (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">त्रुटि:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">सफल:</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पूरा नाम (Full Name) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="उदा: बिमल भण्डारी"
                    required
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-xs transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                इमेल ठेगाना (Email Address) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bhandaribimal778@gmail.com"
                  required
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पासवर्ड (Password) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="कम्तिमा ६ अक्षरको पासवर्ड"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पासवर्ड पुष्टि गर्नुहोस् (Confirm Password) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड पुनः लेख्नुहोस्"
                    required
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-xs transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>कृपया पर्खनुहोस्...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <ShieldCheck size={16} />
                  <span>लगइन गर्नुहोस् (Sign In)</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>खाता सिर्जना गर्नुहोस् (Register)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Footer Helper */}
          <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            {mode === 'login' ? (
              <p>
                खाता छैन?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-bold text-red-600 hover:underline"
                >
                  यहाँ नयाँ दर्ता गर्नुहोस्
                </button>
              </p>
            ) : (
              <p>
                पहिले नै खाता छ?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-red-600 hover:underline"
                >
                  यहाँ लगइन गर्नुहोस्
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

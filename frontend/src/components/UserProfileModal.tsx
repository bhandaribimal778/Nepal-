import React, { useState } from 'react';
import { X, User, Mail, Shield, Bookmark, Trash2, LogOut, Check, AlertCircle, Loader2, Image, Camera } from 'lucide-react';
import { SupabaseAuth, UserProfile, AuthSession } from '../lib/supabaseAuth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  session?: AuthSession | null;
  savedCount: number;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
  onNavigateToSaved: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  session,
  savedCount,
  onProfileUpdated,
  onLogout,
  onNavigateToSaved
}) => {
  const [fullName, setFullName] = useState(userProfile.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    try {
      setIsSaving(true);
      setErrorMsg(null);
      const updated = await SupabaseAuth.updateUserProfile(
        session.access_token,
        userProfile.id,
        {
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim()
        }
      );
      onProfileUpdated(updated);
      setSuccessMsg('तपाईंको प्रोफाइल विवरण सफलतापूर्वक सुरक्षित गरियो!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'प्रोफाइल अपडेट गर्न सकिएन');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;

    try {
      setIsDeleting(true);
      await SupabaseAuth.deleteUserAccount(session.access_token, userProfile.id);
      onLogout();
      onClose();
      alert('तपाईंको खाता र व्यक्तिगत विवरण सफलतापूर्वक मेटाइयो।');
    } catch (err: any) {
      alert(err.message || 'खाता मेटाउन सकिएन');
    } finally {
      setIsDeleting(false);
    }
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-lg">
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold">प्रयोगकर्ता प्रोफाइल तथा सेटिङहरू</h2>
              <p className="text-xs text-slate-400">{userProfile.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                पूरा नाम (Full Name)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="तपाईंको नाम..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                फोटो / प्रोफाइल तस्विर (Avatar URL)
              </label>
              <div className="relative mb-2">
                <Image size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... फोटोको सिधा लिङ्क"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                />
              </div>

              {/* Quick avatar selection */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-semibold">तस्विर छान्नुहोस्:</span>
                <div className="flex items-center gap-1.5">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt="avatar"
                      onClick={() => setAvatarUrl(p)}
                      className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition hover:scale-110 ${
                        avatarUrl === p ? 'border-red-600' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  सुरक्षित हुँदैछ...
                </>
              ) : (
                'परिवर्तन सुरक्षित गर्नुहोस् (Save Profile)'
              )}
            </button>
          </form>

          {/* Quick Account Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-red-500" />
                खाताको भूमिका (Role):
              </span>
              <span className="font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                {userProfile.role === 'admin' ? 'व्यवस्थापक (Admin)' : 'प्रमाणित पाठक (Reader)'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <Bookmark size={14} className="text-amber-500" />
                सुरक्षित समाचारहरू:
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToSaved();
                }}
                className="font-bold text-red-600 hover:underline"
              >
                {savedCount} वटा समाचार हेर्नुहोस्
              </button>
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="pt-2 border-t border-slate-200">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 size={13} />
                  खाता सधैँका लागि मेटाउनुहोस् (Delete Account)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                >
                  <LogOut size={13} />
                  लगआउट
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-red-800">
                  के तपाईं निश्चित हुनुहुन्छ? खाता मेटाएपछि सबै डाटा हट्नेछ।
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                  >
                    {isDeleting ? 'मेटाउँदै...' : 'हो, खाता मेटाउनुहोस्'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                  >
                    रद्द गर्नुहोस्
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

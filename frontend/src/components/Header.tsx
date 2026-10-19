import React, { useState, useRef, useEffect } from 'react';
import { Search, Bookmark, Shield, User, LogOut, ChevronDown, LayoutDashboard, UserCheck, Settings, Moon, Sun } from 'lucide-react';
import { UserProfile } from '../lib/supabaseAuth';
import { LiveNepalClockBar } from './LiveNepalClockBar';

interface HeaderProps {
  onSearchClick: () => void;
  onSavedClick: () => void;
  onAdminClick: () => void;
  onAuthClick: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
  savedCount: number;
  userProfile?: UserProfile | null;
  isAdminLoggedIn?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isEnglish?: boolean;
  onToggleLanguage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearchClick, 
  onSavedClick, 
  onAdminClick,
  onAuthClick,
  onLogoutClick,
  onProfileClick,
  onLogoClick,
  savedCount,
  userProfile,
  isAdminLoggedIn,
  isDarkMode = false,
  onToggleDarkMode,
  isEnglish = false,
  onToggleLanguage
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name.trim().charAt(0).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().charAt(0).toUpperCase();
    }
    return 'U';
  };

  const isAdmin = userProfile?.role === 'admin' || isAdminLoggedIn;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      {/* 1. Live Nepal Clock & Calendar Bar (NPT UTC+05:45, Bikram Sambat, Live ticking) */}
      <LiveNepalClockBar
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        isEnglish={isEnglish}
        onToggleLanguage={onToggleLanguage}
      />

      {/* 2. Main Brand Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer group"
          title="गृहपृष्ठ जानुहोस्"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            ने
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
              {isEnglish ? 'Nepal News' : 'नेपाल न्यूज'}
            </h1>
            <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              {isEnglish ? 'Digital News & Live Updates' : 'निष्पक्ष, द्रुत र विश्वसनीय समाचार'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={onSearchClick}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            title={isEnglish ? 'Search news' : 'समाचार खोज्नुहोस्'}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Bookmarks Button */}
          <button
            onClick={onSavedClick}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 relative transition-colors"
            title={isEnglish ? 'Saved Articles' : 'सुरक्षित समाचार'}
            aria-label="Bookmarks"
          >
            <Bookmark size={18} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Button */}
          {userProfile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="प्रयोगकर्ता खाता"
                aria-label="User Profile"
              >
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="avatar"
                    className="w-7 h-7 rounded-lg object-cover border border-slate-600"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {getInitials(userProfile.full_name, userProfile.email)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold truncate max-w-[100px]">
                    {userProfile.full_name || userProfile.email.split('@')[0]}
                  </div>
                  <div className="text-[9px] text-slate-400 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    {isAdmin ? (isEnglish ? 'Admin' : 'व्यवस्थापक') : (isEnglish ? 'Reader' : 'पाठक')}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {userProfile.full_name || 'पाठक (Reader)'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {userProfile.email}
                    </p>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAdmin 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <UserCheck size={10} />
                        {isAdmin ? 'व्यवस्थापक (Admin)' : 'प्रमाणित पाठक (Reader)'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Edit Profile Option */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User size={14} className="text-slate-500" />
                      <span>{isEnglish ? 'Edit Profile & Photo' : 'प्रोफाइल र फोटो सम्पादन'}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onAdminClick();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LayoutDashboard size={14} />
                        <span>{isEnglish ? 'Admin Dashboard' : 'एडमिन ड्यासबोर्ड'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSavedClick();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Bookmark size={14} className="text-amber-500" />
                      <span>{isEnglish ? `Saved Articles (${savedCount})` : `सुरक्षित समाचारहरू (${savedCount})`}</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogoutClick();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>{isEnglish ? 'Sign Out' : 'लगआउट गर्नुहोस्'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm"
              title="प्रयोगकर्ता लगइन वा दर्ता गर्नुहोस्"
            >
              <User size={15} className="text-amber-400" />
              <span>{isEnglish ? 'Sign In / Register' : 'लगइन / दर्ता'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

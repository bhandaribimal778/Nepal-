import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Globe, Sparkles, Moon, Sun, ArrowRightLeft } from 'lucide-react';
import { getNepalLiveClock, BikramSambatDate, adToBikramSambat } from '../lib/nepaliCalendar';

interface LiveNepalClockBarProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isEnglish?: boolean;
  onToggleLanguage?: () => void;
}

export const LiveNepalClockBar: React.FC<LiveNepalClockBarProps> = ({
  isDarkMode = false,
  onToggleDarkMode,
  isEnglish = false,
  onToggleLanguage
}) => {
  const [clockData, setClockData] = useState(() => getNepalLiveClock(new Date(), isEnglish));
  // Default to Gregorian in Nepali as requested: 'ad' = १९ अक्टोबर २०२६, toggle to 'bs' = वि.सं. २०८३ कात्तिक १
  const [dateMode, setDateMode] = useState<'ad' | 'bs'>('ad');

  useEffect(() => {
    // Immediate initial sync
    setClockData(getNepalLiveClock(new Date(), isEnglish));

    // Tick every 1000ms accurately without page reload
    const timerId = setInterval(() => {
      setClockData(getNepalLiveClock(new Date(), isEnglish));
    }, 1000);

    // Lifecycle cleanup
    return () => {
      clearInterval(timerId);
    };
  }, [isEnglish]);

  const toggleDateMode = () => {
    setDateMode((prev) => (prev === 'ad' ? 'bs' : 'ad'));
  };

  return (
    <div className={`w-full text-xs border-b transition-colors duration-200 select-none ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-300 border-slate-800' 
        : 'bg-slate-900 text-slate-200 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Live Clock & Date */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          {/* Live Digital Clock Badge with ticking seconds and pulsing dot */}
          <div 
            className="flex items-center gap-1.5 bg-red-950/90 text-red-300 border border-red-700/80 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold shadow-sm"
            title="नेपाल मानक समय (NPT: UTC+05:45) - प्रत्यक्ष घडी"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <Clock size={12} className="text-red-400" />
            <span className="tracking-wide">{isEnglish ? clockData.timeEn : clockData.timeNe}</span>
          </div>

          {/* Automatic Calendar: Nepali Gregorian Date & Bikram Sambat (BS) */}
          <div 
            onClick={toggleDateMode}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer group transition-colors"
            title="मिति प्रणाली परिवर्तन गर्न क्लिक गर्नुहोस् (नेपाली मिति / विक्रम संवत्)"
          >
            <Calendar size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[11px]">
              {dateMode === 'ad' ? (
                <>
                  <span className="text-sky-300 font-bold mr-1">
                    {isEnglish ? 'Date:' : 'मिति:'}
                  </span>
                  <span>{isEnglish ? clockData.dateAdEn : clockData.dateAdNe}</span>
                  <span className="hidden md:inline text-slate-400 ml-1.5 font-normal">
                    ({isEnglish ? `BS: ${clockData.dateBsEn}` : `वि.सं. ${clockData.dateBsNe}`})
                  </span>
                </>
              ) : (
                <>
                  <span className="text-amber-300 font-bold mr-1">
                    {isEnglish ? 'BS Date:' : 'वि.सं.:'}
                  </span>
                  <span>{isEnglish ? clockData.dateBsEn : clockData.dateBsNe}</span>
                  <span className="hidden md:inline text-slate-400 ml-1.5 font-normal">
                    ({isEnglish ? `AD: ${clockData.dateAdEn}` : `ई.सं. ${clockData.dateAdNe}`})
                  </span>
                </>
              )}
            </span>
            <span className="text-[9px] bg-slate-800 group-hover:bg-slate-700 px-1.5 py-0.5 rounded text-amber-300 border border-slate-700 flex items-center gap-1 transition">
              <ArrowRightLeft size={9} />
              <span>{dateMode === 'ad' ? 'वि.सं.' : 'ई.सं. (AD)'}</span>
            </span>
          </div>
        </div>

        {/* Right: Timezone Tag, Dark Mode & Language Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          {/* Timezone label: Asia/Kathmandu (UTC+05:45) */}
          <span 
            className="hidden sm:inline-flex items-center gap-1 text-slate-400 font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
            title="नेपाल मानक समय (Nepal Standard Time, UTC+05:45)"
          >
            <Globe size={11} className="text-emerald-400" />
            <span>काठमाडौँ (NPT, UTC+5:45)</span>
          </span>

          {/* Language Switcher */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition font-semibold text-[11px] flex items-center gap-1"
              title="नेपाली / English भाषा परिवर्तन गर्नुहोस्"
            >
              <span>{isEnglish ? 'नेपाली' : 'English'}</span>
            </button>
          )}

          {/* Dark Mode Switcher */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition"
              title={isDarkMode ? 'Light Mode मा जानुहोस्' : 'Dark Mode (रात्री मोड) मा जानुहोस्'}
              aria-label="Theme Toggle"
            >
              {isDarkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-300" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

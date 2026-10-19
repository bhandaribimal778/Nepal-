/**
 * Accurate Nepali Calendar (Bikram Sambat - BS), Live Clock, and Nepal Standard Time (NPT: UTC+05:45) utilities.
 * Timezone: Asia/Kathmandu (UTC+5:45)
 */

// Month names in Nepali and English
export const NEPALI_BS_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

export const NEPALI_BS_MONTHS_EN = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const NEPALI_DAYS = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

export const NEPALI_DAYS_EN = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const GREGORIAN_MONTHS_NE = [
  'जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन',
  'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'
];

// Numerals converter: 0-9 to ०-९
export function toNepaliNumerals(input: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return input.toString().replace(/[0-9]/g, (digit) => nepaliDigits[parseInt(digit, 10)]);
}

/**
 * Standard Bikram Sambat Calendar Days Data per month (2070 BS to 2090 BS)
 * Covers 2013 AD to 2034 AD accurately.
 * Each array contains the number of days in [Baisakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra]
 */
const BS_CALENDAR_DATA: { [key: number]: number[] } = {
  2070: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], // 2026 AD
  2084: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2087: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2088: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
};

// Reference point: 2080 Baisakh 1 = April 14, 2023
const REF_BS_YEAR = 2080;
const REF_BS_MONTH = 1;
const REF_BS_DAY = 1;
const REF_AD_DATE = new Date('2023-04-14T00:00:00.000Z');

export interface BikramSambatDate {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 32
  monthNameNe: string;
  monthNameEn: string;
  dayNameNe: string;
  dayNameEn: string;
  formattedNe: string;
  formattedEn: string;
}

/**
 * Convert AD Date to Bikram Sambat (BS) Date
 */
export function adToBikramSambat(adDate: Date = new Date()): BikramSambatDate {
  // Convert to Nepal Standard Time (UTC+05:45)
  const nptOffsetMs = 5.75 * 60 * 60 * 1000;
  const utcMs = adDate.getTime() + (adDate.getTimezoneOffset() * 60 * 1000);
  const nptDate = new Date(utcMs + nptOffsetMs);

  // Normalize reference date and target date to UTC start of day
  const targetDayMs = Date.UTC(nptDate.getFullYear(), nptDate.getMonth(), nptDate.getDate());
  const refDayMs = REF_AD_DATE.getTime();

  let diffDays = Math.floor((targetDayMs - refDayMs) / (24 * 60 * 60 * 1000));

  let bsYear = REF_BS_YEAR;
  let bsMonth = REF_BS_MONTH;
  let bsDay = REF_BS_DAY;

  if (diffDays >= 0) {
    while (diffDays > 0) {
      const yearDays = BS_CALENDAR_DATA[bsYear] || [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
      const monthDays = yearDays[bsMonth - 1];
      const daysLeftInMonth = monthDays - bsDay + 1;

      if (diffDays >= daysLeftInMonth) {
        diffDays -= daysLeftInMonth;
        bsDay = 1;
        bsMonth++;
        if (bsMonth > 12) {
          bsMonth = 1;
          bsYear++;
        }
      } else {
        bsDay += diffDays;
        diffDays = 0;
      }
    }
  } else {
    // Dates before reference
    while (diffDays < 0) {
      bsMonth--;
      if (bsMonth < 1) {
        bsMonth = 12;
        bsYear--;
      }
      const yearDays = BS_CALENDAR_DATA[bsYear] || [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
      const monthDays = yearDays[bsMonth - 1];

      if (Math.abs(diffDays) >= monthDays) {
        diffDays += monthDays;
      } else {
        bsDay = monthDays + diffDays + 1;
        diffDays = 0;
      }
    }
  }

  const dayOfWeek = nptDate.getDay(); // 0 = Sunday
  const monthNameNe = NEPALI_BS_MONTHS[bsMonth - 1] || '';
  const monthNameEn = NEPALI_BS_MONTHS_EN[bsMonth - 1] || '';
  const dayNameNe = NEPALI_DAYS[dayOfWeek];
  const dayNameEn = NEPALI_DAYS_EN[dayOfWeek];

  const formattedNe = `${toNepaliNumerals(bsYear)} ${monthNameNe} ${toNepaliNumerals(bsDay)} गते, ${dayNameNe}`;
  const formattedEn = `${bsDay} ${monthNameEn} ${bsYear}, ${dayNameEn}`;

  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    monthNameNe,
    monthNameEn,
    dayNameNe,
    dayNameEn,
    formattedNe,
    formattedEn
  };
}

/**
 * Returns Gregorian (AD) Date in Nepali Devanagari format
 * e.g., "१९ अक्टोबर २०२६, सोमबार"
 */
export function getGregorianInNepali(date: Date = new Date()): string {
  // Convert to Nepal Standard Time
  const nptOffsetMs = 5.75 * 60 * 60 * 1000;
  const utcMs = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  const nptDate = new Date(utcMs + nptOffsetMs);

  const day = toNepaliNumerals(nptDate.getDate());
  const month = GREGORIAN_MONTHS_NE[nptDate.getMonth()];
  const year = toNepaliNumerals(nptDate.getFullYear());
  const dayName = NEPALI_DAYS[nptDate.getDay()];

  return `${day} ${month} ${year}, ${dayName}`;
}

/**
 * Get Real-Time Live Clock in Nepal Standard Time (UTC+05:45)
 */
export function getNepalLiveClock(date: Date = new Date(), isEnglish: boolean = false) {
  // Calculate Nepal Time
  const nptOffsetMs = 5.75 * 60 * 60 * 1000;
  const utcMs = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  const nptDate = new Date(utcMs + nptOffsetMs);

  let hours = nptDate.getHours();
  const minutes = nptDate.getMinutes();
  const seconds = nptDate.getSeconds();
  const isPm = hours >= 12;
  const periodEn = isPm ? 'PM' : 'AM';

  // Nepali time of day descriptor
  let periodNe = 'बिहान';
  if (hours >= 12 && hours < 16) {
    periodNe = 'दिउँसो';
  } else if (hours >= 16 && hours < 19) {
    periodNe = 'साँझ';
  } else if (hours >= 19 || hours < 4) {
    periodNe = 'राति';
  }

  // 12-hour format
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const rawTimeStr = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}`;
  const timeNe = `${toNepaliNumerals(pad(displayHours))}:${toNepaliNumerals(pad(minutes))}:${toNepaliNumerals(pad(seconds))} ${periodNe}`;
  const timeEn = `${rawTimeStr} ${periodEn} (NPT)`;

  const bs = adToBikramSambat(date);
  const adNe = getGregorianInNepali(date);
  const adEn = nptDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    weekday: 'short'
  });

  return {
    timeNe,
    timeEn,
    dateBsNe: bs.formattedNe,
    dateBsEn: bs.formattedEn,
    dateAdNe: adNe,
    dateAdEn: adEn,
    dayNameNe: bs.dayNameNe,
    dayNameEn: bs.dayNameEn,
    nepalTime: nptDate
  };
}

/**
 * Calculate Relative Time in Nepali for published articles
 * e.g., "५ मिनेटअघि", "२ घण्टाअघि", "हिजो", or formatted date
 */
export function formatArticlePublishedAt(
  isoDateString?: string | null,
  isEnglish: boolean = false
): { relativeTime: string; fullDateTime: string } {
  if (!isoDateString) {
    return {
      relativeTime: isEnglish ? 'Recently' : 'भर्खरै',
      fullDateTime: isEnglish ? 'Nepal Standard Time' : 'नेपाल समय'
    };
  }

  try {
    const pubDate = new Date(isoDateString);
    if (isNaN(pubDate.getTime())) {
      return {
        relativeTime: isEnglish ? 'Recently' : 'भर्खरै',
        fullDateTime: ''
      };
    }

    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now.getTime() - pubDate.getTime()) / 1000));

    // Convert pubDate to Nepal time
    const nptOffsetMs = 5.75 * 60 * 60 * 1000;
    const utcMs = pubDate.getTime() + (pubDate.getTimezoneOffset() * 60 * 1000);
    const nptDate = new Date(utcMs + nptOffsetMs);

    const pad = (n: number) => n.toString().padStart(2, '0');
    let hours = nptDate.getHours();
    const minutes = nptDate.getMinutes();
    const isPm = hours >= 12;
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    const timePartNe = `${toNepaliNumerals(displayHours)}:${toNepaliNumerals(pad(minutes))} ${isPm ? 'अपराह्न' : 'पूर्वाह्न'}`;
    const timePartEn = `${displayHours}:${pad(minutes)} ${isPm ? 'PM' : 'AM'}`;

    const bs = adToBikramSambat(pubDate);
    const fullDateTime = isEnglish 
      ? `${bs.formattedEn} at ${timePartEn}`
      : `${bs.formattedNe}, ${timePartNe}`;

    let relativeTime = '';

    if (diffSeconds < 60) {
      relativeTime = isEnglish ? 'Just now' : 'भर्खरै';
    } else if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      relativeTime = isEnglish ? `${mins}m ago` : `${toNepaliNumerals(mins)} मिनेटअघि`;
    } else if (diffSeconds < 86400) {
      const hrs = Math.floor(diffSeconds / 3600);
      relativeTime = isEnglish ? `${hrs}h ago` : `${toNepaliNumerals(hrs)} घण्टाअघि`;
    } else if (diffSeconds < 172800) {
      relativeTime = isEnglish ? `Yesterday, ${timePartEn}` : `हिजो, ${timePartNe}`;
    } else if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      relativeTime = isEnglish ? `${days}d ago` : `${toNepaliNumerals(days)} दिनअघि`;
    } else {
      // Older than a week, show BS date
      relativeTime = isEnglish 
        ? `${bs.day} ${bs.monthNameEn}` 
        : `${bs.monthNameNe} ${toNepaliNumerals(bs.day)}`;
    }

    return { relativeTime, fullDateTime };
  } catch {
    return {
      relativeTime: isEnglish ? 'Recently' : 'भर्खरै',
      fullDateTime: ''
    };
  }
}

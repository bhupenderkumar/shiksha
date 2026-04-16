// Calendar service — Calendarific API + local caching + school day logic

export interface Holiday {
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: string[];
  primary_type: string;
}

const CACHE_KEY = 'shiksha_holidays_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const API_KEY = import.meta.env.VITE_CALENDARIFIC_API_KEY || '';

interface CacheEntry {
  holidays: Holiday[];
  fetchedAt: number;
  year: number;
}

function getCachedHolidays(year: number): Holiday[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${year}`);
    if (!raw) return null;
    const cache: CacheEntry = JSON.parse(raw);
    if (Date.now() - cache.fetchedAt > CACHE_TTL) return null;
    return cache.holidays;
  } catch {
    return null;
  }
}

function cacheHolidays(year: number, holidays: Holiday[]) {
  try {
    const entry: CacheEntry = { holidays, fetchedAt: Date.now(), year };
    localStorage.setItem(`${CACHE_KEY}_${year}`, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

async function fetchFromCalendarific(year: number): Promise<Holiday[]> {
  if (!API_KEY) {
    console.warn('Calendarific API key not set. Using empty holiday list.');
    return [];
  }

  const url = `https://calendarific.com/api/v2/holidays?api_key=${encodeURIComponent(API_KEY)}&country=IN&year=${year}&type=national,religious`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error('Calendarific API error:', response.status);
    return [];
  }

  const data = await response.json();
  const holidays: Holiday[] = (data.response?.holidays || []).map((h: any) => ({
    name: h.name,
    description: h.description || '',
    date: h.date?.iso?.split('T')[0] || '',
    type: h.type || [],
    primary_type: h.primary_type || 'National holiday',
  }));

  cacheHolidays(year, holidays);
  return holidays;
}

function filterByRange(holidays: Holiday[], start: string, end: string): Holiday[] {
  return holidays.filter(h => h.date >= start && h.date <= end);
}

export const calendarService = {
  async getHolidaysForYear(year: number): Promise<Holiday[]> {
    const cached = getCachedHolidays(year);
    if (cached) return cached;
    return fetchFromCalendarific(year);
  },

  async getHolidaysInRange(startDate: string, endDate: string): Promise<Holiday[]> {
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    let holidays: Holiday[] = [];
    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = await this.getHolidaysForYear(year);
      holidays = holidays.concat(yearHolidays);
    }

    return filterByRange(holidays, startDate, endDate);
  },

  async getUpcomingHolidays(fromDate: string, days = 7): Promise<Holiday[]> {
    const endDate = new Date(fromDate);
    endDate.setDate(endDate.getDate() + days);
    return this.getHolidaysInRange(fromDate, endDate.toISOString().split('T')[0]);
  },

  isSchoolDay(date: string, holidays: Holiday[]): boolean {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) return false; // Sunday
    return !holidays.some(h => h.date === date);
  },

  getNextSchoolDay(fromDate: string, holidays: Holiday[]): string {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + 1);

    // Look ahead max 30 days
    for (let i = 0; i < 30; i++) {
      const dateStr = date.toISOString().split('T')[0];
      if (this.isSchoolDay(dateStr, holidays)) {
        return dateStr;
      }
      date.setDate(date.getDate() + 1);
    }

    // Fallback: just return tomorrow
    const tomorrow = new Date(fromDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  getHolidaysForMonth(year: number, month: number, holidays: Holiday[]): Holiday[] {
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return holidays.filter(h => h.date.startsWith(prefix));
  },
};

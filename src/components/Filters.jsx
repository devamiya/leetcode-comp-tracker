import React, { useMemo } from 'react';
import { getWeekKey, getMonthKey, parseWeekKey, addDaysUtc, formatWeekLabel, formatMonthLabel } from '../utils/dateUtils';

export default function Filters({ globalData, periodMode, setPeriodMode, subFilter, setSubFilter, currency, setCurrency }) {
  const options = useMemo(() => {
    const opts = { weekly: [], monthly: [] };
    if (!globalData || !globalData.offers) return opts;

    if (periodMode === 'weekly') {
      const weeks = new Map();
      globalData.offers.forEach(offer => {
        const weekKey = getWeekKey(offer.post_date);
        if (!weekKey || weeks.has(weekKey)) return;
        const weekStart = parseWeekKey(weekKey);
        const weekEnd = addDaysUtc(weekStart, 6);
        weeks.set(weekKey, formatWeekLabel(weekStart, weekEnd));
      });
      opts.weekly = Array.from(weeks.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([value, label]) => ({ value, label }));
    } else if (periodMode === 'monthly') {
      const months = new Map();
      globalData.offers.forEach(offer => {
        const monthKey = getMonthKey(offer.post_date);
        if (!monthKey || months.has(monthKey)) return;
        months.set(monthKey, formatMonthLabel(monthKey));
      });
      opts.monthly = Array.from(months.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([value, label]) => ({ value, label }));
    }
    return opts;
  }, [globalData, periodMode]);

  return (
    <>
      <select 
        id="filter-period" 
        className="select-filter" 
        style={{ marginRight: '8px' }}
        value={periodMode}
        onChange={(e) => {
          setPeriodMode(e.target.value);
          setSubFilter(''); // reset subfilter on view switch
        }}
      >
        <option value="all">All Time</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      
      <select 
        id="filter-sub" 
        className="select-filter" 
        title="Filter by period"
        value={subFilter}
        onChange={(e) => setSubFilter(e.target.value)}
        disabled={periodMode === 'all'}
      >
        <option value="">{periodMode === 'weekly' ? 'All Weeks' : periodMode === 'monthly' ? 'All Months' : 'All'}</option>
        {periodMode === 'weekly' && options.weekly.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
        {periodMode === 'monthly' && options.monthly.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </>
  );
}

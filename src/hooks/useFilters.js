import { useMemo } from 'react';
import { getWeekKey, getMonthKey } from '../utils/dateUtils';
import { getOfferCurrency } from '../utils/formatters';
import { reaggregateData } from './useData';
import { useDebounce } from './useDebounce';
import useFilterStore from '../store/useFilterStore';

export function useFilters(globalData) {
  const {
    periodMode, setPeriodMode,
    subFilter, setSubFilter,
    currency, setCurrency,
    searchQuery, setSearchQuery,
    sortState, setSortState
  } = useFilterStore();

  // Debounce the search query to reduce computation spikes on keystroke
  // The input stays responsive (instant typing), only the derived filter is delayed
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 1. Filter out data based on the Time settings
  const timeFilteredData = useMemo(() => {
    if (!globalData || !globalData.offers) return null;
    let activeOffers = globalData.offers;

    if (subFilter) {
      if (periodMode === 'weekly') {
        activeOffers = activeOffers.filter(o => getWeekKey(o.post_date) === subFilter);
      } else if (periodMode === 'monthly') {
        activeOffers = activeOffers.filter(o => getMonthKey(o.post_date) === subFilter);
      }
    }

    if (currency) {
      activeOffers = activeOffers.filter(o => getOfferCurrency(o) === currency);
    }

    return reaggregateData(activeOffers);
  }, [globalData, periodMode, subFilter, currency]);

  // 2. Filter out data based on the (debounced) Search String for the Table only
  const searchFilteredOffers = useMemo(() => {
    if (!timeFilteredData) return [];
    
    let filtered = timeFilteredData.offers;
    
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(o => {
        const haystack = [
          o.company, o.company_normalized, o.role, o.role_normalized, o.location,
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(search);
      });
    }

    // Sort
    return [...filtered].sort((a, b) => {
      const col = sortState.column;
      let va = a[col], vb = b[col];
      if (va == null) va = col === 'company' || col === 'role' ? '' : -Infinity;
      if (vb == null) vb = col === 'company' || col === 'role' ? '' : -Infinity;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortState.direction === 'asc' ? cmp : -cmp;
    });

  }, [timeFilteredData, debouncedSearch, sortState]);

  return {
    periodMode, setPeriodMode,
    subFilter, setSubFilter,
    currency, setCurrency,
    searchQuery, setSearchQuery,
    sortState, setSortState,
    dashboardData: timeFilteredData,
    tableOffers: searchFilteredOffers
  };
}

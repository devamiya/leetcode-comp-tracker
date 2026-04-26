/**
 * Filter state store (Zustand).
 * 
 * Holds UI-local filter state: period, currency, search, sort.
 * Kept separate from globalStore to avoid coupling UI state with data state.
 */
import { create } from 'zustand';

const useFilterStore = create((set) => ({
  // Filter state
  periodMode: 'all',       // 'all', 'weekly', 'monthly'
  subFilter: '',
  currency: 'INR',
  searchQuery: '',
  sortState: { column: 'total', direction: 'desc' },

  // Actions
  setPeriodMode: (periodMode) => set({ periodMode }),
  setSubFilter: (subFilter) => set({ subFilter }),
  setCurrency: (currency) => set({ currency }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortState: (sortState) => set({ sortState }),

  // Reset all filters
  resetFilters: () => set({
    periodMode: 'all',
    subFilter: '',
    currency: 'INR',
    searchQuery: '',
    sortState: { column: 'total', direction: 'desc' },
  }),
}));

export default useFilterStore;

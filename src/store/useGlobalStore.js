/**
 * Global data store (Zustand).
 * 
 * Holds the shared application data fetched by React Query.
 * Any component can access globalData without prop chains.
 */
import { create } from 'zustand';

const useGlobalStore = create((set) => ({
  // Data state
  globalData: null,
  loading: true,
  error: null,

  // Actions
  setGlobalData: (data) => set({ globalData: data, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));

export default useGlobalStore;

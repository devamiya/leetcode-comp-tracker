import { useState, useCallback } from 'react';

const STORAGE_KEY = 'leetcode_comp_bookmarks';

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Hook for managing bookmarked offers via localStorage.
 * Identifies offers by post_url (unique per offer).
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  const isBookmarked = useCallback((postUrl) => {
    return bookmarks.includes(postUrl);
  }, [bookmarks]);

  const toggleBookmark = useCallback((postUrl) => {
    setBookmarks(prev => {
      const next = prev.includes(postUrl)
        ? prev.filter(u => u !== postUrl)
        : [...prev, postUrl];
      saveBookmarks(next);
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    saveBookmarks([]);
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, clearBookmarks };
}

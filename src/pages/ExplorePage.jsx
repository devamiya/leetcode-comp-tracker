import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Grid3X3, List, Search, Bookmark } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import OfferCard from '../components/OfferCard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBookmarks } from '../hooks/useBookmarks';
import { useData } from '../hooks/useData';
import { getOfferCurrency } from '../utils/formatters';

export default function ExplorePage() {
  const { data: globalData } = useData();
  const [viewMode, setViewMode] = useState('cards');
  const [sortBy, setSortBy] = useState('total_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const [filters, setFilters] = useState({
    companies: [],
    roles: [],
    locations: [],
    yoe: null,
    currency: '',
    recency: 'all',
  });

  const allOffers = globalData?.offers || [];

  // Apply filters
  const filteredOffers = useMemo(() => {
    let result = [...allOffers];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(o => {
        const hay = [o.company, o.company_normalized, o.role, o.role_normalized, o.location]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    // Company filter
    if (filters.companies?.length > 0) {
      const set = new Set(filters.companies.map(c => c.toLowerCase()));
      result = result.filter(o => {
        const cn = (o.company_normalized || o.company || '').toLowerCase();
        return set.has(cn);
      });
    }

    // Role filter
    if (filters.roles?.length > 0) {
      const set = new Set(filters.roles.map(r => r.toLowerCase()));
      result = result.filter(o => {
        const rn = (o.role_normalized || o.role || '').toLowerCase();
        return set.has(rn);
      });
    }

    // Location filter
    if (filters.locations?.length > 0) {
      const set = new Set(filters.locations.map(l => l.toLowerCase()));
      result = result.filter(o => set.has((o.location || '').toLowerCase()));
    }

    // YOE range
    if (filters.yoe) {
      result = result.filter(o =>
        o.yoe != null && o.yoe >= filters.yoe[0] && o.yoe <= filters.yoe[1]
      );
    }

    // Currency
    if (filters.currency) {
      result = result.filter(o => getOfferCurrency(o) === filters.currency);
    }

    // Recency
    if (filters.recency && filters.recency !== 'all') {
      const days = parseInt(filters.recency);
      const dates = allOffers.map(o => o.post_date ? new Date(o.post_date).getTime() : 0).filter(Boolean);
      const maxDate = Math.max(...dates);
      const cutoff = maxDate - days * 86400000;
      result = result.filter(o => {
        if (!o.post_date) return false;
        return new Date(o.post_date).getTime() >= cutoff;
      });
    }

    // Sort
    const [field, dir] = sortBy.split('_');
    result.sort((a, b) => {
      let va = a[field], vb = b[field];
      if (field === 'date') { va = a.post_date; vb = b.post_date; }
      if (va == null) va = dir === 'desc' ? -Infinity : Infinity;
      if (vb == null) vb = dir === 'desc' ? -Infinity : Infinity;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });

    // Show only saved
    if (showSavedOnly) {
      result = result.filter(o => o.post_url && bookmarks.includes(o.post_url));
    }

    return result;
  }, [allOffers, searchQuery, filters, sortBy, showSavedOnly, bookmarks]);

  const analytics = useAnalytics(filteredOffers);
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ paddingTop: 'var(--space-lg)' }}>
      {/* Top Search & Toolbar */}
      <div className="explore-toolbar" style={{ borderBottom: 'none', padding: 0, marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div className="search-box" style={{ flex: '1', minWidth: '280px', maxWidth: '480px', margin: 0 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search company, role, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="explore-sort">
          <select
            className="select-filter"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ minWidth: 'auto' }}
          >
            <option value="total_desc">Highest Pay</option>
            <option value="total_asc">Lowest Pay</option>
            <option value="date_desc">Most Recent</option>
            <option value="yoe_desc">Most Experience</option>
            <option value="yoe_asc">Least Experience</option>
          </select>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            className={`pill-tab ${showSavedOnly ? 'active' : ''}`}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            title={showSavedOnly ? 'Show all offers' : 'Show saved only'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Bookmark size={14} fill={showSavedOnly ? 'currentColor' : 'none'} />
            Saved ({bookmarks.length})
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <FilterBar offers={allOffers} filters={filters} setFilters={setFilters} />
      </div>

      {/* Results Count Line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--glass-border)', marginBottom: 'var(--space-lg)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <strong>{filteredOffers.length}</strong> offers found
        {analytics.percentiles.p50 != null && (
          <>
            <span>•</span>
            <span>Median: <strong style={{ color: 'var(--success)' }}>
              {analytics.percentiles.p50 >= 100000
                ? `${(analytics.percentiles.p50 / 100000).toFixed(1)}L`
                : analytics.percentiles.p50.toLocaleString()}
            </strong></span>
          </>
        )}
      </div>

      {/* Results */}
      {filteredOffers.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M8 11h6" />
          </svg>
          <div className="empty-state-title">No offers match your filters</div>
          <div className="empty-state-text">
            Try broadening your search or clearing some filters
          </div>
          <button className="btn btn-primary" onClick={() => {
            setFilters({ companies: [], roles: [], locations: [], yoe: null, currency: '', recency: 'all' });
            setSearchQuery('');
          }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="offer-cards-grid">
          {filteredOffers.slice(0, viewMode === 'cards' ? 60 : 100).map((offer, i) => (
            <OfferCard
              key={offer.post_url || i}
              offer={offer}
              median={analytics.percentiles.p50}
              index={i}
              isBookmarked={isBookmarked(offer.post_url)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}

      {filteredOffers.length > 60 && viewMode === 'cards' && (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Showing 60 of {filteredOffers.length} results. Use filters to narrow down.
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { formatSalary, getOfferCurrency, titleCase } from '../utils/formatters';
import CompanyLogo from './CompanyLogo';

const INITIAL_BATCH = 30;
const BATCH_SIZE = 20;

/**
 * Memoized row component — only re-renders when offer data actually changes.
 * Prevents full table re-renders on sort/search changes from cascading to unchanged rows.
 */
const OfferRow = memo(function OfferRow({ offer, onRowClick, onCompanyClick, style }) {
  const o = offer;
  return (
    <tr onClick={() => onRowClick(o)} title="Click to view original post" style={style}>
      <td data-label="Company" className="col-company">
        <div className="company-info-cell">
          <CompanyLogo name={o.company || o.company_normalized || ''} size={28} />
          <span
            className="company-badge"
            onClick={(e) => onCompanyClick(e, o.company_normalized || o.company)}
            title={`View ${titleCase(o.company || o.company_normalized || '')} insights`}
            style={{ cursor: 'pointer' }}
          >
            {titleCase(o.company || o.company_normalized || '—')}
          </span>
        </div>
      </td>
      <td data-label="Role" className="col-role"><span className="role-badge">{o.role_normalized || o.role || '—'}</span></td>
      <td data-label="YOE" className="col-yoe">{o.yoe != null ? o.yoe : '—'}</td>
      <td data-label="Base" className="col-base">{o.base != null ? formatSalary(o.base) : '—'}</td>
      <td data-label="Total" className="col-total">{o.total != null ? formatSalary(o.total) : '—'}</td>
      <td data-label="Currency" className="col-currency"><span className="currency-badge">{getOfferCurrency(o)}</span></td>
      <td data-label="Location" className="col-location">{o.location || '—'}</td>
      <td data-label="Link" className="td-link col-link">
        {o.post_url ? <a href={o.post_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>LeetCode ↗</a> : '—'}
      </td>
    </tr>
  );
});

import { useVirtualizer } from '@tanstack/react-virtual';

export default function OffersTable({
  offers,
  searchQuery, setSearchQuery,
  currency, setCurrency,
  sortState, setSortState
}) {
  const navigate = useNavigate();
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: offers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Estimated row height (52px is common for dense tables)
    overscan: 10, // Render 10 items outside of the visible area for smoother scrolling
  });

  const handleSort = useCallback((column) => {
    setSortState(prev => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'desc' };
    });
  }, [setSortState]);

  const SortIcon = ({ column }) => {
    if (sortState.column !== column) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon">{sortState.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleRowClick = useCallback((offer) => {
    if (offer.post_url) {
      window.open(offer.post_url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleCompanyClick = useCallback((e, companyName) => {
    e.stopPropagation();
    if (companyName) {
      navigate(`/company/${encodeURIComponent(companyName.toLowerCase())}`);
    }
  }, [navigate]);

  return (
    <section className="card card-table" id="table-section">
      <div className="table-header">
        <h2 className="card-title">📋 All Compensation Offers</h2>
        <div className="table-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search company, role, location..."
              autoComplete="off"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="select-filter"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            <option value="">All Currencies</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="table-scroll" ref={parentRef} style={{ maxHeight: '600px', overflow: 'auto' }}>
        <table className="offers-table">
          <colgroup>
            <col style={{ width: '20%' }} /> {/* Company */}
            <col style={{ width: '15%' }} /> {/* Role */}
            <col style={{ width: '7%' }} />  {/* YOE */}
            <col style={{ width: '12%' }} /> {/* Base */}
            <col style={{ width: '14%' }} /> {/* Total */}
            <col style={{ width: '8%' }} />  {/* Currency */}
            <col style={{ width: '14%' }} /> {/* Location */}
            <col style={{ width: '10%' }} /> {/* Link */}
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-card)' }}>
            <tr>
              <th onClick={() => handleSort('company')} className="sortable">Company <SortIcon column="company" /></th>
              <th onClick={() => handleSort('role')} className="sortable">Role <SortIcon column="role" /></th>
              <th onClick={() => handleSort('yoe')} className="sortable">YOE <SortIcon column="yoe" /></th>
              <th onClick={() => handleSort('base')} className="sortable">Base <SortIcon column="base" /></th>
              <th onClick={() => handleSort('total')} className="sortable">Total <SortIcon column="total" /></th>
              <th>Currency</th>
              <th onClick={() => handleSort('location')} className="sortable">Location <SortIcon column="location" /></th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const o = offers[virtualRow.index];
              return (
                <OfferRow
                  key={virtualRow.key}
                  offer={o}
                  onRowClick={handleRowClick}
                  onCompanyClick={handleCompanyClick}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                />
              );
            })}
            {offers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                    <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M8 11h6" />
                    </svg>
                    <div className="empty-state-title">No offers matched your filters</div>
                    <div className="empty-state-text">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer-controls">
        <div className="table-stats">
          Showing {Math.min(offers.length, visibleOffers.length)} of {offers.length} offers
        </div>
      </div>
    </section>
  );
}

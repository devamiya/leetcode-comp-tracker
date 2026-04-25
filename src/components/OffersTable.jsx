import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatSalary, getOfferCurrency } from '../utils/formatters';

const ITEMS_PER_PAGE = 25;

export default function OffersTable({ 
  offers,
  searchQuery, setSearchQuery,
  currency, setCurrency,
  sortState, setSortState
}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset pagination when search query or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortState, currency]);

  const handleSort = (column) => {
    if (sortState.column === column) {
      setSortState({ column, direction: sortState.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortState({ column, direction: 'desc' });
    }
  };

  const SortIcon = ({ column }) => {
    if (sortState.column !== column) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon">{sortState.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // Pagination Logic
  const totalPages = Math.ceil(offers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOffers = offers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      
      <div className="table-scroll">
        <table className="offers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('company')} className="sortable">Company <SortIcon column="company"/></th>
              <th onClick={() => handleSort('role')} className="sortable">Role <SortIcon column="role"/></th>
              <th onClick={() => handleSort('yoe')} className="sortable">YOE <SortIcon column="yoe"/></th>
              <th onClick={() => handleSort('base')} className="sortable">Base <SortIcon column="base"/></th>
              <th onClick={() => handleSort('total')} className="sortable">Total <SortIcon column="total"/></th>
              <th>Currency</th>
              <th onClick={() => handleSort('location')} className="sortable">Location <SortIcon column="location"/></th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOffers.map((o, i) => (
              <tr key={startIndex + i}>
                <td data-label="Company" className="col-company"><span className="company-badge">{o.company || o.company_normalized || '—'}</span></td>
                <td data-label="Role" className="col-role"><span className="role-badge">{o.role_normalized || o.role || '—'}</span></td>
                <td data-label="YOE" className="col-yoe">{o.yoe != null ? o.yoe : '—'}</td>
                <td data-label="Base" className="col-base">{o.base != null ? formatSalary(o.base) : '—'}</td>
                <td data-label="Total" className="col-total">{o.total != null ? formatSalary(o.total) : '—'}</td>
                <td data-label="Currency" className="col-currency"><span className="currency-badge">{getOfferCurrency(o)}</span></td>
                <td data-label="Location" className="col-location">{o.location || '—'}</td>
                <td data-label="Link" className="td-link col-link">
                  {o.post_url ? <a href={o.post_url} target="_blank" rel="noopener noreferrer">View ↗</a> : '—'}
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No offers matched your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer-controls">
        <div className="table-stats">
          Showing {Math.min(offers.length, startIndex + 1)} - {Math.min(offers.length, startIndex + ITEMS_PER_PAGE)} of {offers.length} offers
        </div>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="page-indicator">{currentPage} / {totalPages}</span>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

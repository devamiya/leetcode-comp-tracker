import React from 'react';
import { Search } from 'lucide-react';
import { formatSalary, getOfferCurrency } from '../utils/formatters';

export default function OffersTable({ 
  offers,
  searchQuery, setSearchQuery,
  currency, setCurrency,
  sortState, setSortState
}) {
  
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
            {offers.map((o, i) => (
              <tr key={i}>
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
      <div className="table-footer">
        <span>{offers.length} offer{offers.length !== 1 ? 's' : ''}</span>
      </div>
    </section>
  );
}

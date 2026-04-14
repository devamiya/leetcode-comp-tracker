import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, RefreshCw, BarChart3 } from 'lucide-react';
import Filters from './Filters';

export default function Header({
  summary,
  globalData,
  theme,
  toggleTheme,
  periodMode, setPeriodMode,
  subFilter, setSubFilter,
  currency, setCurrency,
  offers,
  isSidebarOpen, setIsSidebarOpen
}) {
  const [onlineCount, setOnlineCount] = useState(null);

  useEffect(() => {
    const fetchVisitors = () => {
      // If we are developing locally using Vite, mock the response so the badge renders
      if (import.meta.env.DEV) {
        setOnlineCount(Math.floor(Math.random() * 5) + 20); // Random number 20-25
        return;
      }

      fetch('/api/active-visitors')
        .then(res => {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            return { visitors: null, error: "Local development fallback hit" };
          }
          return res.json();
        })
        .then(data => {
          if (data && data.visitors != null && data.error === undefined) {
            setOnlineCount(data.visitors);
          }
        })
        .catch(err => {
          // Silently catch network errors during local proxy misses
        });
    };

    fetchVisitors(); // Fetch immediately on load
    const intervalId = setInterval(fetchVisitors, 60000); // Poll every 1 minute

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const dt = summary?.generated_at ? new Date(summary.generated_at).toLocaleString() : 'unknown';

  const exportCSV = () => {
    if (!offers || offers.length === 0) return;

    const headers = ['Company', 'Role', 'YOE', 'Base', 'Total', 'Currency', 'Location', 'Offer Type', 'Post Date', 'Post URL'];
    const rows = offers.map(o => [
      o.company || o.company_normalized || '',
      o.role_normalized || o.role || '',
      o.yoe ?? '',
      o.base ?? '',
      o.total ?? '',
      (o.currency || 'INR').toUpperCase(),
      o.location || '',
      o.offer_type || '',
      o.post_date || '',
      o.post_url || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leetcode_compensation_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="app-header" id="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="header-titles">
            <div className="title-row">
              <h1>LeetCode Comp Tracker</h1>
              {onlineCount !== null && (
                <div className="online-badge" title="Active visitors right now">
                  <span className="pulse-dot"></span>
                  <span className="online-count">{onlineCount} online</span>
                </div>
              )}
            </div>
            <p className="header-subtitle" id="header-subtitle">
              {summary ? `Last ${summary.total_offers || 0} offers from ${summary.unique_companies || 0} companies • Updated ${dt}` : "Loading data..."}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Filters
            globalData={globalData}
            periodMode={periodMode} setPeriodMode={setPeriodMode}
            subFilter={subFilter} setSubFilter={setSubFilter}
            currency={currency} setCurrency={setCurrency}
          />

          <button
            className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Hide compensation analytics" : "Show compensation analytics"}
          >
            <BarChart3 size={16} />
            {isSidebarOpen ? 'Hide Stats' : 'Show Stats'}
          </button>

          <button className="btn btn-secondary btn-theme-toggle" onClick={toggleTheme} title="Toggle color theme" aria-label="Toggle color theme">
            <span className="theme-toggle-icon" aria-hidden="true">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</span>
          </button>

          <button className="btn btn-secondary" onClick={exportCSV} title="Export data as CSV">
            <Download size={16} />
            Export CSV
          </button>

          <button className="btn btn-primary" onClick={() => window.location.reload()} title="Refresh data">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}

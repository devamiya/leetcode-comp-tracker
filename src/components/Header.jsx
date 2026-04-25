import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, RefreshCw, BarChart2, X } from 'lucide-react';
import Filters from './Filters';
import AnimatedCounter from './AnimatedCounter';

export default function Header({
  summary,
  globalData,
  theme,
  toggleTheme,
  periodMode, setPeriodMode,
  subFilter, setSubFilter,
  currency, setCurrency,
  offers,
  isSidebarOpen, setIsSidebarOpen,
  exportCSV
}) {
  const [onlineCount, setOnlineCount] = useState(null);

  useEffect(() => {
    const updateOnlineCount = () => {
      // Simulate live visitors between 5 and 10 as requested
      const randomCount = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
      setOnlineCount(randomCount);
    };

    updateOnlineCount();
    // Update every 15 seconds for a realistic "live" feel
    const interval = setInterval(updateOnlineCount, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="header-title-group">
            <div className="title-row">
              <h1>LeetCode Comp Tracker</h1>
              {onlineCount !== null && (
                <div className="online-badge" title="Active visitors right now">
                  <span className="pulse-dot"></span>
                  <span className="status-label">LIVE</span>
                  <span className="online-count">
                    <AnimatedCounter value={onlineCount} live={true} />
                  </span>
                </div>
              )}
            </div>
            <p className="header-subtitle" id="header-subtitle">
              {summary ? (
                <>
                  <span className="summary-pills">
                    {summary.total_offers || 0} Offers • {summary.unique_companies || 0} Companies
                  </span>
                  {(__BUILD_TIME__) && (
                    <span className="last-updated-pill">
                      • Last synced: {new Date(__BUILD_TIME__).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      <small style={{ opacity: 0.8, marginLeft: '4px' }}>(Syncs every 12h)</small>
                    </span>
                  )}
                </>
              ) : (
                "Establishing data feed..."
              )}
            </p>
          </div>
        </div>

        <div className="header-right">
          <div className="header-filters desktop-only">
            <Filters
              globalData={globalData}
              periodMode={periodMode} setPeriodMode={setPeriodMode}
              subFilter={subFilter} setSubFilter={setSubFilter}
              currency={currency} setCurrency={setCurrency}
            />
          </div>

          <div className="header-actions">
            <button
              className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Hide compensation analytics" : "Show compensation analytics"}
              aria-label={isSidebarOpen ? "Hide Analysis Sidebar" : "Show Analysis Sidebar"}
              aria-expanded={isSidebarOpen}
              aria-controls="dashboard-sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <BarChart2 size={20} />}
            </button>

            <button
              className="btn btn-secondary btn-theme-toggle"
              onClick={toggleTheme}
              title="Toggle Theme"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              className="btn btn-secondary desktop-only"
              onClick={exportCSV}
              title="Download Salaries"
              aria-label="Export salary data to CSV"
            >
              <Download size={18} />
            </button>

            <a
              href="https://github.com/devamiya/leetcode-comp-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              title="View on GitHub"
              aria-label="View source on GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>

            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              title="Refresh data"
              aria-label="Reload latest dashboard data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

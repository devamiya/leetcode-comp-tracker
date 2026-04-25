import React, { useState, useEffect } from 'react';
import { 
  X, Moon, Sun, Download, RefreshCw, BarChart2, Plus, Settings2, BarChart3
} from 'lucide-react';
import Filters from './Filters';

export default function ActionMenu({
  globalData,
  theme,
  toggleTheme,
  periodMode, setPeriodMode,
  subFilter, setSubFilter,
  currency, setCurrency,
  isSidebarOpen, setIsSidebarOpen,
  exportCSV
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically scroll to top when menu closes on mobile for better UX
  useEffect(() => {
    if (!isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  return (
    <div className={`action-menu-container ${isOpen ? 'is-open' : ''}`}>
      {/* Floating Action Button (FAB) */}
      <button 
        className={`fab-button ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Quick Actions" : "Open Quick Actions"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {isOpen ? <X size={24} /> : <Settings2 size={24} />}
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div 
          className="menu-backdrop" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Popover Menu (Bottom Sheet on Mobile) */}
      <div 
        className="action-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Actions Dashboard"
      >
        <div className="sheet-handle"></div>
        <div className="menu-header">
          <h3>Action Hub</h3>
          <button 
            className="menu-close" 
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="menu-body">
          <section className="menu-section">
            <h4 className="section-title">Data Period</h4>
            <Filters
              globalData={globalData}
              periodMode={periodMode} setPeriodMode={setPeriodMode}
              subFilter={subFilter} setSubFilter={setSubFilter}
              currency={currency} setCurrency={setCurrency}
            />
          </section>

          <div className="menu-grid-container">
            <section className="menu-section">
              <h4 className="section-title">Display & Theme</h4>
              <div className="actions-grid">
                <button 
                  className={`action-item ${isSidebarOpen ? 'active' : ''}`}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-pressed={isSidebarOpen}
                >
                  <BarChart3 size={18} />
                  <span>{isSidebarOpen ? 'Hide Stats' : 'Show Stats'}</span>
                </button>

                <button 
                  className="action-item" 
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </section>

            <section className="menu-section">
              <h4 className="section-title">Utility</h4>
              <div className="actions-grid">
                <button 
                  className="action-item" 
                  onClick={exportCSV}
                  aria-label="Export data to CSV"
                >
                  <Download size={18} />
                  <span>Export CSV</span>
                </button>

                <button 
                  className="action-item" 
                  onClick={() => window.location.reload()}
                  aria-label="Reload dashboard data"
                >
                  <RefreshCw size={18} />
                  <span>Refresh</span>
                </button>
              </div>
            </section>
          </div>

          <section className="menu-section github-foot">
            <a 
              href="https://github.com/devamiya/leetcode-comp-tracker" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-item full-width github-link"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.1 6.44 7a3.37 3.37 0 0 0-.94 2.58V22"></path>
              </svg>
              <span>View Source Code</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

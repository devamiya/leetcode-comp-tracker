import React, { useState } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import OffersTable from './components/OffersTable';
import ActionMenu from './components/ActionMenu';
import TopCompaniesChart from './components/charts/TopCompaniesChart';
import RolesChart from './components/charts/RolesChart';
import ScatterChart from './components/charts/ScatterChart';
import DistributionChart from './components/charts/DistributionChart';
import ErrorBoundary from './components/ErrorBoundary';
import { useData } from './hooks/useData';
import { useFilters } from './hooks/useFilters';
import { useTheme } from './hooks/useTheme';

import Skeleton from './components/Skeleton';

function App() {
  const { data: globalData, loading, error } = useData();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    periodMode, setPeriodMode,
    subFilter, setSubFilter,
    currency, setCurrency,
    searchQuery, setSearchQuery,
    sortState, setSortState,
    dashboardData, tableOffers
  } = useFilters(globalData);

  const exportCSV = () => {
    if (!tableOffers || tableOffers.length === 0) return;

    const headers = ['Company', 'Role', 'YOE', 'Base', 'Total', 'Currency', 'Location', 'Offer Type', 'Post Date', 'Post URL'];
    const rows = tableOffers.map(o => [
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

  if (loading) {
    return (
      <div className="loading-screen immersive-loader">
        <div className="ambient-bg" aria-hidden="true">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <div className="loader-content">
          <div className="loader-logo-container">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="loader-logo">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <div className="loader-ring"></div>
          </div>
          <div className="loader-text-container">
            <p className="loader-text">Initializing Data Stream</p>
            <div className="scanning-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="error-screen" className="error-screen" style={{ display: 'flex' }}>
        <h2>⚠️ Oops, something went wrong</h2>
        <p id="error-message">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Try Again</button>
      </div>
    );
  }

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Header 
        summary={dashboardData?.summary} 
        globalData={globalData}
        theme={theme}
        toggleTheme={toggleTheme}
        periodMode={periodMode} setPeriodMode={setPeriodMode}
        subFilter={subFilter} setSubFilter={setSubFilter}
        currency={currency} setCurrency={setCurrency}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        exportCSV={exportCSV}
        offers={tableOffers}
      />

      <div className="app-container">
        <main id="main-content">
          <ErrorBoundary>
            <SummaryCards summary={dashboardData?.summary} currency={currency} />
          </ErrorBoundary>

          <div className={`dashboard-layout ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
            <div className="dashboard-main">
              <ErrorBoundary>
                <OffersTable
                  offers={tableOffers}
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  currency={currency} setCurrency={setCurrency}
                  sortState={sortState} setSortState={setSortState}
                />
              </ErrorBoundary>
            </div>

            <aside className="dashboard-sidebar">
              <ErrorBoundary>
                <TopCompaniesChart companies={dashboardData?.companies} theme={theme} />
              </ErrorBoundary>
              <ErrorBoundary>
                <RolesChart roles={dashboardData?.roles} theme={theme} />
              </ErrorBoundary>
              <ErrorBoundary>
                <ScatterChart offers={dashboardData?.offers} theme={theme} />
              </ErrorBoundary>
              <ErrorBoundary>
                <DistributionChart offers={dashboardData?.offers} theme={theme} />
              </ErrorBoundary>
            </aside>
          </div>
        </main>
      </div>

      <footer className="app-footer">
        <p>Data sourced from <a href="https://leetcode.com/discuss/compensation" target="_blank" rel="noopener noreferrer">LeetCode Discuss → Compensation</a> • Parsed with AI • Not affiliated with LeetCode</p>
      </footer>

      <a href="https://linkedin.com/in/devamiya" target="_blank" rel="noopener noreferrer" className="floating-linkedin" data-tooltip='"Want to contribute" - let’s connect'>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
        <span>Say Hi!</span>
      </a>

      <ActionMenu 
        globalData={globalData}
        theme={theme}
        toggleTheme={toggleTheme}
        periodMode={periodMode} setPeriodMode={setPeriodMode}
        subFilter={subFilter} setSubFilter={setSubFilter}
        currency={currency} setCurrency={setCurrency}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        exportCSV={exportCSV}
      />
    </>
  );
}

export default App;

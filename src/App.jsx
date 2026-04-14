import React, { useState } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import OffersTable from './components/OffersTable';
import TopCompaniesChart from './components/charts/TopCompaniesChart';
import RolesChart from './components/charts/RolesChart';
import ScatterChart from './components/charts/ScatterChart';
import DistributionChart from './components/charts/DistributionChart';
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

  if (loading) {
    return (
      <div className="app-container" style={{ paddingTop: '100px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <Skeleton type="card" count={6} className="flex-1" />
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1.75 }}>
            <Skeleton type="card" style={{ height: '600px' }} />
          </div>
          <div style={{ flex: 0.9 }}>
            <Skeleton type="card" count={3} className="mb-md" />
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
        periodMode={periodMode}
        setPeriodMode={setPeriodMode}
        subFilter={subFilter}
        setSubFilter={setSubFilter}
        currency={currency}
        setCurrency={setCurrency}
        offers={tableOffers}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="app-container">

        <main id="main-content">
          <SummaryCards summary={dashboardData?.summary} currency={currency} />

          <div className={`dashboard-layout ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
            <div className="dashboard-main">
              <OffersTable
                offers={tableOffers}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                currency={currency} setCurrency={setCurrency}
                sortState={sortState} setSortState={setSortState}
              />
            </div>

            <aside className="dashboard-sidebar">
              <TopCompaniesChart companies={dashboardData?.companies} theme={theme} />
              <RolesChart roles={dashboardData?.roles} theme={theme} />
              <ScatterChart offers={dashboardData?.offers} theme={theme} />
              <DistributionChart offers={dashboardData?.offers} theme={theme} />
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
    </>
  );
}

export default App;

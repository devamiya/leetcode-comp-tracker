import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

import OffersTable from './components/OffersTable';
import ActionMenu from './components/ActionMenu';
import AddOfferModal from './components/AddOfferModal';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import ExplorePage from './pages/ExplorePage';
import TrendsPage from './pages/TrendsPage';
import CompanyInsightsPage from './pages/CompanyInsightsPage';
import ComparePage from './pages/ComparePage';
import EvaluatePage from './pages/EvaluatePage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import DiscussPage from './pages/DiscussPage';
import { useData } from './hooks/useData';
import { useFilters } from './hooks/useFilters';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import { identifyUser } from './utils/telemetry';
import posthog from 'posthog-js';

function DashboardPage() {
  const { data: globalData } = useData();
  const {
    periodMode, setPeriodMode,
    subFilter, setSubFilter,
    currency, setCurrency,
    searchQuery, setSearchQuery,
    sortState, setSortState,
    dashboardData, tableOffers
  } = useFilters(globalData);

  return (
    <>
      <div className="app-container">
        <main id="main-content">


          <div className="dashboard-layout sidebar-hidden">
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
          </div>
        </main>
      </div>
    </>
  );
}

function App() {
  const { data: globalData, loading: dataLoading, error: dataError } = useData();
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, logout: handleLogout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userOfferVersion, setUserOfferVersion] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Telemetry: Identify user
  useEffect(() => {
    identifyUser(user);
  }, [user]);

  // Telemetry: Track pageviews
  useEffect(() => {
    posthog.capture('$pageview');
  }, [location.pathname]);

  // Navigation handlers
  const handleEnterDashboard = () => {
    navigate('/');
  };

  const handleViewTrends = () => {
    navigate('/trends');
  };

  // Redirect to landing is no longer strictly required for all routes
  // since we allow guest browsing. Only /profile and /add-offer will be protected.

  const exportCSV = () => {
    if (!globalData?.offers || globalData.offers.length === 0) return;

    const headers = ['Company', 'Role', 'YOE', 'Base', 'Total', 'Currency', 'Location', 'Offer Type', 'Post Date', 'Post URL'];
    const rows = globalData.offers.map(o => [
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

  if (dataLoading || authLoading) {
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
            <p className="loader-text">{authLoading ? 'Verifying Terminal Access' : 'Initializing Data Stream'}</p>
            <div className="scanning-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div id="error-screen" className="error-screen" style={{ display: 'flex' }}>
        <h2>⚠️ Oops, something went wrong</h2>
        <p id="error-message">{dataError}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Try Again</button>
      </div>
    );
  }

  // Public routes that don't require auth
  const publicRoutes = ['/', '/discuss'];
  if (!user && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  const showLanding = !user && location.pathname === '/';

  return (
    <>
      {showLanding ? (
        <LandingPage
          onSignIn={() => setIsAuthModalOpen(true)}
          onEnterDashboard={() => navigate('/explore')}
          onViewTrends={() => navigate('/trends')}
          onDiscuss={() => navigate('/discuss')}
          sampleData={globalData?.offers?.slice(0, 50) || []}
        />
      ) : (
        <div className="app-shell">
          <div className="ambient-bg" aria-hidden="true">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
          </div>
          <Sidebar
            isOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            user={user}
            onSignInClick={() => setIsAuthModalOpen(true)}
            theme={theme}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
          />

          <div className="app-main">
            <Header
              summary={globalData?.summary || null}
              onAddOffer={() => user ? setIsAddOfferOpen(true) : setIsAuthModalOpen(true)}
            />

            <div className="app-content">
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <DashboardPage />
                  </ErrorBoundary>
                } />
                <Route path="/explore" element={
                  <ErrorBoundary>
                    <ExplorePage />
                  </ErrorBoundary>
                } />
                <Route path="/trends" element={
                  <ErrorBoundary>
                    <TrendsPage />
                  </ErrorBoundary>
                } />
                <Route path="/company/:name" element={
                  <ErrorBoundary>
                    <CompanyInsightsPage />
                  </ErrorBoundary>
                } />
                <Route path="/compare" element={
                  <ErrorBoundary>
                    <ComparePage />
                  </ErrorBoundary>
                } />
                <Route path="/evaluate" element={
                  <ErrorBoundary>
                    <EvaluatePage />
                  </ErrorBoundary>
                } />
                <Route path="/profile" element={
                  <ErrorBoundary>
                    {user ? <ProfilePage /> : <LandingPage onSignIn={() => setIsAuthModalOpen(true)} />}
                  </ErrorBoundary>
                } />
                <Route path="/discuss" element={
                  <ErrorBoundary>
                    <DiscussPage onSignInClick={() => setIsAuthModalOpen(true)} />
                  </ErrorBoundary>
                } />
              </Routes>
            </div>

            <footer className="app-footer">
              <p>Data sourced from <a href="https://leetcode.com/discuss/compensation" target="_blank" rel="noopener noreferrer">LeetCode Discuss → Compensation</a> • Parsed with AI • Not affiliated with LeetCode</p>
            </footer>
          </div>
        </div>
      )}

      <AddOfferModal
        isOpen={isAddOfferOpen}
        onClose={() => setIsAddOfferOpen(false)}
        onOfferAdded={() => setUserOfferVersion(prev => prev + 1)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <a href="https://linkedin.com/in/devamiya" target="_blank" rel="noopener noreferrer" className="floating-linkedin" data-tooltip='"Want to contribute" - let&#39;s connect'>
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
        periodMode="all" setPeriodMode={() => { }}
        subFilter="" setSubFilter={() => { }}
        currency="" setCurrency={() => { }}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        exportCSV={exportCSV}
      />
    </>
  );
}

export default App;

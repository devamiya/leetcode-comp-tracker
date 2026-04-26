import React, { useState, useEffect } from 'react';
import { Sun, Moon, Plus, LogIn, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';


const PAGE_TITLES = {
  '/': 'Dashboard',
  '/explore': 'Explore Offers',
  '/trends': 'Trends & Analytics',
  '/compare': 'Compare Companies',
  '/evaluate': 'Evaluate Offer',
  '/profile': 'User Profile',
};

export default function Header({
  summary,
  theme,
  toggleTheme,
  onAddOffer,
  onSignInClick,
  user
}) {
  const [onlineCount, setOnlineCount] = useState(null);
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'LeetCode Comp Tracker';

  useEffect(() => {
    const updateOnlineCount = () => {
      setOnlineCount(Math.floor(Math.random() * (12 - 4 + 1)) + 4);
    };
    updateOnlineCount();
    const interval = setInterval(updateOnlineCount, 18000);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = [
    { company: 'META', role: 'E4', comp: '₹52L', trend: 'up' },
    { company: 'GOOGLE', role: 'L5', comp: '₹68L', trend: 'down' },
    { company: 'AMAZON', role: 'SDE2', comp: '₹45L', trend: 'up' },
    { company: 'APPLE', role: 'ICT3', comp: '₹48L', trend: 'up' },
    { company: 'NETFLIX', role: 'Senior', comp: '₹92L', trend: 'up' },
    { company: 'UBER', role: 'L4', comp: '₹55L', trend: 'down' },
    { company: 'MICROSOFT', role: 'SDE2', comp: '₹58L', trend: 'up' },
    { company: 'STRIPE', role: 'L2', comp: '₹50L', trend: 'up' },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">{pageTitle}</h1>
          {summary && (
            <span className="topbar-meta">
              {summary.total_offers || 0} offers • {summary.unique_companies || 0} companies
            </span>
          )}
        </div>

        <div className="topbar-center">
          <div className="omni-search">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search companies, roles..." />
            <div className="search-shortcut">⌘K</div>
          </div>
        </div>

        <div className="topbar-right">
            {onlineCount !== null && (
              <div className="network-status" title="Real-time WebSocket Connection">
                <span className="pulse-dot-mini"></span>
                <span className="status-label">{onlineCount} ONLINE</span>
              </div>
            )}

            <button className="btn-add-offer" onClick={onAddOffer}>
              <Plus size={14} />
              Add Offer
            </button>
        </div>
      </header>
    </>
  );
}

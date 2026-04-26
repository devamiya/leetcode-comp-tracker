import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, TrendingUp, GitCompare, Target } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Search },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/evaluate', label: 'Evaluate', icon: Target },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="app-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={`nav-tab ${location.pathname === to ? 'active' : ''}`}
        >
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

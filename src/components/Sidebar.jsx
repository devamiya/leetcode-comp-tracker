import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Search, TrendingUp, GitCompare, Target, MessageSquare, LogIn, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Search },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/evaluate', label: 'Evaluate', icon: Target },
  { to: '/discuss', label: 'Discuss', icon: MessageSquare },
];

export default function Sidebar({ user, onSignInClick, theme, toggleTheme }) {
  const location = useLocation();

  return (
    <aside className="sidebar-rail" aria-label="Main navigation">
      <div className="sidebar-logo" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
            title={label}
          >
            <Icon size={20} />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px', alignItems: 'center' }}>
        {user ? (
          <Link to="/profile" className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`} title="View Profile" style={{ padding: '8px', justifyContent: 'center' }}>
            <img src={user.avatar} alt={user.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
          </Link>
        ) : (
          <button className="sidebar-link" onClick={onSignInClick} title="Sign In" style={{ padding: '8px', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <LogIn size={20} />
          </button>
        )}
        
        {!user && (
          <button className="sidebar-link" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={{ padding: '8px', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>
    </aside>
  );
}

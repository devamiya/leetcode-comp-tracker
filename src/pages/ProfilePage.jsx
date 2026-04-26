import React, { useMemo } from 'react';
import { User, Mail, Shield, LogOut, Briefcase, MapPin, Calendar, Trash2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';

export default function ProfilePage() {
  const { user, logout: onLogout } = useAuth();
  const { data: globalData } = useData();
  const { theme, toggleTheme } = useTheme();
  const allOffers = globalData?.offers || [];
  // Filter for offers that were submitted by this user
  const userOffers = useMemo(() => {
    if (!user) return [];
    return allOffers.filter(o => o.submitted_by === user.id);
  }, [allOffers, user]);

  const memberDate = useMemo(() => {
    if (!user?.created_at) return 'April 2026';
    return new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [user]);

  if (!user) {
    return (
      <div className="profile-empty-state">
        <div className="empty-state-icon">
          <User size={48} />
        </div>
        <h2>Not Authenticated</h2>
        <p>Please sign in to view your profile and managed offers.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-main">
          <div className="profile-avatar-wrapper">
            <img src={user.avatar} alt={user.name} className="profile-avatar-large" />
            <div className="status-indicator online"></div>
          </div>
          <div className="profile-text">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-role">Elite Contributor</p>
          </div>
          <button className="btn btn-outline btn-logout-large" onClick={onLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-side-col">
          <div className="glass-card profile-details">
            <h3 className="card-title">User Information</h3>
            <div className="detail-item">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <Shield size={16} />
              <span>Member since {memberDate}</span>
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              <span>Last active: Today</span>
            </div>
            <div className="detail-item">
              <button
                className="btn-icon-sm theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
            </div>
          </div>

          <div className="glass-card profile-stats">
            <h3 className="card-title">Activity Overview</h3>
            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-value">{userOffers.length}</span>
                <span className="stat-label">Contributions</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">12</span>
                <span className="stat-label">Impact</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main-col">
          <div className="glass-card my-offers-card">
            <div className="card-header-flex">
              <h3 className="card-title">Your Contributions</h3>
              <span className="badge">{userOffers.length} Active</span>
            </div>

            {userOffers.length === 0 ? (
              <div className="no-offers-msg" style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--text-muted)' }}>
                <Briefcase size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p>You haven't submitted any offers to the terminal yet.</p>
              </div>
            ) : (
              <div className="user-offers-list">
                {userOffers?.map((offer, idx) => (
                  <div key={idx} className="user-offer-item">
                    <div className="offer-item-left">
                      <div className="company-logo-placeholder">
                        {offer?.company[0]}
                      </div>
                      <div className="offer-item-text">
                        <h4>{offer.company}</h4>
                        <div className="offer-meta-inline">
                          <span><Briefcase size={12} /> {offer.role}</span>
                          <span><MapPin size={12} /> {offer.location || 'Remote'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="offer-item-right">
                      <div className="offer-item-comp">
                        {offer.currency} {offer.total?.toLocaleString()}
                      </div>
                      <button className="btn-icon-trash" title="Delete Submission">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

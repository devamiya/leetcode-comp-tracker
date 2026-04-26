import React from 'react';
import { Bookmark } from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import { formatSalary, getOfferCurrency, titleCase } from '../utils/formatters';
import { computeConfidence, getConfidenceColor } from '../utils/confidenceScore';

export default function OfferCard({ offer, median, index = 0, isBookmarked = false, onToggleBookmark }) {
  const company = offer.company || offer.company_normalized || '—';
  const role = offer.role_normalized || offer.role || '—';
  const total = offer.total;
  const base = offer.base;
  const yoe = offer.yoe;
  const location = offer.location || '—';
  const currency = getOfferCurrency(offer);
  const isUserSubmitted = offer._userSubmitted;
  const confidence = computeConfidence(offer);
  const postDate = offer.post_date
    ? new Date(offer.post_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  // Market position
  let marketClass = 'at';
  let marketLabel = '—';
  if (total != null && median != null && median > 0) {
    const pct = ((total - median) / median) * 100;
    const cappedPct = Math.min(Math.abs(Math.round(pct)), 999);
    if (pct > 10) {
      marketClass = 'above';
      marketLabel = `+${cappedPct}% above`;
    } else if (pct < -10) {
      marketClass = 'below';
      marketLabel = `-${cappedPct}% below`;
    } else {
      marketClass = 'at';
      marketLabel = 'At market';
    }
  }

  const handleClick = () => {
    if (offer.post_url) {
      window.open(offer.post_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="offer-card"
      onClick={handleClick}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      role="article"
      aria-label={`${company} ${role} offer`}
    >
      <div className="offer-card-header">
        <div className="offer-card-company">
          <CompanyLogo name={company} size={32} />
          <div>
            <div className="offer-card-company-name">{titleCase(company)}</div>
            <div className="offer-card-role">{role}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isUserSubmitted && (
            <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(124, 92, 255, 0.15)', color: '#7c5cff', fontWeight: 700 }}>YOU</span>
          )}
          <span
            title={`Confidence: ${confidence.grade} (${confidence.score}/100)`}
            style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-input)', color: getConfidenceColor(confidence.grade) }}
          >{confidence.grade}</span>
          <span className="currency-badge">{currency}</span>
          {onToggleBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(offer.post_url); }}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this offer'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                color: isBookmarked ? '#fbbf24' : 'var(--text-muted)',
                transition: 'color 0.2s',
              }}
            >
              <Bookmark size={16} fill={isBookmarked ? '#fbbf24' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <div className="offer-card-hero">
        <div className="offer-card-hero-label">Total Compensation</div>
        <div className="offer-card-hero-value">
          {total != null ? formatSalary(total, currency) : '—'}
        </div>
      </div>

      <div className="offer-card-meta">
        <div className="offer-card-meta-item">
          <div className="offer-card-meta-label">Base</div>
          <div className="offer-card-meta-value">
            {base != null ? formatSalary(base, currency) : '—'}
          </div>
        </div>
        <div className="offer-card-meta-item">
          <div className="offer-card-meta-label">YOE</div>
          <div className="offer-card-meta-value">
            {yoe != null ? yoe : '—'}
          </div>
        </div>
        <div className="offer-card-meta-item">
          <div className="offer-card-meta-label">Location</div>
          <div className="offer-card-meta-value">{location}</div>
        </div>
      </div>

      <div className="offer-card-footer">
        {postDate && <span className="offer-card-date">{postDate}</span>}
        {total != null && median != null && (
          <span className={`offer-card-market ${marketClass}`}>{marketLabel}</span>
        )}
      </div>
    </div>
  );
}

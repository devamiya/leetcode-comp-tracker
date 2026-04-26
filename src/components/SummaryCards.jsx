import React from 'react';
import { formatSalary } from '../utils/formatters';
import { computePercentile } from '../hooks/useAnalytics';
import AnimatedCounter from './AnimatedCounter';

export default function SummaryCards({ summary, currency = 'INR', offers }) {
  if (!summary) return null;

  // Compute P75 & P90 from offers if available
  let p75 = null, p90 = null;
  if (offers && offers.length > 0) {
    const salaries = offers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
    p75 = computePercentile(salaries, 75);
    p90 = computePercentile(salaries, 90);
  }

  let dateRangeText = '—';
  if (summary.date_range?.from && summary.date_range?.to) {
    const from = new Date(summary.date_range.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const to = new Date(summary.date_range.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dateRangeText = `${from} – ${to}`;
  }

  const cards = [
    {
      icon: <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      value: summary.total_offers,
      label: 'Salary Offers',
      hero: true,
    },
    {
      icon: <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
      value: summary.overall_median_salary,
      label: 'Median Comp',
      format: true,
    },
    {
      icon: <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      value: p75,
      label: 'P75 Comp',
      format: true,
    },
    {
      icon: <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
      value: p90,
      label: 'P90 Comp',
      format: true,
    },
    {
      icon: <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      value: summary.unique_companies,
      label: 'Companies',
    },
    {
      icon: <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      value: null,
      label: 'Date Range',
      customValue: dateRangeText,
    },
  ];

  return (
    <section className="summary-cards" id="summary-cards">
      {cards.map((card, i) => (
        <div key={i} className={`card card-stat ${card.hero ? 'card-hero' : ''}`}>
          {card.icon}
          <div className="stat-value" style={card.customValue && card.customValue.length > 20 ? { fontSize: '1.15rem' } : {}}>
            {card.customValue ? (
              card.customValue
            ) : card.format ? (
              card.value != null ? (
                <AnimatedCounter
                  value={card.value}
                  formatter={(val) => formatSalary(val, currency)}
                />
              ) : '—'
            ) : (
              card.value != null ? <AnimatedCounter value={card.value} /> : '—'
            )}
          </div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </section>
  );
}

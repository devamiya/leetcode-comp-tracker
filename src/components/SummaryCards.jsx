import React from 'react';
import { formatSalary } from '../utils/formatters';
import AnimatedCounter from './AnimatedCounter';

export default function SummaryCards({ summary, currency = 'INR' }) {
  if (!summary) return null;
  
  let dateRangeText = '—';
  if (summary.date_range?.from && summary.date_range?.to) {
    const from = new Date(summary.date_range.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const to = new Date(summary.date_range.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dateRangeText = `${from} – ${to}`;
  }

  return (
    <section className="summary-cards" id="summary-cards">
      <div className="card card-stat">
        <div className="stat-icon">📝</div>
        <div className="stat-value">
          <AnimatedCounter value={summary.total_posts_fetched} />
        </div>
        <div className="stat-label">Posts Analyzed</div>
      </div>
      <div className="card card-stat">
        <div className="stat-icon">💼</div>
        <div className="stat-value">
          <AnimatedCounter value={summary.total_offers} />
        </div>
        <div className="stat-label">Salary Offers</div>
      </div>
      <div className="card card-stat">
        <div className="stat-icon">🏢</div>
        <div className="stat-value">
          <AnimatedCounter value={summary.unique_companies} />
        </div>
        <div className="stat-label">Companies</div>
      </div>
      <div className="card card-stat">
        <div className="stat-icon">💰</div>
        <div className="stat-value">
          {summary.overall_avg_salary != null ? (
            <AnimatedCounter 
              value={summary.overall_avg_salary} 
              formatter={(val) => formatSalary(val, currency)} 
            />
          ) : '—'}
        </div>
        <div className="stat-label">Avg Compensation</div>
      </div>
      <div className="card card-stat">
        <div className="stat-icon">📊</div>
        <div className="stat-value">
          {summary.overall_median_salary != null ? (
            <AnimatedCounter 
              value={summary.overall_median_salary} 
              formatter={(val) => formatSalary(val, currency)} 
            />
          ) : '—'}
        </div>
        <div className="stat-label">Median Compensation</div>
      </div>
      <div className="card card-stat">
        <div className="stat-icon">📅</div>
        <div className="stat-value" style={{ fontSize: dateRangeText.length > 20 ? '1.25rem' : '1.5rem'}}>
          {dateRangeText}
        </div>
        <div className="stat-label">Date Range</div>
      </div>
    </section>
  );
}

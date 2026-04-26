import { useMemo } from 'react';

/**
 * Compute the value at a given percentile from a sorted array.
 * Uses linear interpolation method.
 */
export function computePercentile(sortedArr, p) {
  if (!sortedArr || sortedArr.length === 0) return null;
  if (sortedArr.length === 1) return sortedArr[0];

  const index = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedArr.length) return sortedArr[sortedArr.length - 1];
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

/**
 * Build histogram bins from an array of numbers.
 */
function buildDistribution(values, binCount = 20) {
  if (!values || values.length === 0) return { bins: [], binSize: 0, min: 0, max: 0 };

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { bins: [values.length], binSize: 1, min, max };

  const binSize = (max - min) / binCount;
  const bins = new Array(binCount).fill(0);

  values.forEach(v => {
    let idx = Math.floor((v - min) / binSize);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx]++;
  });

  return { bins, binSize, min, max };
}

/**
 * Compute per-entity (company/role/location) detailed statistics.
 */
function computeEntityStats(offers, entityKey, normalizedKey) {
  const groups = {};

  offers.forEach(o => {
    const key = o[normalizedKey] || o[entityKey] || 'Unknown';
    if (!groups[key]) {
      groups[key] = {
        name: key,
        displayName: o[entityKey] || key,
        offers: [],
        salaries: [],
        yoes: [],
      };
    }
    groups[key].offers.push(o);
    if (o.total != null) groups[key].salaries.push(o.total);
    if (o.yoe != null) groups[key].yoes.push(o.yoe);
  });

  return Object.values(groups).map(g => {
    const sorted = [...g.salaries].sort((a, b) => a - b);
    const yoeSorted = [...g.yoes].sort((a, b) => a - b);

    return {
      name: g.name,
      displayName: g.displayName,
      offerCount: g.offers.length,
      salaryCount: sorted.length,
      min: sorted.length > 0 ? sorted[0] : null,
      max: sorted.length > 0 ? sorted[sorted.length - 1] : null,
      median: computePercentile(sorted, 50),
      p25: computePercentile(sorted, 25),
      p75: computePercentile(sorted, 75),
      p90: computePercentile(sorted, 90),
      avg: sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : null,
      medianYoe: computePercentile(yoeSorted, 50),
      avgYoe: yoeSorted.length > 0 ? yoeSorted.reduce((a, b) => a + b, 0) / yoeSorted.length : null,
      offers: g.offers,
    };
  }).sort((a, b) => (b.median || 0) - (a.median || 0));
}

/**
 * Compute monthly trend data for time-series charts.
 */
function computeTrends(offers) {
  const months = {};

  offers.forEach(o => {
    if (!o.post_date || o.total == null) return;
    const d = new Date(o.post_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!months[key]) {
      months[key] = { month: key, salaries: [], count: 0, offers: [] };
    }
    months[key].salaries.push(o.total);
    months[key].count++;
    months[key].offers.push(o);
  });

  return Object.values(months)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => {
      const sorted = [...m.salaries].sort((a, b) => a - b);
      return {
        month: m.month,
        label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: m.count,
        median: computePercentile(sorted, 50),
        avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
        p75: computePercentile(sorted, 75),
        p90: computePercentile(sorted, 90),
        min: sorted[0],
        max: sorted[sorted.length - 1],
      };
    });
}

/**
 * Master analytics computation from any offer array.
 * Returns percentiles, distributions, per-entity breakdowns, and trends.
 */
export function computeInsights(offers) {
  if (!offers || offers.length === 0) {
    return {
      percentiles: { p25: null, p50: null, p75: null, p90: null },
      distribution: { bins: [], binSize: 0, min: 0, max: 0 },
      byCompany: [],
      byRole: [],
      byLocation: [],
      trends: [],
      recencyCounts: { d7: 0, d30: 0, d90: 0, d180: 0 },
    };
  }

  const allSalaries = offers
    .map(o => o.total)
    .filter(t => t != null)
    .sort((a, b) => a - b);

  // Global percentiles
  const percentiles = {
    p25: computePercentile(allSalaries, 25),
    p50: computePercentile(allSalaries, 50),
    p75: computePercentile(allSalaries, 75),
    p90: computePercentile(allSalaries, 90),
  };

  // Distribution
  const distribution = buildDistribution(allSalaries, 20);

  // Per-entity breakdowns
  const byCompany = computeEntityStats(offers, 'company', 'company_normalized');
  const byRole = computeEntityStats(offers, 'role', 'role_normalized');
  const byLocation = computeEntityStats(offers, 'location', 'location');

  // Trends
  const trends = computeTrends(offers);

  // Recency counts - relative to the most recent offer in dataset
  const dates = offers
    .map(o => o.post_date ? new Date(o.post_date).getTime() : null)
    .filter(Boolean);
  const maxDate = dates.length > 0 ? Math.max(...dates) : Date.now();

  const recencyCounts = { d7: 0, d30: 0, d90: 0, d180: 0 };
  const DAY = 86400000;
  dates.forEach(d => {
    const age = maxDate - d;
    if (age <= 7 * DAY) recencyCounts.d7++;
    if (age <= 30 * DAY) recencyCounts.d30++;
    if (age <= 90 * DAY) recencyCounts.d90++;
    if (age <= 180 * DAY) recencyCounts.d180++;
  });

  return { percentiles, distribution, byCompany, byRole, byLocation, trends, recencyCounts };
}

/**
 * React hook that memoizes analytics computation.
 */
export function useAnalytics(offers) {
  return useMemo(() => computeInsights(offers), [offers]);
}

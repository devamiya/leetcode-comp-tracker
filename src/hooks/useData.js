import { useState, useEffect } from 'react';
import { getWeekKey, getMonthKey, parseWeekKey, addDaysUtc, formatWeekLabel, formatMonthLabel } from '../utils/dateUtils';
import { titleCase } from '../utils/formatters';

export function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        let resp = await fetch('/data.json');
        let isJson = resp.headers.get("content-type")?.includes("application/json");

        if (!resp.ok || !isJson) {
           throw new Error('No data available.');
        }

        const globalData = await resp.json();
        
        if (!globalData || !globalData.offers) {
           throw new Error('No data available.');
        }

        setData(globalData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return { data, loading, error };
}

// Function to re-aggregate data based on filtered offers (Ported from Vanilla JS)
export function reaggregateData(offers) {
  const companies = {};
  const roles = {};
  let totalSalaries = 0;
  let salaryCount = 0;
  
  let minDate = null;
  let maxDate = null;
  const uniquePosts = new Set();
  
  offers.forEach(o => {
    // Unique posts
    if (o.post_url) uniquePosts.add(o.post_url);
    else uniquePosts.add(JSON.stringify(o)); // fallback

    // Dates
    if (o.post_date) {
        const pd = new Date(o.post_date);
        if (!minDate || pd < minDate) minDate = pd;
        if (!maxDate || pd > maxDate) maxDate = pd;
    }

    const c = o.company_normalized || o.company || 'Unknown';
    if (!companies[c]) companies[c] = { company_normalized: c, offer_count: 0, salary_data_points: 0, total_salary: 0 };
    companies[c].offer_count++;
    if (o.total != null) { companies[c].salary_data_points++; companies[c].total_salary += o.total; totalSalaries += o.total; salaryCount++; }
    
    const r = o.role_normalized || o.role || 'Unknown';
    if (!roles[r]) roles[r] = { role_normalized: r, offer_count: 0, salary_data_points: 0, total_salary: 0 };
    roles[r].offer_count++;
    if (o.total != null) { roles[r].salary_data_points++; roles[r].total_salary += o.total; }
  });

  const allSalaries = offers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
  const overallMedian = allSalaries.length > 0 ? (
    allSalaries.length % 2 === 0 
      ? (allSalaries[allSalaries.length / 2 - 1] + allSalaries[allSalaries.length / 2]) / 2
      : allSalaries[Math.floor(allSalaries.length / 2)]
  ) : null;

  const companiesArr = Object.values(companies).map(c => {
    c.avg_salary = c.salary_data_points > 0 ? (c.total_salary / c.salary_data_points) : null;
    return c;
  }).sort((a, b) => (b.avg_salary || 0) - (a.avg_salary || 0));

  const rolesArr = Object.values(roles).map(r => {
    r.avg_salary = r.salary_data_points > 0 ? (r.total_salary / r.salary_data_points) : null;
    return r;
  }).sort((a, b) => b.offer_count - a.offer_count);

  return {
      summary: {
        total_posts_fetched: uniquePosts.size,
        total_offers: offers.length,
        unique_companies: companiesArr.length,
        overall_avg_salary: salaryCount > 0 ? totalSalaries / salaryCount : null,
        overall_median_salary: overallMedian,
        generated_at: new Date().toISOString(),
        date_range: {
          from: minDate ? minDate.toISOString() : null,
          to: maxDate ? maxDate.toISOString() : null
        }
      },
     companies: companiesArr,
     roles: rolesArr,
     offers: offers
  };
}

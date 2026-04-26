/**
 * Client-side confidence scoring for compensation entries.
 * Scores 0-100 based on data completeness and plausibility.
 */

/**
 * Compute a confidence score for an offer entry.
 * Higher = more reliable data point.
 */
export function computeConfidence(offer) {
  let score = 0;
  const reasons = [];

  // 1. Field completeness (max 40 points)
  if (offer.company || offer.company_normalized) { score += 8; } else { reasons.push('Missing company'); }
  if (offer.role || offer.role_normalized) { score += 6; } else { reasons.push('Missing role'); }
  if (offer.yoe != null && !isNaN(offer.yoe)) { score += 6; } else { reasons.push('Missing YOE'); }
  if (offer.base != null) { score += 6; } else { reasons.push('Missing base salary'); }
  if (offer.total != null) { score += 6; } else { reasons.push('Missing total comp'); }
  if (offer.location) { score += 4; } else { reasons.push('Missing location'); }
  if (offer.currency) { score += 2; } else { reasons.push('Missing currency'); }
  if (offer.offer_type) { score += 2; } else { reasons.push('Missing offer type'); }

  // 2. Salary plausibility (max 30 points)
  if (offer.total != null) {
    const total = Number(offer.total);
    const base = Number(offer.base) || 0;
    const currency = (offer.currency || 'INR').toUpperCase();

    // Check if total >= base (it should be)
    if (base > 0 && total >= base) {
      score += 10;
    } else if (base > 0 && total < base) {
      reasons.push('Total < base salary');
    }

    // Check reasonable salary ranges by currency
    if (currency === 'INR') {
      if (total >= 100000 && total <= 100000000) { score += 10; }
      else if (total > 0 && total < 1000) { score += 5; reasons.push('Salary may be in lakhs, not rupees'); }
      else { reasons.push('Unusual salary range for INR'); }
    } else if (currency === 'USD') {
      if (total >= 20000 && total <= 2000000) { score += 10; }
      else { reasons.push('Unusual salary range for USD'); }
    } else {
      score += 5; // Can't validate other currencies well
    }

    // Check YOE vs salary sanity (very rough)
    if (offer.yoe != null && total > 0) {
      const yoe = Number(offer.yoe);
      if (yoe >= 0 && yoe <= 50) {
        score += 10;
      } else {
        reasons.push('YOE seems implausible');
      }
    }
  }

  // 3. Source quality (max 20 points)
  if (offer.post_url) { score += 10; } else { reasons.push('No source URL'); }
  if (offer.post_date) { score += 5; } else { reasons.push('No post date'); }
  if (offer.post_title) { score += 3; }
  if (offer.post_upvotes && offer.post_upvotes > 0) { score += 2; }

  // 4. Specificity bonus (max 10 points)
  if (offer.salary_unit) score += 3;
  if (offer.offer_type === 'full-time') score += 4;
  else if (offer.offer_type) score += 2;
  if (offer.company_normalized && offer.company_normalized !== 'unknown') score += 3;

  return {
    score: Math.min(score, 100),
    grade: getGrade(Math.min(score, 100)),
    reasons,
  };
}

function getGrade(score) {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

/**
 * Get a display color for a confidence grade.
 */
export function getConfidenceColor(grade) {
  switch (grade) {
    case 'A': return 'var(--success)';
    case 'B': return '#4ade80';
    case 'C': return 'var(--warning)';
    case 'D': return '#fb923c';
    case 'F': return 'var(--danger)';
    default: return 'var(--text-muted)';
  }
}

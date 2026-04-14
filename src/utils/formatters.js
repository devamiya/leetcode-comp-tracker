export function formatSalary(val, currency = 'INR') {
  if (val == null) return '—';
  const num = Number(val);
  if (isNaN(num)) return String(val);

  // If the number is already a large amount (like 3,000,000)
  if (num >= 100000) {
    if (currency === 'INR') {
      return (num / 100000).toFixed(1) + 'L';
    }
    return (num / 1000).toFixed(0) + 'k';
  }

  // If it's a small number representing Lakhs/k already
  if (num < 1000 && num > 0) {
    return num.toFixed(num % 1 === 0 ? 0 : 1) + (currency === 'INR' ? 'L' : 'k');
  }

  return num.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US');
}

export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function getOfferCurrency(offer) {
  return (offer?.currency || 'INR').toUpperCase();
}

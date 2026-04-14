export function formatSalary(val) {
  if (val == null) return '—';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (num >= 1000) return num.toLocaleString('en-IN');
  return num.toFixed(num % 1 === 0 ? 0 : 1);
}

export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function getOfferCurrency(offer) {
  return (offer?.currency || 'INR').toUpperCase();
}

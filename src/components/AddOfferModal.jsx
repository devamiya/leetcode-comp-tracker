import React, { useState, useEffect } from 'react';
import { X, Plus, CheckCircle } from 'lucide-react';

export default function AddOfferModal({ isOpen, onClose, onOfferAdded }) {
  const [form, setForm] = useState({
    company: '', role: '', yoe: '', base: '', total: '',
    currency: 'INR', salary_unit: 'annual', location: '', offer_type: 'full-time',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.total) {
      setError('Please fill in required fields (*)');
      return;
    }

    setLoading(true);
    setError(null);

    const newOffer = {
      company: form.company.trim(),
      company_normalized: form.company.trim().toLowerCase(),
      role: form.role.trim() || 'Software Engineer',
      role_normalized: (form.role.trim() || 'Software Engineer').toLowerCase(),
      yoe: parseFloat(form.yoe) || 0,
      base: parseFloat(form.base) || null,
      total: parseFloat(form.total),
      currency: form.currency,
      salary_unit: form.salary_unit,
      location: form.location.trim() || null,
      offer_type: form.offer_type,
      post_date: new Date().toISOString(),
      post_url: null,
      post_title: `User submitted: ${form.company.trim()} ${form.role.trim()}`,
      _userSubmitted: true,
    };

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      });

      if (!response.ok) {
        throw new Error('Failed to save offer to server.');
      }

      const savedOffer = await response.json();

      if (onOfferAdded) onOfferAdded(savedOffer);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({
          company: '', role: '', yoe: '', base: '', total: '',
          currency: 'INR', salary_unit: 'annual', location: '', offer_type: 'full-time',
        });
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content auth-modal" style={{ maxWidth: 560 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            <Plus size={24} />
          </div>
          <h2 className="auth-title">Contribute Data</h2>
          <p className="auth-subtitle">Share your offer details securely with the community terminal.</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
            <CheckCircle size={48} color="var(--success)" />
            <h3 style={{ marginTop: 'var(--space-md)', fontWeight: 700 }}>Submission Successful!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Your data has been transmitted to our secure stream.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Company <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="input-wrapper">
                  <input
                    className="input-field"
                    placeholder="e.g. Microsoft"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Role</label>
                <div className="input-wrapper">
                  <input
                    className="input-field"
                    placeholder="e.g. SDE-2"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>YOE</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 4"
                    value={form.yoe}
                    onChange={e => setForm({ ...form, yoe: e.target.value })}
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Base Salary</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 1800000"
                    value={form.base}
                    onChange={e => setForm({ ...form, base: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Total Compensation <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 2500000"
                    value={form.total}
                    onChange={e => setForm({ ...form, total: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Currency</label>
                <select
                  className="select-filter"
                  style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-input)', color: 'var(--text-primary)', padding: '0 12px' }}
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="THB">THB</option>
                </select>
              </div>

              <div className="input-group">
                <label>Location</label>
                <div className="input-wrapper">
                  <input
                    className="input-field"
                    placeholder="e.g. Bangalore"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Offer Type</label>
                <select
                  className="select-filter"
                  style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-input)', color: 'var(--text-primary)', padding: '0 12px' }}
                  value={form.offer_type}
                  onChange={e => setForm({ ...form, offer_type: e.target.value })}
                >
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            {error && <div className="auth-error" style={{ marginTop: 'var(--space-md)' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-auth" style={{ width: 'auto', padding: '0 24px' }} disabled={loading}>
                {loading ? 'Transmitting...' : 'Transmit Offer'}
                <Plus size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)', textAlign: 'center' }}>
              🔒 Encrypted transmission. Your data contributes to the global insights dashboard.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

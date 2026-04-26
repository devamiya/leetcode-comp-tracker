import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Globe, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loginWithGoogle, loginWithGithub, loading, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
      onClose();
    } catch (err) {
      console.error('Auth failed:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub();
      onClose();
    } catch (err) {
      console.error('GitHub login failed:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Join the Future'}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? 'Enter your credentials to access the terminal.' : 'Create an account to contribute to the data stream.'}
          </p>
        </div>

        {authError && (
          <div className="auth-error-badge">
            {authError}
          </div>
        )}

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
            disabled={loading}
          >
            Create Account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="text" 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              {isLogin && <a href="#" className="forgot-link">Forgot?</a>}
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                {isLogin ? 'Continue to Dashboard' : 'Initialize Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-auth">
          <button 
            type="button" 
            className="btn btn-secondary btn-social"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Globe size={20} />
            Google
          </button>
          <button className="btn btn-secondary btn-social" type="button" onClick={handleGithubLogin} disabled={loading}>
            GitHub
          </button>
        </div>

        <p className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} disabled={loading}>
            {isLogin ? 'Sign up now' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </div>
  );
}


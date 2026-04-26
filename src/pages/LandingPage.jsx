import React, { useState, useRef } from 'react';
import { ArrowRight, BarChart3, Globe, Shield, Zap, Layout, Database, TrendingUp, TrendingDown, Eye, Building2, ExternalLink, User, Clock, DollarSign, MapPin, Briefcase, Code, Cpu, Smartphone, Cloud, Server, Lock, MessageSquare } from 'lucide-react';

export default function LandingPage({ onSignIn, onEnterDashboard, onViewTrends, onDiscuss, sampleData = [] }) {
  const [teaserCompany, setTeaserCompany] = useState('Microsoft');
  const [teaserRole, setTeaserRole] = useState('SDE 2');
  const [isCalculated, setIsCalculated] = useState(false);
  const previewSectionRef = useRef(null);

  // Salary Calculator State
  const [calcRole, setCalcRole] = useState('SDE 2');
  const [calcExperience, setCalcExperience] = useState(3);
  const [calcLocation, setCalcLocation] = useState('Bangalore');
  const [calculatedSalary, setCalculatedSalary] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const previewRows = (sampleData && sampleData.length > 0)
    ? sampleData.slice(0, 20).map((offer) => ({
        company: offer.company_normalized || offer.company || 'Unknown',
        role: offer.role_normalized || offer.role || 'Unknown Role',
        yoe: offer.yoe != null ? offer.yoe : offer.years_experience != null ? offer.years_experience : '-',
        total: typeof offer.total === 'number'
          ? `₹${offer.total.toLocaleString('en-IN')}`
          : offer.total || offer.salary || offer.compensation || 'N/A',
        loc: offer.location || offer.city || offer.region || 'Remote',
        source: 'LeetCode',
        postUrl: offer.post_url || offer.url || offer.link || null,
      }))
    : [
        { company: 'Google', role: 'L5 Software Engineer', yoe: 7, total: '₹84,00,000', loc: 'Bangalore', source: 'LeetCode' },
        { company: 'Atlassian', role: 'P40 Senior Engineer', yoe: 5, total: '₹72,00,000', loc: 'Remote' },
        { company: 'Microsoft', role: 'SDE 2', yoe: 3.5, total: '₹58,00,000', loc: 'Hyderabad' },
        { company: 'Amazon', role: 'SDE 1', yoe: 1, total: '₹32,00,000', loc: 'Pune' },
        { company: 'Adobe', role: 'Computer Scientist', yoe: 4, total: '₹62,00,000', loc: 'Noida' },
        { company: 'Meta', role: 'E4 Software Engineer', yoe: 2, total: '₹48,00,000', loc: 'London' },
      ];

  // Salary Calculator Data
  const roles = [
    { value: 'SDE 1', label: 'SDE 1', baseMultiplier: 1.0 },
    { value: 'SDE 2', label: 'SDE 2', baseMultiplier: 1.4 },
    { value: 'Senior SDE', label: 'Senior SDE', baseMultiplier: 1.8 },
    { value: 'Staff Engineer', label: 'Staff Engineer', baseMultiplier: 2.2 },
    { value: 'Principal Engineer', label: 'Principal Engineer', baseMultiplier: 2.6 },
    { value: 'Engineering Manager', label: 'Engineering Manager', baseMultiplier: 3.0 },
  ];

  const locations = [
    { value: 'Bangalore', label: 'Bangalore', multiplier: 1.0 },
    { value: 'Hyderabad', label: 'Hyderabad', multiplier: 0.9 },
    { value: 'Pune', label: 'Pune', multiplier: 0.85 },
    { value: 'Mumbai', label: 'Mumbai', multiplier: 1.1 },
    { value: 'Delhi NCR', label: 'Delhi NCR', multiplier: 1.05 },
    { value: 'Chennai', label: 'Chennai', multiplier: 0.95 },
    { value: 'Remote', label: 'Remote', multiplier: 0.9 },
  ];

  // Salary calculation function
  const calculateSalary = (role, experience, location) => {
    const roleData = roles.find(r => r.value === role);
    const locationData = locations.find(l => l.value === location);

    if (!roleData || !locationData) return 0;

    // Base salary for SDE 1 with 0 YOE in Bangalore
    const baseSalary = 2500000; // ₹25L base

    // Experience multiplier (diminishing returns after 5 years)
    const expMultiplier = experience <= 5 ? 1 + (experience * 0.15) : 1.75 + ((experience - 5) * 0.05);

    // Calculate final salary
    const calculated = baseSalary * roleData.baseMultiplier * expMultiplier * locationData.multiplier;

    return Math.round(calculated / 100000) * 100000; // Round to nearest lakh
  };

  // Handle calculator changes
  const handleCalculatorChange = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const salary = calculateSalary(calcRole, calcExperience, calcLocation);
      setCalculatedSalary(salary);
      setIsCalculating(false);
    }, 300); // Small delay for animation effect
  };

  // Auto-calculate when inputs change
  React.useEffect(() => {
    handleCalculatorChange();
  }, [calcRole, calcExperience, calcLocation]);

  const previewLabel = sampleData?.length > 0
    ? `Live Feed • Showing ${Math.min(20, sampleData.length)} of ${sampleData.length} offers`
    : 'Live Feed • Updated 2m ago';

  const handleViewTrends = () => {
    if (previewSectionRef.current) {
      previewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (typeof onViewTrends === 'function') {
      onViewTrends();
    }
  };
  // Function to get company logo URL with fallback icons
  const getCompanyDisplay = (companyName) => {
    if (!companyName || companyName === 'N/A') {
      return { logo: null, icon: <Building2 size={16} />, type: 'generic' };
    }
    
    const cleanName = companyName.toLowerCase().trim();
    
    // Tech company mappings with specific domains for clearbit
    const techCompanies = {
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'amazon': 'amazon.com',
      'apple': 'apple.com',
      'meta': 'meta.com',
      'facebook': 'facebook.com',
      'netflix': 'netflix.com',
      'uber': 'uber.com',
      'airbnb': 'airbnb.com',
      'spotify': 'spotify.com',
      'twitter': 'twitter.com',
      'linkedin': 'linkedin.com',
      'adobe': 'adobe.com',
      'salesforce': 'salesforce.com',
      'oracle': 'oracle.com',
      'ibm': 'ibm.com',
      'intel': 'intel.com',
      'nvidia': 'nvidia.com',
      'tesla': 'tesla.com',
      'paypal': 'paypal.com',
      'stripe': 'stripe.com',
      'atlassian': 'atlassian.com',
      'snap': 'snap.com',
      'reddit': 'reddit.com',
      'discord': 'discord.com',
      'github': 'github.com',
      'slack': 'slack.com',
    };
    
    // Check if it's a known tech company
    for (const [key, domain] of Object.entries(techCompanies)) {
      if (cleanName.includes(key)) {
        return { 
          logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, 
          icon: <Building2 size={16} />, 
          type: 'tech' 
        };
      }
    }
    
    // Default fallback with clean name
    const domainGuess = cleanName.split(' ')[0].replace(/[^a-z0-9]/g, '');
    return { 
      logo: `https://www.google.com/s2/favicons?domain=${domainGuess}.com&sz=128`, 
      icon: <Building2 size={16} />, 
      type: 'generic' 
    };
  };

  const handleLogoError = (e) => {
    e.target.style.display = 'none';
    const placeholder = e.target.parentElement.querySelector('.company-logo-placeholder');
    if (placeholder) placeholder.style.display = 'flex';
  };

  const tickerItems = [
    { company: 'META', role: 'E4', comp: '₹52L', trend: 'up' },
    { company: 'GOOGLE', role: 'L5', comp: '₹68L', trend: 'down' },
    { company: 'AMAZON', role: 'SDE2', comp: '₹45L', trend: 'up' },
    { company: 'APPLE', role: 'ICT3', comp: '₹48L', trend: 'up' },
    { company: 'NETFLIX', role: 'Senior', comp: '₹92L', trend: 'up' },
    { company: 'UBER', role: 'L4', comp: '₹55L', trend: 'down' },
    { company: 'MICROSOFT', role: 'SDE2', comp: '₹58L', trend: 'up' },
    { company: 'STRIPE', role: 'L2', comp: '₹50L', trend: 'up' },
  ];

  return (
    <div className="landing-container">
      {/* Background Decor */}
      <div className="landing-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon">
            <Zap size={20} fill="currentColor" />
          </div>
          <span>INSTA <span className="text-accent">SALARIES</span></span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="btn btn-outline" onClick={onDiscuss}>
            <MessageSquare size={16} />
            Community
          </button>
          <button className="btn btn-outline" onClick={onEnterDashboard}>
            Explore Terminal
          </button>
          <button className="btn btn-primary" onClick={onSignIn}>
            Launch Terminal
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            v1.0 Live: Real-time Compensation Stream
          </div>
          <h1 className="hero-title">
            Know Your Worth. <br />
            <span className="text-gradient">Before They Tell You.</span>
          </h1>
          <p className="hero-subtitle">
            Real compensation data from recent offers — so you don’t walk into interviews blind.
          </p>
          <div className="hero-actions">
            <button className="btn btn-lg btn-primary" onClick={onEnterDashboard}>
              Enter the Dashboard
              <Layout size={20} />
            </button>
            <button className="btn btn-lg btn-outline" onClick={handleViewTrends}>
              View Global Trends
              <TrendingUp size={20} />
            </button>
          </div>
        </div>

        <div className="hero-preview">
          <div className="salary-calculator-card glass-card">
            <div className="calculator-header">
              <div className="calculator-indicator">
                <div className="pulse-dot"></div>
                <span>SALARY CALCULATOR</span>
              </div>
              <div className="calculator-subtitle">What would you earn?</div>
            </div>

            <div className="calculator-body">
              {/* Role Selector */}
              <div className="calc-input-group">
                <label className="calc-label">
                  <Briefcase size={16} />
                  Role
                </label>
                <select
                  value={calcRole}
                  onChange={(e) => setCalcRole(e.target.value)}
                  className="calc-select"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience Slider */}
              <div className="calc-input-group">
                <label className="calc-label">
                  <Clock size={16} />
                  Years of Experience
                </label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={calcExperience}
                    onChange={(e) => setCalcExperience(parseFloat(e.target.value))}
                    className="calc-slider"
                  />
                  <div className="slider-value">{calcExperience} years</div>
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="calc-input-group">
                <label className="calc-label">
                  <MapPin size={16} />
                  Location
                </label>
                <select
                  value={calcLocation}
                  onChange={(e) => setCalcLocation(e.target.value)}
                  className="calc-select"
                >
                  {locations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>

              {/* Salary Result */}
              <div className="salary-result">
                <div className="result-label">Estimated Annual Salary</div>
                <div className={`result-amount ${isCalculating ? 'calculating' : ''}`}>
                  {isCalculating ? (
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <span className="currency">₹</span>
                      <span className="amount">
                        {(calculatedSalary / 100000).toFixed(1)}
                      </span>
                      <span className="unit">L</span>
                    </>
                  )}
                </div>
                <div className="result-breakdown">
                  <div className="breakdown-item">
                    <span>Monthly:</span>
                    <span>₹{((calculatedSalary / 12) / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Base + Stock:</span>
                    <span>₹{(calculatedSalary / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>

      <section className="landing-ticker">
        <div className="ticker-track">
          {/* Double the items for seamless infinite scroll */}
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => {
            const companyDisplay = getCompanyDisplay(item.company);
            return (
              <div key={index} className="ticker-item">
                {companyDisplay.logo && (
                  <img 
                    src={companyDisplay.logo} 
                    alt={item.company} 
                    className="ticker-logo" 
                    onError={handleLogoError} 
                  />
                )}
                <div className="company-logo-placeholder ticker-logo-placeholder" style={{ display: companyDisplay.logo ? 'none' : 'flex' }}>
                  {item.company[0]}
                </div>
                <span className="ticker-company">{item.company}</span>
                <span className="ticker-role">{item.role}:</span>
                <span className="ticker-comp">{item.comp}</span>
                <span className={`ticker-trend ${item.trend}`}>
                  {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section ref={previewSectionRef} className="landing-data-preview">
        <div className="data-preview-container">
          <div className="data-preview-header">
            <div className="preview-icon">
              <Database size={24} />
            </div>
            <h2>Global Terminal Preview</h2>
            <p>A glimpse into the live feed of compensation offers from around the world.</p>
          </div>

          <div className="data-preview-table">
            <div className="table-header">
              <div className="table-title">
                <Globe size={18} className="text-accent" />
                <span>Recent Global Offers</span>
              </div>
              <div className="table-meta">{previewLabel}</div>
            </div>
            
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>YOE</th>
                    <th>Total Comp</th>
                    <th>Location</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => {
                    const companyInfo = getCompanyDisplay(row.company);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="company-cell">
                            {companyInfo.logo ? (
                              <img 
                                src={companyInfo.logo} 
                                alt={row.company} 
                                className="company-logo"
                                onError={handleLogoError}
                              />
                            ) : null}
                            <div className="company-logo-placeholder" style={{ 
                              width: '24px', 
                              height: '24px', 
                              fontSize: '10px',
                              display: companyInfo.logo ? 'none' : 'flex'
                            }}>
                              {row.company[0]}
                            </div>
                            <span>{row.company}</span>
                          </div>
                        </td>
                        <td>{row.role}</td>
                        <td>{row.yoe}</td>
                        <td className="salary-amount">{row.total}</td>
                        <td>{row.loc}</td>
                        <td>
                          {row.postUrl ? (
                            <a href={row.postUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                              {row.source} <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span>{row.source}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <button className="btn btn-outline" onClick={onSignIn}>
                Sign In to View 400+ More Offers
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-leaderboard">
        <div className="leaderboard-header">
          <div className="leaderboard-icon">
            <TrendingUp size={24} />
          </div>
          <h2>Top Payers Leaderboard</h2>
          <p>The highest verified compensation packages this month.</p>
        </div>
        
        <div className="leaderboard-grid">
          {[
            { rank: 1, company: 'Citadel', role: 'Quantitative Developer', comp: '₹1,40,00,000' },
            { rank: 2, company: 'Jane Street', role: 'Software Engineer', comp: '₹1,25,00,000' },
            { rank: 3, company: 'Netflix', role: 'Senior SWE', comp: '₹95,00,000' },
            { rank: 4, company: 'Stripe', role: 'L3 Software Engineer', comp: '₹82,00,000' },
            { rank: 5, company: 'Google', role: 'L5 Software Engineer', comp: '₹78,00,000' },
          ].map((item, i) => {
            const companyDisplay = getCompanyDisplay(item.company);
            return (
              <div key={i} className="leaderboard-card glass-card">
                <div className="leaderboard-rank">#{item.rank}</div>
                <div className="leaderboard-company">
                  {companyDisplay.logo ? (
                    <img src={companyDisplay.logo} alt={item.company} className="ticker-logo" onError={handleLogoError} />
                  ) : (
                    <div className="company-logo-placeholder ticker-logo-placeholder">{item.company[0]}</div>
                  )}
                  <div className="leaderboard-company-info">
                    <h4>{item.company}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
                <div className="leaderboard-comp-container">
                  <div className="leaderboard-comp blurred" data-text="████████">{item.comp}</div>
                </div>
              </div>
            );
          })}
          
          <div className="leaderboard-overlay">
            <div className="overlay-content">
              <Lock size={32} className="text-accent mb-2" />
              <h3>Decrypt the Leaderboard</h3>
              <p>Sign in to reveal exact numbers and the full top 50 rankings.</p>
              <button className="btn btn-primary mt-3" onClick={onSignIn}>
                Unlock Rankings <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature-card glass-card">
          <div className="feature-icon">
            <Database size={24} />
          </div>
          <h3>Crowdsourced Intelligence</h3>
          <p>Verified data from thousands of candidates across top-tier tech firms globally.</p>
        </div>
        <div className="feature-card glass-card">
          <div className="feature-icon">
            <BarChart3 size={24} />
          </div>
          <h3>Advanced Analytics</h3>
          <p>Deep-dive into salary trends, role-specific insights, and historical benchmarks.</p>
        </div>
        <div className="feature-card glass-card">
          <div className="feature-icon">
            <Shield size={24} />
          </div>
          <h3>Encrypted & Anonymous</h3>
          <p>Contribute securely. Your data is anonymized and encrypted on our backend terminal.</p>
        </div>
      </section>

      <section className="landing-teaser">
        <div className="teaser-split">
          <div className="teaser-content">
            <div className="teaser-icon">
              <Lock size={24} className="text-accent" />
            </div>
            <h2>Decrypt Your Market Value</h2>
            <p className="teaser-subtitle">Stop guessing. Start negotiating.</p>
            <p className="teaser-desc">
              Tech compensation is notoriously opaque. Use our live oracle to ping the global data stream and instantly reveal the verified compensation structure for any role, at any top-tier company.
            </p>
            <ul className="teaser-perks">
              <li><Zap size={16} className="text-accent" /> 100% Verified Community Data</li>
              <li><TrendingUp size={16} className="text-accent" /> High-Frequency Market Updates</li>
              <li><Shield size={16} className="text-accent" /> Anonymous & Encrypted</li>
            </ul>
          </div>

          <div className="teaser-widget glass-card">
            {!isCalculated ? (
              <div className="teaser-form">
                <div className="teaser-inputs">
                  <div className="teaser-group">
                    <label>Company</label>
                    <select 
                      value={teaserCompany} 
                      onChange={(e) => {setTeaserCompany(e.target.value); setIsCalculated(false);}}
                      className="teaser-select"
                    >
                      <option value="Microsoft">Microsoft</option>
                      <option value="Google">Google</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Meta">Meta</option>
                      <option value="Apple">Apple</option>
                    </select>
                  </div>
                  
                  <div className="teaser-group">
                    <label>Role / Level</label>
                    <select 
                      value={teaserRole} 
                      onChange={(e) => {setTeaserRole(e.target.value); setIsCalculated(false);}}
                      className="teaser-select"
                    >
                      <option value="SDE 2">SDE 2</option>
                      <option value="L4 Software Engineer">L4 Software Engineer</option>
                      <option value="L5 Software Engineer">L5 Software Engineer</option>
                      <option value="Senior SWE">Senior SWE</option>
                      <option value="Staff Engineer">Staff Engineer</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-calculate" 
                  onClick={() => {
                    setIsCalculated(false);
                    setTimeout(() => setIsCalculated(true), 600);
                  }}
                >
                  Calculate Compensation
                  <Zap size={16} />
                </button>
              </div>
            ) : (
              <div className="teaser-result">
                <div className="teaser-amount-wrapper">
                  <span className="teaser-currency">₹</span>
                  <span className="teaser-amount blurred">58,00,000</span>
                </div>
                <div className="teaser-lock">
                  <p>Sign in to decrypt the exact compensation structure.</p>
                  <button className="btn btn-outline" onClick={onSignIn}>
                    Unlock Free Access <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="landing-testimonials">
        <div className="testimonials-header">
          <h2>Whispers from the Terminal</h2>
          <p>Anonymous intel from verified engineers who cracked the market.</p>
        </div>
        
        <div className="testimonials-grid">
          <div className="testimonial-card glass-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">Saved me from lowballing myself by ₹15L during negotiations. The real-time stream showed me exactly what my level was clearing this month.</p>
            <div className="testimonial-author">
              <div className="author-avatar"><Shield size={16} /></div>
              <div className="author-info">
                <span className="author-name">Verified User</span>
                <span className="author-role">L5 Engineer, Google</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card glass-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">The most accurate comp data I've ever seen. Period. Way better than scrolling through hundreds of messy forum posts to find relevance.</p>
            <div className="testimonial-author">
              <div className="author-avatar"><Code size={16} /></div>
              <div className="author-info">
                <span className="author-name">Verified User</span>
                <span className="author-role">SDE 2, Amazon</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card glass-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">Knowing the exact signing bonus range and RSU refreshers gave me immense leverage. I literally doubled my initial equity grant.</p>
            <div className="testimonial-author">
              <div className="author-avatar"><Briefcase size={16} /></div>
              <div className="author-info">
                <span className="author-name">Verified User</span>
                <span className="author-role">Senior SWE, Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="logo-icon">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="logo-text">
                <span className="text-accent">INSTA</span> SALARIES
              </span>
            </div>
            <p className="footer-tagline">Precision Engineered Compensation Data.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms & Conditions</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 INSTA SALARIES. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

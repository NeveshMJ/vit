import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page landing-single-frame">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="emblem">GX</div>
            <div className="landing-logo-text">
              <span>GRIEVEX</span>
            </div>
          </div>

          <button
            className={`landing-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>

          <div className={`landing-nav-btns ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-hero-eyebrow animate-landing-1">
            🏛️ Grievance Resolution · Tamil Nadu Government
          </p>
          <h1 className="animate-landing-2">
            Your Civic Voice.<br />Resolved Faster.
          </h1>
          <p className="landing-hero-subtitle animate-landing-3">
            Snap a photo of any civic issue — road, water, electricity, sanitation —
            and our AI routes it to the right department with live status tracking.
          </p>
          <div className="landing-hero-cta animate-landing-4">
            <Link to="/signup" className="btn btn-primary btn-lg landing-cta-main">
              File a Grievance
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          <div className="landing-stats-row animate-landing-5">
            <div className="landing-stat-pill"><strong>37</strong> Districts</div>
            <span className="landing-stat-sep">·</span>
            <div className="landing-stat-pill"><strong>10+</strong> Departments</div>
            <span className="landing-stat-sep">·</span>
            <div className="landing-stat-pill"><strong>24/7</strong> Available</div>
            <span className="landing-stat-sep">·</span>
            <div className="landing-stat-pill"><strong>AI</strong> Powered</div>
            <span className="landing-stat-sep">·</span>
            <div className="landing-stat-pill">🔐 <strong>2FA</strong> Secured</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;




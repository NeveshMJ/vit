import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="emblem">TN</div>
          <span>TNSMP</span>
        </div>
        <div className="landing-nav-btns">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 18px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.3px'
            }}>
              🤖 AI-Powered Complaint Management
            </span>
          </div>
          <h1>Tamil Nadu Service Management Portal</h1>
          <p>
            A unified platform for citizens to report issues, track complaints, and 
            connect with government departments. AI-powered prioritization ensures 
            critical issues get addressed first.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started →
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Login
            </Link>
          </div>

          <div className="landing-features">
            <div className="landing-feature-card">
              <div className="icon">📸</div>
              <h3>Smart Complaints</h3>
              <p>Take a photo, AI auto-detects department & GPS captures your location</p>
            </div>
            <div className="landing-feature-card">
              <div className="icon">🤖</div>
              <h3>AI Priority & Detection</h3>
              <p>DeepSeek AI prioritizes urgency & detects duplicate or fake complaints</p>
            </div>
            <div className="landing-feature-card">
              <div className="icon">📊</div>
              <h3>Live Tracking</h3>
              <p>Amazon-style timeline from Registered → Accepted → Working → Completed</p>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            {[
              { num: '37', label: 'Districts Covered' },
              { num: '10', label: 'Departments' },
              { num: '24/7', label: 'Available' },
              { num: 'AI', label: 'Powered' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>{stat.num}</div>
                <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: '500', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;

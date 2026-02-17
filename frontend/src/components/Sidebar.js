import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    user: [
      { path: '/user/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/user/raise-complaint', icon: '📝', label: 'Raise Complaint' },
      { path: '/user/my-complaints', icon: '📋', label: 'My Complaints' },
    ],
    provider: [
      { path: '/provider/dashboard', icon: '🏠', label: 'Dashboard' },
    ],
    management: [
      { path: '/management/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/management/providers', icon: '👥', label: 'Service Providers' },
      { path: '/management/complaints', icon: '📋', label: 'All Complaints' },
    ]
  };

  const roleLabels = {
    user: 'Citizen',
    provider: 'Service Provider',
    management: 'Management'
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            zIndex: 99, display: 'block'
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, #ff6f00, #ffa040)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '13px', fontWeight: '900',
              boxShadow: '0 2px 8px rgba(255, 111, 0, 0.3)',
              flexShrink: 0
            }}>TN</span>
            TNSMP
          </h3>
          <p style={{ marginTop: '14px', fontSize: '14px', fontWeight: '600', letterSpacing: '-0.2px' }}>{user.name}</p>
          <span className="role-badge">{roleLabels[role]}</span>
          {user.department && (
            <p style={{ marginTop: '6px', fontSize: '12px', opacity: 0.7 }}>{user.department}</p>
          )}
        </div>

        <ul className="sidebar-menu">
          {menuItems[role]?.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
          <li style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <button onClick={handleLogout}>
              <span className="icon">🚪</span>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile menu button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
    </>
  );
}

export default Sidebar;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      switch (res.data.user.role) {
        case 'user': navigate('/user/dashboard'); break;
        case 'provider': navigate('/provider/dashboard'); break;
        case 'management': navigate('/management/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate('/verify-otp', { state: { email: err.response.data.email } });
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-card">
          <div className="logo-section">
            <div className="emblem">GX</div>
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to GRIEVEX Portal</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-link">
            Don't have an account? <Link to="/signup">Create Account</Link>
          </div>
        </div>

        <div className="credentials-box">
          <h3>Demo Credentials</h3>
          <p className="credentials-hint">Click a button to auto-fill the login form</p>

          <div className="credential-item">
            <span className="credential-role">User Account</span>
            <div className="credential-detail">
              <span className="credential-label">Email</span>
              <span className="credential-value">prajinkumar2020@gmail.com</span>
            </div>
            <div className="credential-detail">
              <span className="credential-label">Password</span>
              <span className="credential-value">Prajin@123</span>
            </div>
            <button
              type="button"
              className="btn credential-btn"
              onClick={() => fillCredentials('prajinkumar2020@gmail.com', 'Prajin@123')}
            >
              Use User Login
            </button>
          </div>

          <div className="credential-item">
            <span className="credential-role">Admin Account</span>
            <div className="credential-detail">
              <span className="credential-label">Email</span>
              <span className="credential-value">admin@tnsmp.gov.in</span>
            </div>
            <div className="credential-detail">
              <span className="credential-label">Password</span>
              <span className="credential-value">admin@tnsmp2026</span>
            </div>
            <button
              type="button"
              className="btn credential-btn"
              onClick={() => fillCredentials('admin@tnsmp.gov.in', 'admin@tnsmp2026')}
            >
              Use Admin Login
            </button>
          </div>

          <div className="credential-item">
            <span className="credential-role">Service Provider Account</span>
            <div className="credential-detail">
              <span className="credential-label">Email</span>
              <span className="credential-value">mjnevesh06@gmail.com</span>
            </div>
            <div className="credential-detail">
              <span className="credential-label">Password</span>
              <span className="credential-value">Prajin@123</span>
            </div>
            <button
              type="button"
              className="btn credential-btn"
              onClick={() => fillCredentials('mjnevesh06@gmail.com', 'Prajin@123')}
            >
              Use Provider Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;



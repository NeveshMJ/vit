import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get('/complaints/my');
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const registered = complaints.filter(c => c.status === 'Registered').length;
  const active = complaints.filter(c => c.status === 'Accepted' || c.status === 'Working On').length;
  const completed = complaints.filter(c => c.status === 'Completed').length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="user" />
      <div className="main-content">
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 60%, #5c6bc0 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 30px rgba(26, 35, 126, 0.25)'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              Welcome back, {user.name}! 👋
            </h1>
            <p style={{ opacity: 0.8, fontSize: '14px', fontWeight: '400' }}>
              Track your complaints and raise new issues
            </p>
          </div>
          <Link to="/user/raise-complaint" className="btn" style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            + Raise Complaint
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info">
              <h3>{complaints.length}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">📋</div>
            <div className="stat-info">
              <h3>{registered}</h3>
              <p>Registered</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🔧</div>
            <div className="stat-info">
              <h3>{active}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <Link to="/user/my-complaints" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading"><div className="spinner"></div> Loading...</div>
            ) : complaints.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <h3>No complaints yet</h3>
                <p>Raise your first complaint to get started</p>
                <Link to="/user/raise-complaint" className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Raise Complaint
                </Link>
              </div>
            ) : (
              complaints.slice(0, 5).map(complaint => (
                <div key={complaint._id} className={`complaint-card ${complaint.priority.toLowerCase()}`}>
                  <div className="complaint-card-header">
                    <span className="ticket-id">{complaint.ticketId}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`badge ${complaint.status === 'Registered' ? 'badge-pending' : complaint.status === 'Accepted' || complaint.status === 'Working On' ? 'badge-progress' : complaint.status === 'Completed' ? 'badge-completed' : 'badge-critical'}`}>
                        {complaint.status}
                      </span>
                      <span className={`badge badge-${complaint.priority.toLowerCase()}`}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>
                  <div className="complaint-card-body">
                    <p>{complaint.description}</p>
                  </div>
                  <div className="complaint-card-meta">
                    <span>🏢 {complaint.department}</span>
                    <span>📍 {complaint.area}</span>
                    <span>📅 {new Date(complaint.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

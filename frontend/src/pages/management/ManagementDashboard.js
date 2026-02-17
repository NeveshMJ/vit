import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

function ManagementDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/management/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="management" />
        <div className="main-content">
          <div className="loading"><div className="spinner"></div> Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const { overview, departmentStats, priorityBreakdown, recentComplaints } = dashboard || {};

  return (
    <div className="dashboard-layout">
      <Sidebar role="management" />
      <div className="main-content">
        {/* Dashboard header with gradient banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 60%, #5c6bc0 100%)',
          borderRadius: '16px',
          padding: '24px 32px',
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
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px', color: 'white' }}>
              Management Dashboard 📊
            </h1>
            <p style={{ opacity: 0.8, fontSize: '14px' }}>System overview and performance monitoring</p>
          </div>
          <button className="btn" onClick={fetchDashboard} style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)'
          }}>🔄 Refresh</button>
        </div>

        {/* Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info">
              <h3>{overview?.totalComplaints || 0}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">📋</div>
            <div className="stat-info">
              <h3>{overview?.registered || 0}</h3>
              <p>Registered</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">✅</div>
            <div className="stat-info">
              <h3>{overview?.accepted || 0}</h3>
              <p>Accepted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>🔧</div>
            <div className="stat-info">
              <h3>{overview?.workingOn || 0}</h3>
              <p>Working On</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{overview?.completed || 0}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h3>{overview?.totalUsers || 0}</h3>
              <p>Registered Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🔧</div>
            <div className="stat-info">
              <h3>{overview?.totalProviders || 0}</h3>
              <p>Service Providers</p>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3>Priority Breakdown</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Critical', value: priorityBreakdown?.critical || 0, color: '#c62828', bg: '#ffebee' },
                { label: 'High', value: priorityBreakdown?.high || 0, color: '#e65100', bg: '#fff3e0' },
                { label: 'Medium', value: priorityBreakdown?.medium || 0, color: '#1565c0', bg: '#e3f2fd' },
                { label: 'Low', value: priorityBreakdown?.low || 0, color: '#2e7d32', bg: '#e8f5e9' }
              ].map(item => (
                <div key={item.label} style={{
                  flex: '1', minWidth: '140px', textAlign: 'center', padding: '20px',
                  background: item.bg, borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: item.color, marginTop: '4px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3>Department Performance</h3>
          </div>
          <div className="card-body">
            {departmentStats && departmentStats.length > 0 ? (
              <div className="dept-stats-grid">
                {departmentStats.map(dept => (
                  <div key={dept.department} className="dept-card">
                    <h4>{dept.department}</h4>
                    <div className="dept-stat-row">
                      <span>Total Complaints</span>
                      <span>{dept.total}</span>
                    </div>
                    <div className="dept-stat-row">
                      <span>Registered</span>
                      <span style={{ color: '#e65100' }}>{dept.registered}</span>
                    </div>
                    <div className="dept-stat-row">
                      <span>Accepted</span>
                      <span style={{ color: '#1565c0' }}>{dept.accepted}</span>
                    </div>
                    <div className="dept-stat-row">
                      <span>Working On</span>
                      <span style={{ color: '#7c3aed' }}>{dept.workingOn}</span>
                    </div>
                    <div className="dept-stat-row">
                      <span>Completed</span>
                      <span style={{ color: '#2e7d32' }}>{dept.completed}</span>
                    </div>
                    <div className="dept-stat-row">
                      <span>Service Providers</span>
                      <span>{dept.providers}</span>
                    </div>
                    {/* Provider workload details */}
                    {dept.providerDetails && dept.providerDetails.length > 0 && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Provider Workload:</span>
                        {dept.providerDetails.map(p => (
                          <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 0' }}>
                            <span style={{ color: '#6b7280' }}>{p.name}</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ color: p.isBusy ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{p.isBusy ? '🔴 Busy' : '🟢 Free'}</span>
                              <span style={{ color: '#6b7280' }}>({p.activeComplaints} active, {p.completedComplaints} done)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No department data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
          </div>
          <div className="card-body">
            {recentComplaints && recentComplaints.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Department</th>
                      <th>Area</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c._id}>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a237e' }}>{c.ticketId}</span></td>
                        <td>{c.department}</td>
                        <td>{c.area}</td>
                        <td><span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                        <td><span className={`badge ${c.status === 'Registered' ? 'badge-pending' : c.status === 'Accepted' || c.status === 'Working On' ? 'badge-progress' : c.status === 'Completed' ? 'badge-completed' : 'badge-critical'}`}>{c.status}</span></td>
                        <td>{c.assignedTo ? c.assignedTo.name : '—'}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No complaints yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagementDashboard;

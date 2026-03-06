import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

const tamilNaduAreas = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Ranipet', 'Sivaganga', 'Karur', 'Namakkal',
  'Tiruppur', 'Cuddalore', 'Kanchipuram', 'Tiruvannamalai', 'Villupuram',
  'Nagapattinam', 'Ramanathapuram', 'Virudhunagar', 'Krishnagiri', 'Dharmapuri',
  'Perambalur', 'Ariyalur', 'Nilgiris', 'Pudukkottai', 'Theni',
  'Kanyakumari', 'Kallakurichi', 'Chengalpattu', 'Tiruvallur', 'Tenkasi',
  'Tirupattur', 'Mayiladuthurai'
];

const departments = [
  'Water Resources', 'Electricity', 'Roads & Highways', 'Sanitation',
  'Public Health', 'Education', 'Transport', 'Revenue', 'Agriculture', 'General'
];

function UserDashboard() {
  const [myComplaints, setMyComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'all'
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') fetchAllComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, areaFilter, statusFilter, deptFilter]);

  const fetchMyComplaints = async () => {
    try {
      const res = await API.get('/complaints/my');
      setMyComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllComplaints = async () => {
    setAllLoading(true);
    try {
      const params = new URLSearchParams();
      if (areaFilter) params.append('area', areaFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (deptFilter) params.append('department', deptFilter);
      const res = await API.get(`/complaints/all-public?${params.toString()}`);
      setAllComplaints(res.data);
    } catch (err) {
      console.error('Error fetching all complaints:', err);
    } finally {
      setAllLoading(false);
    }
  };

  const registered = myComplaints.filter(c => c.status === 'Registered').length;
  const active = myComplaints.filter(c => c.status === 'Accepted' || c.status === 'Working On').length;
  const completed = myComplaints.filter(c => c.status === 'Completed').length;

  // Stats for all complaints
  const allSolved = allComplaints.filter(c => c.status === 'Completed').length;
  const allPending = allComplaints.filter(c => ['Registered', 'Accepted', 'Working On'].includes(c.status)).length;

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Registered': return 'badge-pending';
      case 'Accepted': case 'Working On': return 'badge-progress';
      case 'Completed': return 'badge-completed';
      case 'Rejected': return 'badge-critical';
      default: return 'badge-pending';
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'Registered': return '📋';
      case 'Accepted': return '✅';
      case 'Working On': return '🔧';
      case 'Completed': return '🎉';
      case 'Rejected': return '❌';
      default: return '📌';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="user" />
      <div className="main-content">
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 30px rgba(30, 58, 138, 0.25)'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              Welcome back, {user.name}! 👋
            </h1>
            <p style={{ opacity: 0.8, fontSize: '14px', fontWeight: '400' }}>
              Track your complaints, explore all issues, and check live weather
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            <Link to="/user/complaint-map" className="btn" style={{
              background: 'rgba(255,255,255,0.10)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              🗺️ Map View
            </Link>
            <Link to="/user/weather" className="btn" style={{
              background: 'rgba(255,255,255,0.10)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              🌤️ Weather
            </Link>
          </div>
        </div>

        {/* My Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info">
              <h3>{myComplaints.length}</h3>
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

        {/* Tab Switcher */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '20px', background: '#f3f4f6',
          borderRadius: '12px', padding: '4px'
        }}>
          <button
            onClick={() => setActiveTab('my')}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: '10px', border: 'none',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: activeTab === 'my' ? '#1e3a8a' : 'transparent',
              color: activeTab === 'my' ? '#fff' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            📋 My Complaints ({myComplaints.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: '10px', border: 'none',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: activeTab === 'all' ? '#1e3a8a' : 'transparent',
              color: activeTab === 'all' ? '#fff' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            🌍 All Complaints in State
          </button>
        </div>

        {/* MY COMPLAINTS TAB */}
        {activeTab === 'my' && (
          <div className="card">
            <div className="card-header">
              <h3>Recent Complaints</h3>
              <Link to="/user/my-complaints" className="btn btn-sm btn-outline">View All</Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading"><div className="spinner"></div> Loading...</div>
              ) : myComplaints.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📭</div>
                  <h3>No complaints yet</h3>
                  <p>Raise your first complaint to get started</p>
                  <Link to="/user/raise-complaint" className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Raise Complaint
                  </Link>
                </div>
              ) : (
                myComplaints.slice(0, 5).map(complaint => (
                  <div key={complaint._id} className={`complaint-card ${complaint.priority.toLowerCase()}`}>
                    <div className="complaint-card-header">
                      <span className="ticket-id">{complaint.ticketId}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className={`badge ${statusBadgeClass(complaint.status)}`}>
                          {statusIcon(complaint.status)} {complaint.status}
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
        )}

        {/* ALL COMPLAINTS TAB with Filters */}
        {activeTab === 'all' && (
          <>
            {/* Area / Status / Department Filters */}
            <div style={{
              display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap',
              padding: '16px', background: '#fff', borderRadius: '12px',
              border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>📍 Filter by Area (District)</label>
                <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                  <option value="">All Areas</option>
                  {tamilNaduAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>📊 Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                  <option value="">All Statuses</option>
                  <option value="Solved">✅ Solved</option>
                  <option value="Pending">🕐 Pending</option>
                  <option value="Registered">📋 Registered</option>
                  <option value="Accepted">✅ Accepted</option>
                  <option value="Working On">🔧 Working On</option>
                  <option value="Completed">🎉 Completed</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>🏢 Department</label>
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {(areaFilter || statusFilter || deptFilter) && (
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={() => { setAreaFilter(''); setStatusFilter(''); setDeptFilter(''); }}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#ef4444', fontWeight: 600 }}>
                    ✕ Clear
                  </button>
                </div>
              )}
            </div>

            {/* Summary Stats for All Complaints */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#059669', margin: 0 }}>{allSolved}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#065f46', margin: 0 }}>✅ Solved</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fdba74', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#ea580c', margin: 0 }}>{allPending}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#9a3412', margin: 0 }}>🕐 Pending</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #93c5fd', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', margin: 0 }}>{allComplaints.length}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', margin: 0 }}>📊 Total</p>
              </div>
            </div>

            {/* All Complaints List */}
            <div className="card">
              <div className="card-header">
                <h3>All Complaints {areaFilter && `in ${areaFilter}`} {statusFilter && `(${statusFilter})`}</h3>
                <Link to="/user/complaint-map" className="btn btn-sm btn-outline">🗺️ View on Map</Link>
              </div>
              <div className="card-body">
                {allLoading ? (
                  <div className="loading"><div className="spinner"></div> Loading all complaints...</div>
                ) : allComplaints.length === 0 ? (
                  <div className="empty-state">
                    <div className="icon">📭</div>
                    <h3>No complaints found</h3>
                    <p>Try adjusting your filters</p>
                  </div>
                ) : (
                  allComplaints.map(complaint => (
                    <div key={complaint._id} style={{
                      padding: '14px 16px', borderRadius: '10px', marginBottom: '10px',
                      border: `1px solid ${complaint.status === 'Completed' ? '#bbf7d0' : '#fed7aa'}`,
                      background: complaint.status === 'Completed'
                        ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)'
                        : complaint.status === 'Rejected'
                          ? 'linear-gradient(135deg, #fef2f2, #fff1f2)'
                          : 'linear-gradient(135deg, #fffbeb, #fff7ed)',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', fontFamily: 'monospace' }}>{complaint.ticketId}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className={`badge ${statusBadgeClass(complaint.status)}`} style={{ fontSize: '11px' }}>
                            {statusIcon(complaint.status)} {complaint.status}
                          </span>
                          <span className={`badge badge-${(complaint.priority || 'medium').toLowerCase()}`} style={{ fontSize: '11px' }}>
                            {complaint.priority}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 8px', lineHeight: '1.4' }}>
                        {complaint.description?.length > 120 ? complaint.description.substring(0, 120) + '...' : complaint.description}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#6b7280' }}>
                        <span>🏢 {complaint.department}</span>
                        <span>📍 {complaint.area}</span>
                        <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        {complaint.assignedToName && <span>👤 {complaint.assignedToName}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;



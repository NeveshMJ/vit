import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

function ManagementComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', status: '', priority: '' });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [filters, fetchComplaints]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const res = await API.get(`/management/complaints?${params.toString()}`);
      setComplaints(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="management" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>All Complaints</h1>
            <p>{complaints.length} complaints found</p>
          </div>
        </div>

        <div className="filters-bar">
          <select
            value={filters.department}
            onChange={e => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">All Departments</option>
            {['Water Resources', 'Electricity', 'Roads & Highways', 'Sanitation',
              'Public Health', 'Education', 'Transport', 'Revenue', 'Agriculture', 'General'
            ].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Accepted">Accepted</option>
            <option value="Working On">Working On</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(filters.department || filters.status || filters.priority) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setFilters({ department: '', status: '', priority: '' })}
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="icon">📭</div>
                <h3>No complaints found</h3>
                <p>Adjust filters or wait for new complaints</p>
              </div>
            </div>
          </div>
        ) : (
          complaints.map(complaint => (
            <div
              key={complaint._id}
              className={`complaint-card ${complaint.priority.toLowerCase()}`}
              onClick={() => setExpanded(expanded === complaint._id ? null : complaint._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="complaint-card-header">
                <div>
                  <span className="ticket-id">{complaint.ticketId}</span>
                  {complaint.userId && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                      by {complaint.userId.name} ({complaint.userId.email})
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge badge-${complaint.priority.toLowerCase()}`}>{complaint.priority}</span>
                  <span className={`badge ${complaint.status === 'Registered' ? 'badge-pending' : complaint.status === 'Accepted' || complaint.status === 'Working On' ? 'badge-progress' : complaint.status === 'Completed' ? 'badge-completed' : 'badge-critical'}`}>
                    {complaint.status}
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
                {complaint.assignedTo && <span>👤 Assigned: {complaint.assignedTo.name} ({complaint.assignedTo.email})</span>}
                {complaint.address && <span>🏠 {complaint.address.substring(0, 60)}...</span>}
              </div>

              {expanded === complaint._id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  {complaint.photo && (
                    <img src={complaint.photo} alt="Complaint" className="complaint-photo" />
                  )}
                  {complaint.resolution && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#e8f5e9', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '13px' }}>Resolution:</strong>
                      <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{complaint.resolution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManagementComplaints;

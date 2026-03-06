import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCvE6g6v9Bc2jNG0LEK1v1QaWyFiO_cPag';

function ComplaintMap({ complaints }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const openInfoWindowRef = React.useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: 11.1271, lng: 78.6569 },
      mapTypeControl: true,
      streetViewControl: false,
      styles: [{ featureType: 'poi', stylers: [{ visibility: 'simplified' }] }]
    });
  }, [mapsLoaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (openInfoWindowRef.current) {
      openInfoWindowRef.current.close();
      openInfoWindowRef.current = null;
    }

    const withLocation = complaints.filter(c => c.location?.latitude && c.location?.longitude);
    const priorityColors = { 'Critical': '#ef4444', 'High': '#f97316', 'Medium': '#eab308', 'Low': '#22c55e' };
    const bounds = new window.google.maps.LatLngBounds();

    withLocation.forEach(complaint => {
      const position = { lat: complaint.location.latitude, lng: complaint.location.longitude };
      bounds.extend(position);

      const marker = new window.google.maps.Marker({
        position, map,
        title: complaint.ticketId,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: priorityColors[complaint.priority] || '#6b7280',
          fillOpacity: 1, strokeWeight: 2, strokeColor: '#ffffff', scale: 10
        }
      });
      markersRef.current.push(marker);

      const statusEmoji = { 'Registered': '📋', 'Accepted': '✅', 'Working On': '🔧', 'Completed': '🎉', 'Rejected': '❌' };
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width:280px;font-family:sans-serif;padding:4px;">
            <strong style="font-size:14px;">${complaint.ticketId}</strong> ${statusEmoji[complaint.status] || ''}
            <br/><span style="color:#6b7280;font-size:12px;">${complaint.area} | ${complaint.priority}</span>
            <p style="margin:6px 0;font-size:13px;">${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}</p>
            <strong>Status:</strong> ${complaint.status}
            <br/><strong>By:</strong> ${complaint.userName}
            ${complaint.assignedToName ? `<br/><strong>Assigned:</strong> ${complaint.assignedToName}` : ''}
            <br/><a href="https://www.google.com/maps/dir/?api=1&destination=${complaint.location.latitude},${complaint.location.longitude}" target="_blank" style="color:#2563eb;font-size:13px;">🗺️ Get Directions</a>
          </div>
        `
      });

      marker.addListener('click', () => {
        if (openInfoWindowRef.current) openInfoWindowRef.current.close();
        infoWindow.open(map, marker);
        openInfoWindowRef.current = infoWindow;
      });
    });

    if (withLocation.length > 1) map.fitBounds(bounds);
    else if (withLocation.length === 1) { map.setCenter(bounds.getCenter()); map.setZoom(14); }
  }, [mapsLoaded, complaints]);

  const withLocation = complaints.filter(c => c.location?.latitude && c.location?.longitude);
  if (withLocation.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗺️</div>
        <h3 style={{ margin: '0 0 8px', color: '#374151' }}>No Location Data</h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Complaints with GPS location will appear on the map</p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🗺️ Complaint Locations ({withLocation.length})</h3>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <span>🔴 Critical</span> <span>🟠 High</span> <span>🟡 Medium</span> <span>🟢 Low</span>
        </div>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '450px' }} />
    </div>
  );
}

function ProviderDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', resolution: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        API.get('/provider/complaints'),
        API.get('/provider/stats')
      ]);
      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.status) return;
    setUpdating(true);
    setUpdateError('');
    try {
      await API.put(`/provider/complaints/${selectedComplaint._id}`, updateForm);
      setSelectedComplaint(null);
      setUpdateForm({ status: '', resolution: '' });
      fetchData();
    } catch (err) {
      console.error('Update error:', err);
      setUpdateError(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  // Get valid next statuses for a complaint
  const getNextStatuses = (currentStatus) => {
    const transitions = {
      'Registered': ['Accepted'],
      'Accepted': ['Working On'],
      'Working On': ['Completed'],
    };
    return transitions[currentStatus] || [];
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Registered': return 'badge-pending';
      case 'Accepted': return 'badge-progress';
      case 'Working On': return 'badge-progress';
      case 'Completed': return 'badge-completed';
      case 'Rejected': return 'badge-critical';
      default: return 'badge-pending';
    }
  };

  const statusIcon = { 'Registered': '📋', 'Accepted': '✅', 'Working On': '🔧', 'Completed': '🎉', 'Rejected': '❌' };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  // Split complaints: mine vs unassigned
  const myComplaints = filtered.filter(c => c.assignedTo?._id === user.id || c.assignedTo === user.id);
  const otherComplaints = filtered.filter(c => !c.assignedTo || (c.assignedTo?._id !== user.id && c.assignedTo !== user.id));

  return (
    <div className="dashboard-layout">
      <Sidebar role="provider" />
      <div className="main-content">
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)',
          borderRadius: '16px',
          padding: '24px 32px',
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
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px', color: 'white' }}>
              {user.department} Department 🔧
            </h1>
            <p style={{ opacity: 0.8, fontSize: '14px' }}>Manage and resolve complaints assigned to you</p>
          </div>
          <button className="btn" onClick={fetchData} style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)'
          }}>🔄 Refresh</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info">
              <h3>{stats.total || 0}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🚨</div>
            <div className="stat-info">
              <h3>{stats.critical || 0}</h3>
              <p>Critical</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">📋</div>
            <div className="stat-info">
              <h3>{stats.registered || 0}</h3>
              <p>Registered</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🔧</div>
            <div className="stat-info">
              <h3>{(stats.accepted || 0) + (stats.workingOn || 0)}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{stats.completed || 0}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>⭐</div>
            <div className="stat-info">
              <h3>{stats.avgRating || '—'}</h3>
              <p>Avg Rating ({stats.totalRated || 0})</p>
            </div>
          </div>
        </div>

        {/* My active workload indicator */}
        {stats.myActive > 0 && (
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #fff7ed, #fffbeb)',
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#92400e', fontSize: '14px' }}>
                You have {stats.myActive} active complaint{stats.myActive > 1 ? 's' : ''}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>
                Complete your current work before accepting new complaints
              </p>
            </div>
          </div>
        )}

        {/* View controls */}
        <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'Registered', 'Accepted', 'Working On', 'Completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setViewMode('list')} className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}>📋 List</button>
            <button onClick={() => setViewMode('map')} className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}>🗺️ Map</button>
          </div>
        </div>

        {viewMode === 'map' && <div style={{ marginBottom: '20px' }}><ComplaintMap complaints={filtered} /></div>}

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="card"><div className="card-body"><div className="empty-state">
            <div className="icon">🎉</div><h3>No complaints</h3>
            <p>{filter !== 'all' ? `No ${filter} complaints` : 'No complaints assigned to you'}</p>
          </div></div></div>
        ) : (
          <>
            {/* My Assigned Complaints */}
            {myComplaints.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', color: '#1e3a8a', margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  👤 Assigned to Me ({myComplaints.length})
                </h3>
                {myComplaints.map(complaint => renderComplaintCard(complaint, true))}
              </>
            )}

            {/* Unassigned / Other */}
            {otherComplaints.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', color: '#6b7280', margin: '16px 0 8px' }}>
                  📋 Other Complaints ({otherComplaints.length})
                </h3>
                {otherComplaints.map(complaint => renderComplaintCard(complaint, false))}
              </>
            )}
          </>
        )}

        {/* Update Modal */}
        {selectedComplaint && (
          <div className="modal-overlay" onClick={() => { setSelectedComplaint(null); setUpdateError(''); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Update Complaint Status</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                Ticket: {selectedComplaint.ticketId} | Current: <strong>{selectedComplaint.status}</strong>
              </p>

              {updateError && <div className="error-msg" style={{ marginBottom: '12px' }}>{updateError}</div>}

              <div className="form-group">
                <label>New Status</label>
                <select value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  <option value="">Select next status</option>
                  {getNextStatuses(selectedComplaint.status).map(s => (
                    <option key={s} value={s}>{statusIcon[s]} {s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Note {updateForm.status === 'Completed' ? '(Required - describe resolution)' : '(Optional)'}</label>
                <textarea
                  value={updateForm.resolution}
                  onChange={e => setUpdateForm({ ...updateForm, resolution: e.target.value })}
                  placeholder={updateForm.status === 'Completed' ? 'Describe how the issue was resolved...' : 'Add a note about progress...'}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => { setSelectedComplaint(null); setUpdateError(''); }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdate}
                  disabled={updating || !updateForm.status || (updateForm.status === 'Completed' && !updateForm.resolution)}>
                  {updating ? 'Updating...' : `Mark as ${updateForm.status || '...'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderComplaintCard(complaint, isMine) {
    const nextStatuses = getNextStatuses(complaint.status);
    return (
      <div key={complaint._id} className={`complaint-card ${complaint.priority.toLowerCase()}`}>
        <div className="complaint-card-header">
          <div>
            <span className="ticket-id">{complaint.ticketId}</span>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
              by {complaint.userName} ({complaint.userEmail})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span className={`badge badge-${complaint.priority.toLowerCase()}`}>{complaint.priority}</span>
            <span className={`badge ${statusBadgeClass(complaint.status)}`}>
              {statusIcon[complaint.status]} {complaint.status}
            </span>
          </div>
        </div>
        <div className="complaint-card-body"><p>{complaint.description}</p></div>
        <div className="complaint-card-meta">
          <span>📍 {complaint.area}</span>
          <span>📅 {new Date(complaint.createdAt).toLocaleString()}</span>
          {complaint.address && <span>🏠 {complaint.address.substring(0, 50)}...</span>}
          {complaint.assignedToName && <span>👤 {complaint.assignedToName}</span>}
          {complaint.location?.latitude && (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${complaint.location.latitude},${complaint.location.longitude}`}
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
              onClick={e => e.stopPropagation()}>
              🗺️ Directions
            </a>
          )}
        </div>

        {/* Rating display */}
        {complaint.rating && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '16px' }}>
              {'★'.repeat(complaint.rating)}{'☆'.repeat(5 - complaint.rating)}
            </span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>{complaint.rating}/5</span>
            {complaint.feedback && <span style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>— "{complaint.feedback}"</span>}
          </div>
        )}

        {complaint.photo && (
          <img src={complaint.photo} alt="Issue" className="complaint-photo" style={{ marginTop: '12px' }} />
        )}

        {complaint.resolution && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#e8f5e9', borderRadius: '8px' }}>
            <strong style={{ fontSize: '13px' }}>Resolution:</strong>
            <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{complaint.resolution}</p>
          </div>
        )}

        {/* Status update button — only for assigned, non-completed complaints */}
        {isMine && nextStatuses.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setSelectedComplaint(complaint);
              setUpdateForm({ status: nextStatuses[0], resolution: '' });
              setUpdateError('');
            }}>
              {complaint.status === 'Registered' ? '✅ Accept Complaint' :
               complaint.status === 'Accepted' ? '🔧 Start Working' :
               complaint.status === 'Working On' ? '🎉 Mark Completed' : '✏️ Update'}
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default ProviderDashboard;



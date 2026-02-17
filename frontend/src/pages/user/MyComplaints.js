import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

const STATUS_STEPS = ['Registered', 'Accepted', 'Working On', 'Completed'];
const STATUS_ICONS = { 'Registered': '📋', 'Accepted': '✅', 'Working On': '🔧', 'Completed': '🎉', 'Rejected': '❌' };

function StatusTimeline({ complaint }) {
  const history = complaint.statusHistory || [];
  const currentStatus = complaint.status;
  const isRejected = currentStatus === 'Rejected';

  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Visual step timeline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', margin: '0 0 16px' }}>
        {STATUS_STEPS.map((step, i) => {
          const isActive = i <= currentIndex && !isRejected;
          const isCurrent = step === currentStatus;
          const historyEntry = history.find(h => h.status === step);

          return (
            <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '-50%',
                  width: '100%',
                  height: '3px',
                  background: isActive ? '#1a237e' : '#e5e7eb',
                  zIndex: 0,
                  transition: 'background 0.3s'
                }} />
              )}
              {/* Step circle */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                zIndex: 1,
                background: isActive ? '#1a237e' : '#f3f4f6',
                color: isActive ? '#fff' : '#9ca3af',
                border: isCurrent ? '3px solid #3f51b5' : '2px solid transparent',
                boxShadow: isCurrent ? '0 0 0 4px rgba(26,35,126,0.15)' : 'none',
                transition: 'all 0.3s'
              }}>
                {isActive ? STATUS_ICONS[step] : (i + 1)}
              </div>
              {/* Step label */}
              <p style={{
                fontSize: '11px',
                fontWeight: isCurrent ? 700 : 500,
                color: isActive ? '#1a237e' : '#9ca3af',
                margin: '6px 0 0',
                textAlign: 'center'
              }}>
                {step}
              </p>
              {/* Timestamp */}
              {historyEntry && (
                <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0', textAlign: 'center' }}>
                  {new Date(historyEntry.timestamp).toLocaleDateString()} {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Rejected banner */}
      {isRejected && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>❌ This complaint was rejected</p>
          {complaint.aiRemarks && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7f1d1d' }}>{complaint.aiRemarks}</p>}
        </div>
      )}

      {/* Detailed history */}
      {history.length > 0 && (
        <div style={{ borderLeft: '2px solid #e5e7eb', marginLeft: '18px', paddingLeft: '16px' }}>
          {history.map((entry, i) => (
            <div key={i} style={{ marginBottom: i < history.length - 1 ? '12px' : 0, position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '-23px',
                top: '2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: i === history.length - 1 ? '#1a237e' : '#d1d5db'
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  {STATUS_ICONS[entry.status] || '📌'} {entry.status}
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              {entry.updatedByName && (
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                  by {entry.updatedByName}
                </p>
              )}
              {entry.note && (
                <p style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0 0', fontStyle: 'italic' }}>
                  {entry.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [ratingForm, setRatingForm] = useState({ id: null, rating: 0, feedback: '', hoverRating: 0 });
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMsg, setRatingMsg] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get('/complaints/my');
      setComplaints(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (complaintId) => {
    if (!ratingForm.rating) return;
    setRatingLoading(true);
    setRatingMsg('');
    try {
      await API.put(`/complaints/${complaintId}/rate`, {
        rating: ratingForm.rating,
        feedback: ratingForm.feedback
      });
      setRatingMsg('Thank you for your feedback!');
      setRatingForm({ id: null, rating: 0, feedback: '', hoverRating: 0 });
      fetchComplaints();
    } catch (err) {
      setRatingMsg(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const StarRating = ({ rating, hoverRating, onRate, onHover, onLeave, size = 24 }) => (
    <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          style={{
            fontSize: `${size}px`,
            color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  const DisplayStars = ({ rating, size = 18 }) => (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ fontSize: `${size}px`, color: star <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
      <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '6px' }}>{rating}/5</span>
    </div>
  );

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

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar role="user" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>My Complaints</h1>
            <p>{complaints.length} total complaints</p>
          </div>
        </div>

        <div className="filters-bar">
          {['all', 'Registered', 'Accepted', 'Working On', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            >
              {f === 'all' ? 'All' : f} ({f === 'all' ? complaints.length : complaints.filter(c => c.status === f).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No complaints found</h3>
            <p>{filter !== 'all' ? `No ${filter} complaints` : 'You haven\'t raised any complaints yet'}</p>
          </div>
        ) : (
          filtered.map(complaint => (
            <div
              key={complaint._id}
              className={`complaint-card ${complaint.priority.toLowerCase()}`}
              onClick={() => setExpanded(expanded === complaint._id ? null : complaint._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="complaint-card-header">
                <span className="ticket-id">{complaint.ticketId}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${statusBadgeClass(complaint.status)}`}>
                    {STATUS_ICONS[complaint.status]} {complaint.status}
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
                {complaint.assignedTo && <span>👤 Assigned: {complaint.assignedTo.name || complaint.assignedToName}</span>}
              </div>

              {/* Inline mini-timeline showing current progress */}
              <StatusTimeline complaint={complaint} />

              {/* Duplicate / AI remarks badge */}
              {complaint.isDuplicate && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                  ⚠️ Flagged as duplicate of {complaint.duplicateOf}
                </div>
              )}
              {complaint.aiRemarks && !complaint.isDuplicate && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                  AI: {complaint.aiRemarks}
                </div>
              )}

              {/* Address display */}
              {complaint.address && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                  🏠 {complaint.address}
                </div>
              )}

              {/* Existing rating display */}
              {complaint.rating && (
                <div style={{ marginTop: '8px' }}>
                  <DisplayStars rating={complaint.rating} />
                  {complaint.feedback && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0', fontStyle: 'italic' }}>
                      "{complaint.feedback}"
                    </p>
                  )}
                </div>
              )}

              {expanded === complaint._id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }} onClick={e => e.stopPropagation()}>
                  {complaint.photo && (
                    <img src={complaint.photo} alt="Complaint" className="complaint-photo" />
                  )}

                  {/* Location info */}
                  {complaint.location?.latitude && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      🗺️ GPS: {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                    </p>
                  )}

                  {complaint.resolution && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#e8f5e9', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '13px' }}>Resolution:</strong>
                      <p style={{ fontSize: '14px', margin: '4px 0 0' }}>{complaint.resolution}</p>
                    </div>
                  )}

                  {/* Rating UI - show only for completed complaints without a rating yet */}
                  {complaint.status === 'Completed' && !complaint.rating && (
                    <div style={{ marginTop: '16px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0369a1' }}>
                        ⭐ Rate this service
                      </h4>
                      <StarRating
                        rating={ratingForm.id === complaint._id ? ratingForm.rating : 0}
                        hoverRating={ratingForm.id === complaint._id ? ratingForm.hoverRating : 0}
                        onRate={(star) => setRatingForm({ ...ratingForm, id: complaint._id, rating: star })}
                        onHover={(star) => setRatingForm({ ...ratingForm, id: complaint._id, hoverRating: star })}
                        onLeave={() => setRatingForm({ ...ratingForm, hoverRating: 0 })}
                        size={28}
                      />
                      {ratingForm.id === complaint._id && ratingForm.rating > 0 && (
                        <>
                          <textarea
                            placeholder="Share your feedback (optional)..."
                            value={ratingForm.feedback}
                            onChange={e => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                            rows={2}
                            style={{ width: '100%', marginTop: '10px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'vertical' }}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: '8px' }}
                            onClick={() => submitRating(complaint._id)}
                            disabled={ratingLoading}
                          >
                            {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                          </button>
                        </>
                      )}
                      {ratingMsg && ratingForm.id === complaint._id && (
                        <p style={{ fontSize: '13px', color: '#059669', marginTop: '8px' }}>{ratingMsg}</p>
                      )}
                    </div>
                  )}

                  <p style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                    Last updated: {new Date(complaint.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyComplaints;

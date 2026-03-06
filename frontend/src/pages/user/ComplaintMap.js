import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCvE6g6v9Bc2jNG0LEK1v1QaWyFiO_cPag';

const STATUS_COLORS = {
  'Completed': '#059669',   // Green - solved
  'Registered': '#f59e0b',  // Amber - pending
  'Accepted': '#3b82f6',    // Blue - accepted
  'Working On': '#8b5cf6',  // Purple - in progress
  'Rejected': '#ef4444'     // Red - rejected
};

const STATUS_LABELS = {
  'Completed': 'Solved',
  'Registered': 'Pending',
  'Accepted': 'Accepted',
  'Working On': 'In Progress',
  'Rejected': 'Rejected'
};

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

function ComplaintMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const openInfoWindowRef = useRef(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('');
  const [areaStats, setAreaStats] = useState({});
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load Google Maps script — same proven pattern as ProviderDashboard
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      // Script tag exists — if google is loaded use it, otherwise wait
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
      } else {
        existing.addEventListener('load', () => setMapsLoaded(true));
        // Fallback: poll in case 'load' already fired
        const poll = setInterval(() => {
          if (window.google && window.google.maps) { setMapsLoaded(true); clearInterval(poll); }
        }, 200);
        return () => clearInterval(poll);
      }
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Fetch complaint data
  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const res = await API.get('/complaints/map-data');
      setComplaints(res.data);
      const stats = {};
      for (const c of res.data) {
        if (!stats[c.area]) stats[c.area] = { total: 0, solved: 0, pending: 0 };
        stats[c.area].total++;
        if (c.status === 'Completed') stats[c.area].solved++;
        else if (['Registered', 'Accepted', 'Working On'].includes(c.status)) stats[c.area].pending++;
      }
      setAreaStats(stats);
    } catch (err) {
      console.error('Failed to fetch map data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map — depends on BOTH mapsLoaded AND loading (so div is in DOM)
  useEffect(() => {
    if (!mapsLoaded || loading || !mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 11.1271, lng: 78.6569 },
      zoom: 7,
      mapTypeId: 'roadmap',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] }
      ],
    });
    openInfoWindowRef.current = new window.google.maps.InfoWindow();
  }, [mapsLoaded, loading]);

  // Update markers when map ready, data changes, or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (openInfoWindowRef.current) openInfoWindowRef.current.close();

    // Filter
    let filtered = complaints.filter(c => c.location?.latitude && c.location?.longitude);
    if (statusFilter !== 'all') {
      if (statusFilter === 'solved') filtered = filtered.filter(c => c.status === 'Completed');
      else if (statusFilter === 'pending') filtered = filtered.filter(c => ['Registered', 'Accepted', 'Working On'].includes(c.status));
      else filtered = filtered.filter(c => c.status === statusFilter);
    }
    if (areaFilter) filtered = filtered.filter(c => c.area === areaFilter);

    const bounds = new window.google.maps.LatLngBounds();

    filtered.forEach(c => {
      const color = STATUS_COLORS[c.status] || '#6b7280';
      const statusLabel = STATUS_LABELS[c.status] || c.status;
      const position = { lat: c.location.latitude, lng: c.location.longitude };
      bounds.extend(position);

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `${c.ticketId} — ${statusLabel}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
          scale: 10,
        }
      });

      const infoContent = `
        <div style="font-family:Inter,-apple-system,sans-serif;min-width:220px;max-width:300px;padding:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="font-size:12px;color:#6b7280;font-family:monospace;">${c.ticketId}</strong>
            <span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${color};">
              ${statusLabel}
            </span>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.5;">
            ${c.description?.substring(0, 120)}${c.description?.length > 120 ? '...' : ''}
          </p>
          <div style="font-size:11px;color:#6b7280;line-height:1.8;">
            <p style="margin:0;">🏢 <strong>${c.department}</strong></p>
            <p style="margin:0;">📍 ${c.area}${c.address ? ' — ' + c.address.substring(0, 80) : ''}</p>
            <p style="margin:0;">📅 ${new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p style="margin:0;">⚡ ${c.priority} Priority</p>
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${c.location.latitude},${c.location.longitude}" target="_blank" style="display:inline-block;margin-top:6px;color:#2563eb;font-size:12px;font-weight:600;text-decoration:none;">🗺️ Get Directions</a>
        </div>`;

      marker.addListener('click', () => {
        if (openInfoWindowRef.current) {
          openInfoWindowRef.current.setContent(infoContent);
          openInfoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });

    if (filtered.length > 1) {
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    } else if (filtered.length === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    }
  }, [mapsLoaded, loading, complaints, statusFilter, areaFilter]);

  const sortedAreas = Object.entries(areaStats).sort((a, b) => b[1].total - a[1].total);
  const totalSolved = complaints.filter(c => c.status === 'Completed').length;
  const totalPending = complaints.filter(c => ['Registered', 'Accepted', 'Working On'].includes(c.status)).length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="user" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>🗺️ Complaint Map</h1>
            <p>View all complaints on the map — color-coded by status</p>
          </div>
          <Link to="/user/dashboard" className="btn btn-outline">← Back to Dashboard</Link>
        </div>

        {/* Legend & Stats */}
        <div style={{
          display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap'
        }}>
          {/* Color Legend */}
          <div style={{
            flex: '1 1 300px', background: '#fff', padding: '16px', borderRadius: '12px',
            border: '1px solid #e5e7eb', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Legend:</span>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: color, border: '2px solid #fff', boxShadow: '0 0 0 1px ' + color }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{STATUS_LABELS[status]}</span>
              </div>
            ))}
          </div>
          {/* Quick Stats */}
          <div style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap'
          }}>
            <div style={{
              background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: 0 }}>{totalSolved}</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#065f46', margin: 0 }}>Solved</p>
            </div>
            <div style={{
              background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c', margin: 0 }}>{totalPending}</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9a3412', margin: 0 }}>Pending</p>
            </div>
            <div style={{
              background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', margin: 0 }}>{complaints.length}</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#1e40af', margin: 0 }}>Total</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap',
          background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb'
        }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}>
              <option value="all">All Statuses</option>
              <option value="solved">✅ Solved (Green)</option>
              <option value="pending">🕐 Pending (Amber)</option>
              <option value="Accepted">✔️ Accepted (Blue)</option>
              <option value="Working On">🔧 In Progress (Purple)</option>
              <option value="Rejected">❌ Rejected (Red)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Area</label>
            <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}>
              <option value="">All Areas</option>
              {tamilNaduAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {(statusFilter !== 'all' || areaFilter) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setStatusFilter('all'); setAreaFilter(''); }}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* MAP — always render div so ref is in DOM */}
        <div style={{
          background: '#fff', borderRadius: '16px', overflow: 'hidden',
          border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          marginBottom: '20px', position: 'relative'
        }}>
          {(loading || !mapsLoaded) && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.9)', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ color: '#6b7280' }}>{loading ? 'Loading complaint locations...' : 'Loading Google Maps...'}</p>
            </div>
          )}
          <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
        </div>

        {/* Area Hotspot Rankings */}
        {sortedAreas.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
              🔥 Complaint Hotspots — Most Complaints by Area
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {sortedAreas.map(([area, stats], i) => {
                const solvedPct = stats.total > 0 ? Math.round(stats.solved / stats.total * 100) : 0;
                const pendingPct = stats.total > 0 ? Math.round(stats.pending / stats.total * 100) : 0;
                return (
                  <div key={area} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderRadius: '10px', background: i === 0 ? '#fef2f2' : i < 3 ? '#fff7ed' : '#fafbfc',
                    border: `1px solid ${i === 0 ? '#fecaca' : i < 3 ? '#fed7aa' : '#f3f4f6'}`,
                  }}>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? '#ef4444' : i < 3 ? '#f59e0b' : '#9ca3af',
                      color: '#fff', fontSize: '12px', fontWeight: 800, flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>📍 {area}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280' }}>{stats.total} complaints</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: '#f3f4f6' }}>
                        <div style={{ width: `${solvedPct}%`, background: '#059669', transition: 'width 0.3s' }} />
                        <div style={{ width: `${pendingPct}%`, background: '#f59e0b', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px' }}>
                        <span style={{ color: '#059669', fontWeight: 600 }}>✅ {stats.solved} solved ({solvedPct}%)</span>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>🕐 {stats.pending} pending ({pendingPct}%)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAreaFilter(area)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
                        background: areaFilter === area ? '#1e3a8a' : '#fff',
                        color: areaFilter === area ? '#fff' : '#374151',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0
                      }}
                    >
                      {areaFilter === area ? '✓ Filtered' : 'Filter'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintMap;



import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

const departments = [
  'Water Resources', 'Electricity', 'Roads & Highways', 'Sanitation',
  'Public Health', 'Education', 'Transport', 'Revenue', 'Agriculture', 'General'
];

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

function RaiseComplaint() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [form, setForm] = useState({ description: '' });
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationStatus, setLocationStatus] = useState('');

  // Auto-detected address from GPS
  const [detectedAddress, setDetectedAddress] = useState('');
  const [detectedArea, setDetectedArea] = useState('');
  const [manualAreaOverride, setManualAreaOverride] = useState(false);
  const [manualArea, setManualArea] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  // Vision API auto-detection state
  const [detectedDepartment, setDetectedDepartment] = useState('');
  const [detectedLabels, setDetectedLabels] = useState([]);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [detectionReason, setDetectionReason] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [manualDepartment, setManualDepartment] = useState('');

  // Request geolocation when camera opens
  useEffect(() => {
    if (showCamera) {
      setLocationStatus('Acquiring GPS location...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setLocationStatus(`📍 Location captured: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          },
          (err) => {
            console.error('Geolocation error:', err);
            setLocationStatus('⚠️ Location unavailable - please enable GPS');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setLocationStatus('⚠️ Geolocation not supported by browser');
      }
    }
  }, [showCamera]);

  // Reverse geocode to get address when location changes
  const reverseGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await API.post('/complaints/reverse-geocode', { latitude: lat, longitude: lng });
      if (res.data.address) {
        setDetectedAddress(res.data.address);
      }
      if (res.data.area) {
        setDetectedArea(res.data.area);
      }
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    } finally {
      setGeocoding(false);
    }
  }, []);

  // Auto-analyze image when photo is captured
  const analyzePhoto = useCallback(async (imageData) => {
    setAnalyzing(true);
    setDetectedDepartment('');
    setDetectedLabels([]);
    setDetectionConfidence(0);
    setDetectionReason('');
    setManualOverride(false);
    setManualDepartment('');

    try {
      const res = await API.post('/complaints/analyze-image', { photo: imageData });
      setDetectedDepartment(res.data.department);
      setDetectedLabels(res.data.detectedLabels || []);
      setDetectionConfidence(res.data.confidence || 0);
      setDetectionReason(res.data.reason || '');

      if (res.data.error) {
        setManualOverride(true);
      }
    } catch (err) {
      console.error('Image analysis failed:', err);
      setDetectedDepartment('General');
      setDetectionReason('Image analysis unavailable');
      setManualOverride(true);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
      // Trigger Vision API analysis
      analyzePhoto(imageSrc);
      // Re-capture location at the moment of photo capture for accuracy
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLocation({ latitude: lat, longitude: lng });
            setLocationStatus(`📍 Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            // Reverse geocode to auto-fill address
            reverseGeocode(lat, lng);
          },
          () => {} // silently fail if already captured
        );
      }
      // Also try existing location
      if (location.latitude && location.longitude && !detectedAddress) {
        reverseGeocode(location.latitude, location.longitude);
      }
    }
  }, [webcamRef, analyzePhoto, reverseGeocode, location, detectedAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!photo) {
      setError('Please take a live photo of the issue');
      return;
    }
    const finalDepartment = manualOverride ? manualDepartment : detectedDepartment;
    if (!finalDepartment) {
      setError('Department not detected yet. Please wait for image analysis or select manually.');
      return;
    }
    const finalArea = manualAreaOverride ? manualArea : detectedArea;
    if (!finalArea) {
      setError('Location could not be detected. Please select your area manually.');
      setManualAreaOverride(true);
      return;
    }
    if (!form.description) {
      setError('Please describe the issue');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        area: finalArea,
        department: finalDepartment,
        description: form.description,
        address: detectedAddress,
        photo
      };
      if (location.latitude && location.longitude) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
      }

      const res = await API.post('/complaints', payload);

      if (res.data.isDuplicate) {
        setSuccess(`⚠️ Complaint registered but flagged as potential duplicate of ${res.data.duplicateOf}. Ticket ID: ${res.data.ticketId}`);
      } else {
        let msg = `✅ Complaint registered! Ticket ID: ${res.data.ticketId} | Priority: ${res.data.priority} | Dept: ${finalDepartment}`;
        if (res.data.assignedTo) msg += ` | Assigned to: ${res.data.assignedTo}`;
        setSuccess(msg);
      }
      setTimeout(() => navigate('/user/my-complaints'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint';
      if (err.response?.data?.isFake) {
        setError('🚫 ' + msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentDepartment = manualOverride ? manualDepartment : detectedDepartment;

  return (
    <div className="dashboard-layout">
      <Sidebar role="user" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Raise a Complaint</h1>
            <p>Take a photo — AI auto-detects the department, location auto-fills from GPS</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Live Photo Section */}
              <div className="form-group">
                <label>📷 Live Photo (Required)</label>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  Take a live photo of the issue. AI auto-detects department & GPS auto-fills your location.
                </p>

                <div className="webcam-container">
                  {showCamera ? (
                    <>
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        screenshotQuality={0.8}
                        videoConstraints={{
                          width: 640,
                          height: 480,
                          facingMode: 'environment'
                        }}
                        onUserMediaError={() => setCameraError('Unable to access camera. Please allow camera permissions.')}
                        style={{ borderRadius: '12px', maxWidth: '100%' }}
                      />
                      {cameraError && <div className="error-msg" style={{ marginTop: '8px' }}>{cameraError}</div>}
                      {locationStatus && (
                        <p style={{ fontSize: '12px', color: location.latitude ? '#059669' : '#d97706', margin: '8px 0', fontWeight: 500 }}>
                          {locationStatus}
                        </p>
                      )}
                      <div className="webcam-actions">
                        <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                          📸 Capture Photo
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => setShowCamera(false)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : photo ? (
                    <>
                      <img src={photo} alt="Captured" className="captured-photo" />
                      {locationStatus && (
                        <p style={{ fontSize: '12px', color: '#059669', margin: '8px 0', fontWeight: 500 }}>
                          {locationStatus}
                        </p>
                      )}
                      <div className="webcam-actions">
                        <button type="button" className="btn btn-outline" onClick={() => {
                          setPhoto(null);
                          setShowCamera(true);
                          setDetectedDepartment('');
                          setDetectedLabels([]);
                          setManualOverride(false);
                          setDetectedAddress('');
                          setDetectedArea('');
                          setManualAreaOverride(false);
                        }}>
                          🔄 Retake Photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowCamera(true)}
                      style={{ width: '100%', padding: '40px', fontSize: '16px' }}>
                      📷 Open Camera & Take Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Auto-detected Location */}
              {(geocoding || detectedAddress || detectedArea || (photo && !geocoding)) && (
                <div className="form-group">
                  <label>📍 Location (Auto-detected from GPS)</label>
                  {geocoding ? (
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
                      borderRadius: '12px',
                      border: '1px solid #bae6fd',
                      textAlign: 'center'
                    }}>
                      <div className="spinner" style={{ margin: '0 auto 8px', width: '24px', height: '24px' }}></div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>Detecting your address from GPS...</p>
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px',
                      background: manualAreaOverride
                        ? 'linear-gradient(135deg, #fff7ed, #fffbeb)'
                        : 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                      borderRadius: '12px',
                      border: `1px solid ${manualAreaOverride ? '#fed7aa' : '#bbf7d0'}`
                    }}>
                      {!manualAreaOverride && detectedAddress && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '18px' }}>📍</span>
                            <div>
                              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#065f46' }}>{detectedAddress}</p>
                              {detectedArea && (
                                <span style={{
                                  display: 'inline-block', marginTop: '6px',
                                  padding: '4px 12px', background: '#1a237e', color: '#fff',
                                  borderRadius: '16px', fontSize: '12px', fontWeight: 600
                                }}>
                                  District: {detectedArea}
                                </span>
                              )}
                            </div>
                          </div>
                          <button type="button" onClick={() => setManualAreaOverride(true)}
                            style={{ marginTop: '8px', background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                            Not correct? Select area manually
                          </button>
                        </>
                      )}

                      {!manualAreaOverride && !detectedAddress && photo && !geocoding && (
                        <div>
                          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#92400e' }}>
                            ⚠️ GPS address could not be detected. Please select your area:
                          </p>
                          <select value={manualArea} onChange={(e) => { setManualArea(e.target.value); setManualAreaOverride(true); }}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                            <option value="">Select your area</option>
                            {tamilNaduAreas.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      )}

                      {manualAreaOverride && (
                        <div>
                          <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px', fontWeight: 600 }}>✏️ Select area manually:</p>
                          <select value={manualArea} onChange={(e) => setManualArea(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }} required>
                            <option value="">Select your area</option>
                            {tamilNaduAreas.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          {detectedArea && (
                            <button type="button" onClick={() => { setManualAreaOverride(false); setManualArea(''); }}
                              style={{ marginTop: '8px', background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                              ← Use GPS-detected area ({detectedArea})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* AI Department Detection Result */}
              {(analyzing || detectedDepartment) && (
                <div className="form-group">
                  <label>🤖 AI Department Detection</label>
                  {analyzing ? (
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
                      borderRadius: '12px',
                      border: '1px solid #bae6fd',
                      textAlign: 'center'
                    }}>
                      <div className="spinner" style={{ margin: '0 auto 12px', width: '32px', height: '32px' }}></div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#0369a1' }}>
                        🔍 Analyzing image with AI Vision...
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>
                        Detecting objects, labels and issue type
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      padding: '16px',
                      background: manualOverride
                        ? 'linear-gradient(135deg, #fff7ed, #fffbeb)'
                        : 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                      borderRadius: '12px',
                      border: `1px solid ${manualOverride ? '#fed7aa' : '#bbf7d0'}`
                    }}>
                      {!manualOverride && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{
                              display: 'inline-block', padding: '6px 14px',
                              background: '#1a237e', color: '#fff',
                              borderRadius: '20px', fontWeight: 700, fontSize: '14px'
                            }}>
                              🏢 {detectedDepartment}
                            </span>
                            <span style={{
                              fontSize: '13px',
                              color: detectionConfidence > 60 ? '#059669' : '#d97706',
                              fontWeight: 600
                            }}>
                              {detectionConfidence}% confidence
                            </span>
                          </div>
                          {detectionReason && <p style={{ fontSize: '13px', color: '#374151', margin: '6px 0' }}>{detectionReason}</p>}
                          {detectedLabels.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {detectedLabels.map((label, i) => (
                                <span key={i} style={{ padding: '3px 10px', background: '#e5e7eb', borderRadius: '12px', fontSize: '12px', color: '#374151' }}>
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                          <button type="button" onClick={() => setManualOverride(true)}
                            style={{ marginTop: '10px', background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                            Not correct? Select department manually
                          </button>
                        </>
                      )}

                      {manualOverride && (
                        <div>
                          <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px', fontWeight: 600 }}>✏️ Select department manually:</p>
                          <select value={manualDepartment} onChange={(e) => setManualDepartment(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }} required>
                            <option value="">Select department</option>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                          </select>
                          {detectedDepartment && detectedDepartment !== 'General' && (
                            <button type="button" onClick={() => { setManualOverride(false); setManualDepartment(''); }}
                              style={{ marginTop: '8px', background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                              ← Use AI-detected department ({detectedDepartment})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="form-group">
                <label>📝 Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue in detail... (AI will analyze for priority and duplicate detection)"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              {/* Show selected department in submit button */}
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading || analyzing}>
                {loading ? 'Submitting... (AI is analyzing)' : analyzing ? 'Analyzing image...' :
                  currentDepartment ? `Submit to ${currentDepartment} Department` : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaiseComplaint;

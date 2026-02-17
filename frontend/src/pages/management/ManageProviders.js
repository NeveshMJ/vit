import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api';

const departments = [
  'Water Resources', 'Electricity', 'Roads & Highways', 'Sanitation',
  'Public Health', 'Education', 'Transport', 'Revenue', 'Agriculture', 'General'
];

function ManageProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await API.get('/management/providers');
      setProviders(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await API.post('/management/providers', form);
      setSuccess(`Service provider ${form.name} created successfully!`);
      setForm({ name: '', email: '', department: '', password: '' });
      setShowModal(false);
      fetchProviders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create provider');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove service provider "${name}"?`)) return;
    try {
      await API.delete(`/management/providers/${id}`);
      fetchProviders();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="management" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Service Providers</h1>
            <p>Assign and manage service providers for each department</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Provider
          </button>
        </div>

        {success && <div className="success-msg" style={{ marginBottom: '20px' }}>{success}</div>}

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading providers...</div>
        ) : (
          <div className="card">
            <div className="card-body">
              {providers.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">👥</div>
                  <h3>No service providers</h3>
                  <p>Add your first service provider to get started</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Last Login</th>
                        <th>Login Count</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.map(p => (
                        <tr key={p._id}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.email}</td>
                          <td><span className="badge badge-progress">{p.department}</span></td>
                          <td>{p.lastLogin ? new Date(p.lastLogin).toLocaleString() : 'Never'}</td>
                          <td>{p.loginCount || 0}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(p._id, p.name)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Provider Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Add Service Provider</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                Create a new service provider account. Credentials will be emailed to them.
              </p>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Provider's full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Provider's email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="text"
                    placeholder="Set a password for the provider"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Provider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProviders;

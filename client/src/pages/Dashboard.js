import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    jobTitle: '', companyName: '', description: '', salary: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await API.post('/jobs/check', formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <h1>🔍 Fake Job Detector</h1>
        <div>
          <span>Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={() => navigate('/history')}>
            History
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '30px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Check a Job Posting</h2>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                placeholder="e.g. Software Engineer"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="e.g. Google (leave empty if not mentioned)"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                placeholder="Paste the full job description here..."
                value={formData.description}
                onChange={handleChange}
                required
                style={{ minHeight: '150px' }}
              />
            </div>
            <div className="form-group">
              <label>Salary (if mentioned)</label>
              <input
                type="text"
                name="salary"
                placeholder="e.g. 50000"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Analyzing...' : '🔍 Analyze Job'}
            </button>
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div className={`result-card ${result.result === 'FAKE' ? 'result-fake' : 'result-real'}`}>
            <span className={`result-badge ${result.result === 'FAKE' ? 'badge-fake' : 'badge-real'}`}>
              {result.result === 'FAKE' ? '❌ FAKE JOB' : '✅ REAL JOB'}
            </span>
            <p style={{ color: '#555', marginBottom: '8px' }}>
              Suspicion Score: <strong>{result.score}</strong>
            </p>
            {result.flags.length > 0 && (
              <>
                <p style={{ fontWeight: '500', marginBottom: '8px' }}>Reasons:</p>
                <ul className="flags-list">
                  {result.flags.map((flag, index) => (
                    <li key={index}>⚠️ {flag}</li>
                  ))}
                </ul>
              </>
            )}
            {result.result === 'REAL' && (
              <p style={{ color: '#38a169', marginTop: '8px' }}>
                ✅ No suspicious activity detected in this job posting.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
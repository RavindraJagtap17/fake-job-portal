import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    jobTitle: '', companyName: '', description: '', salary: ''
  });
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manual');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScrape = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    setScraping(true);
    setError('');
    try {
      const res = await API.post('/jobs/scrape', { url });
      setFormData({
        jobTitle: res.data.data.jobTitle || '',
        companyName: res.data.data.companyName || '',
        description: res.data.data.description || '',
        salary: res.data.data.salary || ''
      });
      setActiveTab('manual');
      alert('Job details extracted! Please review and click Analyze.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch job from URL');
    }
    setScraping(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Welcome, {user?.name}</span>
          {user?.isAdmin && (
            <button
              className="logout-btn"
              onClick={() => navigate('/admin')}
              style={{ background: '#4f46e5' }}>
              👑 Admin Panel
            </button>
          )}
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

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('url')}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                background: activeTab === 'url' ? '#4f46e5' : '#f0f0f0',
                color: activeTab === 'url' ? 'white' : '#333'
              }}>
              🔗 Paste URL
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                background: activeTab === 'manual' ? '#4f46e5' : '#f0f0f0',
                color: activeTab === 'manual' ? 'white' : '#333'
              }}>
              ✏️ Enter Manually
            </button>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {/* URL Tab */}
          {activeTab === 'url' && (
            <div>
              <div className="form-group">
                <label>Job Posting URL</label>
                <input
                  type="text"
                  placeholder="https://www.naukri.com/job-listings-..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                className="btn"
                onClick={handleScrape}
                disabled={scraping}>
                {scraping ? 'Fetching job details...' : '🔗 Fetch Job Details'}
              </button>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#888' }}>
                ⚠️ Note: Some websites block scraping. If it fails, use manual entry.
              </p>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
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
          )}
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
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const resultRef = useRef(null);
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
    if (!url) { setError('Please enter a URL'); return; }
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
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
        <h1>🔍 JobGuard</h1>
        <div className="navbar-right">
          <span className="navbar-welcome">Hi, {user?.name}</span>
          {user?.isAdmin && (
            <button className="nav-btn admin-btn" onClick={() => navigate('/admin')}>
              👑 Admin
            </button>
          )}
          <button className="nav-btn" onClick={() => navigate('/history')}>
            History
          </button>
          <button className="nav-btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="hero">
        <h2>Detect <span>Fake Job</span> Postings</h2>
        <p>Powered by AI + Machine Learning • 97% Accuracy</p>
      </div>

      <div className="container">

        {/* Tabs */}
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'url' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('url')}>
            🔗 Paste URL
          </button>
          <button
            className={`tab-btn ${activeTab === 'manual' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('manual')}>
            ✏️ Enter Manually
          </button>
        </div>

        <div className="card">
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
              <button className="btn" onClick={handleScrape} disabled={scraping}>
                {scraping ? 'Fetching...' : '🔗 Fetch & Analyze'}
              </button>
              <p className="url-note">⚠️ Some websites block scraping. Use manual entry as backup.</p>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
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
                    placeholder="e.g. TCS"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  placeholder="Paste the full job description here..."
                  value={formData.description}
                  onChange={handleChange}
                  required
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
                {loading ? '⏳ Analyzing...' : '🔍 Analyze Job'}
              </button>
            </form>
          )}
        </div>

        {/* Result Card */}
        {result && (
          <div
            ref={resultRef}
            className={`result-card ${result.result === 'FAKE' ? 'result-fake' : 'result-real'}`}>

            <span className={`result-badge ${result.result === 'FAKE' ? 'badge-fake' : 'badge-real'}`}>
              {result.result === 'FAKE' ? '❌ FAKE JOB' : '✅ REAL JOB'}
            </span>

            {result.mlAnalysis && (
              <div className="ml-box">
                <p className="ml-box-title">🤖 ML Model Analysis</p>
                <div className="prob-row">
                  <span className="prob-label">Fake</span>
                  <div className="prob-bar">
                    <div
                      className="prob-fill fake"
                      style={{ width: `${result.mlAnalysis.fakeProbability}%` }}
                    />
                  </div>
                  <span className="prob-val">{result.mlAnalysis.fakeProbability}%</span>
                </div>
                <div className="prob-row">
                  <span className="prob-label">Real</span>
                  <div className="prob-bar">
                    <div
                      className="prob-fill real"
                      style={{ width: `${result.mlAnalysis.realProbability}%` }}
                    />
                  </div>
                  <span className="prob-val">{result.mlAnalysis.realProbability}%</span>
                </div>
              </div>
            )}

            <p className="score-row">
              Rule Based Score: <strong style={{ color: result.result === 'FAKE' ? '#e53e3e' : '#38a169' }}>
                {result.score}
              </strong>
            </p>

            {result.flags.length > 0 && (
              <>
                <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  ⚠️ Reasons Flagged:
                </p>
                <ul className="flags-list">
                  {result.flags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </>
            )}

            {result.result === 'REAL' && (
              <p style={{ color: '#38a169', marginTop: '10px', fontSize: '14px' }}>
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
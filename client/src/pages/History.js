import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const History = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/jobs/history');
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <div className="navbar">
        <h1>🔍 JobGuard</h1>
        <div className="navbar-right">
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="container">
        <p className="page-title">Your Check History</p>

        {loading && <div className="loading">Loading...</div>}

        {!loading && jobs.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: '40px' }}>📋</p>
            <p>No history yet. Go check a job posting!</p>
          </div>
        )}

        {jobs.map((job) => (
          <div key={job.id} className="history-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="history-title" style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {job.jobTitle}
              </p>
              <p className="history-company">
                {job.companyName || 'No company'} • Score: {job.score}
              </p>
            </div>
            <span className={`history-badge ${job.result === 'FAKE' ? 'fake' : 'real'}`}>
              {job.result === 'FAKE' ? '❌ FAKE' : '✅ REAL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
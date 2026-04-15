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
        <h1>🔍 Fake Job Detector</h1>
        <div>
          <button className="logout-btn" onClick={() => navigate('/dashboard')}>
            Back to Check
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Your Check History</h2>

        {loading && <p style={{ color: '#666' }}>Loading...</p>}

        {!loading && jobs.length === 0 && (
          <p style={{ color: '#666' }}>No history yet. Go check a job posting!</p>
        )}

        {jobs.map((job) => (
          <div key={job.id} className="history-item">
            <div>
              <p className="history-title">{job.jobTitle}</p>
              <p className="history-company">
                {job.companyName || 'No company name'} • Score: {job.score}
              </p>
            </div>
            <span className={`result-badge ${job.result === 'FAKE' ? 'badge-fake' : 'badge-real'}`}
              style={{ fontSize: '14px', padding: '4px 14px' }}>
              {job.result === 'FAKE' ? '❌ FAKE' : '✅ REAL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
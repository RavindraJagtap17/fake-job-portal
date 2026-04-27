import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Admin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/dashboard'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/jobs')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const tabStyle = (tab) => ({
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    background: activeTab === tab ? '#4f46e5' : '#f0f0f0',
    color: activeTab === tab ? 'white' : '#666',
    whiteSpace: 'nowrap'
  });

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div>
      <div className="navbar">
        <h1>🔍 JobGuard Admin</h1>
        <div className="navbar-right">
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>
            User View
          </button>
          <button className="nav-btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <p className="page-title">👑 Admin Dashboard</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>
            📊 Statistics
          </button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            👥 Users ({users.length})
          </button>
          <button style={tabStyle('jobs')} onClick={() => setActiveTab('jobs')}>
            📋 Jobs ({jobs.length})
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-num">{stats.totalUsers}</div>
                <div className="stat-label">👥 Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.totalJobs}</div>
                <div className="stat-label">📋 Jobs Checked</div>
              </div>
              <div className="stat-card">
                <div className="stat-num fake">{stats.fakeJobs}</div>
                <div className="stat-label">❌ Fake Detected</div>
              </div>
              <div className="stat-card">
                <div className="stat-num real">{stats.realJobs}</div>
                <div className="stat-label">✅ Real Jobs</div>
              </div>
            </div>

            {stats.totalJobs > 0 && (
              <div className="card rounded">
                <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Fake Job Detection Rate
                </p>
                <div className="rate-bar-container">
                  <div
                    className="rate-bar-fill"
                    style={{ width: `${Math.round((stats.fakeJobs / stats.totalJobs) * 100)}%` }}>
                    {Math.round((stats.fakeJobs / stats.totalJobs) * 100)}%
                  </div>
                </div>
                <p style={{ marginTop: '8px', color: '#aaa', fontSize: '13px' }}>
                  {Math.round((stats.fakeJobs / stats.totalJobs) * 100)}% of checked jobs were fake
                </p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: '#aaa' }}>{u.id}</td>
                    <td style={{ fontWeight: '500', color: '#1a1a2e' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.isAdmin ? 'admin' : 'user'}`}>
                        {u.isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Checked By</th>
                  <th>Result</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: '500', color: '#1a1a2e' }}>{job.jobTitle}</td>
                    <td>{job.companyName || 'N/A'}</td>
                    <td>{job.user?.name || 'N/A'}</td>
                    <td>
                      <span className={`history-badge ${job.result === 'FAKE' ? 'fake' : 'real'}`}>
                        {job.result === 'FAKE' ? '❌ FAKE' : '✅ REAL'}
                      </span>
                    </td>
                    <td>{job.score}</td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
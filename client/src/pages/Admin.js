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
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
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
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    background: activeTab === tab ? '#4f46e5' : '#f0f0f0',
    color: activeTab === tab ? 'white' : '#333'
  });

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px', color: '#666' }}>
      Loading admin panel...
    </div>
  );

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <h1>🔍 Fake Job Detector — Admin Panel</h1>
        <div>
          <span style={{ marginRight: '16px' }}>👑 {user?.name}</span>
          <button className="logout-btn" onClick={() => navigate('/dashboard')}>
            User View
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '30px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>
            📊 Statistics
          </button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            👥 Users ({users.length})
          </button>
          <button style={tabStyle('jobs')} onClick={() => setActiveTab('jobs')}>
            📋 All Jobs ({jobs.length})
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {/* Total Users */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#4f46e5' }}>{stats.totalUsers}</p>
                <p style={{ color: '#666', marginTop: '8px' }}>👥 Total Users</p>
              </div>
              {/* Total Jobs */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#4f46e5' }}>{stats.totalJobs}</p>
                <p style={{ color: '#666', marginTop: '8px' }}>📋 Total Jobs Checked</p>
              </div>
              {/* Fake Jobs */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center', borderLeft: '5px solid #e53e3e' }}>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#e53e3e' }}>{stats.fakeJobs}</p>
                <p style={{ color: '#666', marginTop: '8px' }}>❌ Fake Jobs Detected</p>
              </div>
              {/* Real Jobs */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center', borderLeft: '5px solid #38a169' }}>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#38a169' }}>{stats.realJobs}</p>
                <p style={{ color: '#666', marginTop: '8px' }}>✅ Real Jobs</p>
              </div>
            </div>

            {/* Fake percentage bar */}
            {stats.totalJobs > 0 && (
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <p style={{ fontWeight: '500', marginBottom: '12px' }}>Fake Job Rate</p>
                <div style={{ background: '#f0f0f0', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round((stats.fakeJobs / stats.totalJobs) * 100)}%`,
                    background: '#e53e3e',
                    height: '100%',
                    borderRadius: '8px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                  {Math.round((stats.fakeJobs / stats.totalJobs) * 100)}% of checked jobs are fake
                </p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>ID</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Email</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Role</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #f0f0f0', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{u.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: u.isAdmin ? '#ebf4ff' : '#f0f0f0',
                        color: u.isAdmin ? '#4f46e5' : '#666'
                      }}>
                        {u.isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888', fontSize: '13px' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Job Title</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Company</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Checked By</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Result</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Score</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: '500' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={job.id} style={{ borderTop: '1px solid #f0f0f0', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{job.jobTitle}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{job.companyName || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{job.user?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: job.result === 'FAKE' ? '#fff5f5' : '#f0fff4',
                        color: job.result === 'FAKE' ? '#e53e3e' : '#38a169'
                      }}>
                        {job.result === 'FAKE' ? '❌ FAKE' : '✅ REAL'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{job.score}</td>
                    <td style={{ padding: '12px 16px', color: '#888', fontSize: '13px' }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
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
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET - Admin statistics
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalJobs = await Job.count();
    const fakeJobs = await Job.count({ where: { result: 'FAKE' } });
    const realJobs = await Job.count({ where: { result: 'REAL' } });

    res.json({
      totalUsers,
      totalJobs,
      fakeJobs,
      realJobs
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - All users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - All jobs
router.get('/jobs', auth, admin, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    const jobsFormatted = jobs.map(job => ({
      ...job.dataValues,
      flags: JSON.parse(job.flags || '[]'),
      user: job.User
    }));

    res.json(jobsFormatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT - Make user admin
router.put('/make-admin/:id', auth, admin, async (req, res) => {
  try {
    await User.update(
      { isAdmin: true },
      { where: { id: req.params.id } }
    );
    res.json({ message: 'User is now an admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
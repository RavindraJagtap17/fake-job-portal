const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Detection logic
const detectFakeJob = (jobData) => {
  const { jobTitle, companyName, description, salary } = jobData;

  const fakeKeywords = [
    'no experience needed',
    'work from home',
    'earn $5000',
    'earn $3000',
    'guaranteed income',
    'unlimited earning',
    'no interview',
    'send money',
    'western union',
    'wire transfer',
    'urgently hiring',
    'make money fast',
    'be your own boss',
    'no qualification',
    'easy money'
  ];

  let score = 0;
  let flags = [];
  const text = `${jobTitle} ${description} ${salary}`.toLowerCase();

  // Check fake keywords
  fakeKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 2;
      flags.push(`Suspicious phrase: "${keyword}"`);
    }
  });

  // Check no company name
  if (!companyName || companyName.trim() === '') {
    score += 2;
    flags.push('No company name provided');
  }

  // Check very short description
  const wordCount = description.trim().split(/\s+/).length;
  if (wordCount < 30) {
    score += 2;
    flags.push('Description too short (less than 30 words)');
  }

  // Check unrealistic salary
  if (salary) {
    const salaryNum = parseInt(salary.replace(/[^0-9]/g, ''));
    if (salaryNum > 100000) {
      score += 2;
      flags.push('Unrealistically high salary');
    }
  }

  const result = score >= 4 ? 'FAKE' : 'REAL';

  return { result, score, flags };
};

// POST - Check a job
router.post('/check', auth, async (req, res) => {
  try {
    const { jobTitle, companyName, description, salary } = req.body;

    if (!jobTitle || !description) {
      return res.status(400).json({ message: 'Job title and description are required' });
    }

    // Run detection
    const { result, score, flags } = detectFakeJob({ jobTitle, companyName, description, salary });

    // Save to database
    const job = await Job.create({
      userId: req.user.id,
      jobTitle,
      companyName,
      description,
      salary,
      result,
      score,
      flags: JSON.stringify(flags)
    });

    res.json({
      message: 'Job analyzed successfully',
      result,
      score,
      flags,
      jobId: job.id
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - Get user's job history
router.get('/history', auth, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    // Parse flags from string to array
    const jobsFormatted = jobs.map(job => ({
      ...job.dataValues,
      flags: JSON.parse(job.flags || '[]')
    }));

    res.json(jobsFormatted);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


const scrapeJobFromURL = require('../utils/scraper');

// POST - Scrape job from URL
router.post('/scrape', auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Scrape job details
    const scrapedData = await scrapeJobFromURL(url);

    if (!scrapedData.success) {
      return res.status(400).json({ message: scrapedData.error });
    }

    res.json({
      message: 'Job details extracted successfully',
      data: scrapedData
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const User = require('./models/User');
const Job = require('./models/Job');
const jobRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Fake Job Detection API is running!' });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;

User.hasMany(Job, { foreignKey: 'userId' });
Job.belongsTo(User, { foreignKey: 'userId' });

sequelize.sync({ force: false })
  .then(() => {
    console.log('MySQL Database connected and tables created!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Database connection error:', err.message);
  });
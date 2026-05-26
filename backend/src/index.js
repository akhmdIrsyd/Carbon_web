const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const regionRoutes = require('./routes/regions');
const carbonRoutes = require('./routes/carbon');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

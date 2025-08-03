const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const userRoutes = require('./routes/users');
const plantingRoutes = require('./routes/planting-plans');
const cultivationRoutes = require('./routes/cultivation-tasks');
const harvestingRoutes = require('./routes/harvesting-tasks');
const transportationRoutes = require('./routes/transportation');
const costRoutes = require('./routes/cost-accounting');
const reportRoutes = require('./routes/reports');

app.use('/api/users', userRoutes);
app.use('/api/planting-plans', plantingRoutes);
app.use('/api/cultivation-tasks', cultivationRoutes);
app.use('/api/harvesting-tasks', harvestingRoutes);
app.use('/api/transportation', transportationRoutes);
app.use('/api/cost-accounting', costRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`林业生产数字化管理系统后端服务启动成功，端口: ${PORT}`);
  console.log(`前端访问地址: http://localhost:${PORT}`);
});

module.exports = app;
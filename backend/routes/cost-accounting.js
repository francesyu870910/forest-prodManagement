const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cost_accounting.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    res.json(data.cost_accounting || []);
  } catch (error) {
    res.status(500).json({ error: '获取成本数据失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cost_accounting.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const newRecord = {
      id: dataService.generateId('cost'),
      ...req.body,
      createdAt: dataService.getCurrentTimestamp(),
      updatedAt: dataService.getCurrentTimestamp()
    };

    if (!data.cost_accounting) {
      data.cost_accounting = [];
    }
    data.cost_accounting.push(newRecord);

    const result = await dataService.writeJsonFile('cost_accounting.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: '创建成本记录失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cost_accounting.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const recordIndex = data.cost_accounting?.findIndex(c => c.id === req.params.id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: '成本记录不存在' });
    }

    data.cost_accounting[recordIndex] = {
      ...data.cost_accounting[recordIndex],
      ...req.body,
      updatedAt: dataService.getCurrentTimestamp()
    };

    const result = await dataService.writeJsonFile('cost_accounting.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(data.cost_accounting[recordIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新成本记录失败' });
  }
});

module.exports = router;
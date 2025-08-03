const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('transportation.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    res.json(data.transportation || []);
  } catch (error) {
    res.status(500).json({ error: '获取运输记录列表失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('transportation.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const newRecord = {
      id: dataService.generateId('trans'),
      ...req.body,
      createdAt: dataService.getCurrentTimestamp(),
      updatedAt: dataService.getCurrentTimestamp()
    };

    if (!data.transportation) {
      data.transportation = [];
    }
    data.transportation.push(newRecord);

    const result = await dataService.writeJsonFile('transportation.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: '创建运输记录失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('transportation.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const recordIndex = data.transportation?.findIndex(t => t.id === req.params.id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: '运输记录不存在' });
    }

    data.transportation[recordIndex] = {
      ...data.transportation[recordIndex],
      ...req.body,
      updatedAt: dataService.getCurrentTimestamp()
    };

    const result = await dataService.writeJsonFile('transportation.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(data.transportation[recordIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新运输记录失败' });
  }
});

module.exports = router;
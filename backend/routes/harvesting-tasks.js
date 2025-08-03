const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('harvesting_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    res.json(data.harvesting_tasks || []);
  } catch (error) {
    res.status(500).json({ error: '获取采伐任务列表失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('harvesting_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const newTask = {
      id: dataService.generateId('harv'),
      ...req.body,
      createdAt: dataService.getCurrentTimestamp(),
      updatedAt: dataService.getCurrentTimestamp()
    };

    if (!data.harvesting_tasks) {
      data.harvesting_tasks = [];
    }
    data.harvesting_tasks.push(newTask);

    const result = await dataService.writeJsonFile('harvesting_tasks.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: '创建采伐任务失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('harvesting_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const taskIndex = data.harvesting_tasks?.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: '采伐任务不存在' });
    }

    data.harvesting_tasks[taskIndex] = {
      ...data.harvesting_tasks[taskIndex],
      ...req.body,
      updatedAt: dataService.getCurrentTimestamp()
    };

    const result = await dataService.writeJsonFile('harvesting_tasks.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(data.harvesting_tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新采伐任务失败' });
  }
});

module.exports = router;
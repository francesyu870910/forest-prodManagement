const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cultivation_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    res.json(data.cultivation_tasks || []);
  } catch (error) {
    res.status(500).json({ error: '获取抚育任务列表失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cultivation_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const newTask = {
      id: dataService.generateId('cult'),
      ...req.body,
      createdAt: dataService.getCurrentTimestamp(),
      updatedAt: dataService.getCurrentTimestamp()
    };

    if (!data.cultivation_tasks) {
      data.cultivation_tasks = [];
    }
    data.cultivation_tasks.push(newTask);

    const result = await dataService.writeJsonFile('cultivation_tasks.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: '创建抚育任务失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cultivation_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const taskIndex = data.cultivation_tasks?.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: '抚育任务不存在' });
    }

    data.cultivation_tasks[taskIndex] = {
      ...data.cultivation_tasks[taskIndex],
      ...req.body,
      updatedAt: dataService.getCurrentTimestamp()
    };

    const result = await dataService.writeJsonFile('cultivation_tasks.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(data.cultivation_tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新抚育任务失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('cultivation_tasks.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const taskIndex = data.cultivation_tasks?.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: '抚育任务不存在' });
    }

    data.cultivation_tasks.splice(taskIndex, 1);

    const result = await dataService.writeJsonFile('cultivation_tasks.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: '抚育任务删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除抚育任务失败' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('planting_plans.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    res.json(data.planting_plans || []);
  } catch (error) {
    res.status(500).json({ error: '获取造林计划列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('planting_plans.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    const plan = data.planting_plans?.find(p => p.id === req.params.id);
    if (!plan) {
      return res.status(404).json({ error: '造林计划不存在' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: '获取造林计划失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('planting_plans.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const newPlan = {
      id: dataService.generateId('plan'),
      ...req.body,
      createdAt: dataService.getCurrentTimestamp(),
      updatedAt: dataService.getCurrentTimestamp()
    };

    if (!data.planting_plans) {
      data.planting_plans = [];
    }
    data.planting_plans.push(newPlan);

    const result = await dataService.writeJsonFile('planting_plans.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: '创建造林计划失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('planting_plans.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const planIndex = data.planting_plans?.findIndex(p => p.id === req.params.id);
    if (planIndex === -1) {
      return res.status(404).json({ error: '造林计划不存在' });
    }

    data.planting_plans[planIndex] = {
      ...data.planting_plans[planIndex],
      ...req.body,
      updatedAt: dataService.getCurrentTimestamp()
    };

    const result = await dataService.writeJsonFile('planting_plans.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(data.planting_plans[planIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新造林计划失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('planting_plans.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const planIndex = data.planting_plans?.findIndex(p => p.id === req.params.id);
    if (planIndex === -1) {
      return res.status(404).json({ error: '造林计划不存在' });
    }

    data.planting_plans.splice(planIndex, 1);

    const result = await dataService.writeJsonFile('planting_plans.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: '造林计划删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除造林计划失败' });
  }
});

module.exports = router;
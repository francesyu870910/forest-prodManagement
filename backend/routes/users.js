const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('users.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    res.json(data.users || []);
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('users.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }
    const user = data.users?.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('users.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const newUser = {
      id: dataService.generateId('user'),
      ...req.body,
      createdAt: dataService.getCurrentTimestamp(),
      updatedAt: dataService.getCurrentTimestamp()
    };

    if (!data.users) {
      data.users = [];
    }
    data.users.push(newUser);

    const result = await dataService.writeJsonFile('users.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: '创建用户失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('users.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const userIndex = data.users?.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...req.body,
      updatedAt: dataService.getCurrentTimestamp()
    };

    const result = await dataService.writeJsonFile('users.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(data.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新用户失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await dataService.readJsonFile('users.json');
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const userIndex = data.users?.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }

    data.users.splice(userIndex, 1);

    const result = await dataService.writeJsonFile('users.json', data);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除用户失败' });
  }
});

module.exports = router;
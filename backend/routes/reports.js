const express = require('express');
const router = express.Router();
const dataService = require('../services/data-service');

router.get('/production', async (req, res) => {
  try {
    const plantingData = await dataService.readJsonFile('planting_plans.json');
    const harvestingData = await dataService.readJsonFile('harvesting_tasks.json');
    const cultivationData = await dataService.readJsonFile('cultivation_tasks.json');

    const report = {
      planting: {
        totalPlans: plantingData.planting_plans?.length || 0,
        completedPlans: plantingData.planting_plans?.filter(p => p.status === 'completed').length || 0,
        totalArea: plantingData.planting_plans?.reduce((sum, p) => sum + (p.actualArea || 0), 0) || 0,
        totalSeedlings: plantingData.planting_plans?.reduce((sum, p) => sum + (p.actualSeedlingsUsed || 0), 0) || 0
      },
      harvesting: {
        totalTasks: harvestingData.harvesting_tasks?.length || 0,
        completedTasks: harvestingData.harvesting_tasks?.filter(t => t.status === 'completed').length || 0,
        totalVolume: harvestingData.harvesting_tasks?.reduce((sum, t) => sum + (t.actualVolume || 0), 0) || 0
      },
      cultivation: {
        totalTasks: cultivationData.cultivation_tasks?.length || 0,
        completedTasks: cultivationData.cultivation_tasks?.filter(t => t.status === 'completed').length || 0,
        totalArea: cultivationData.cultivation_tasks?.reduce((sum, t) => sum + (t.area || 0), 0) || 0
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: '生成生产统计报表失败' });
  }
});

router.get('/cost', async (req, res) => {
  try {
    const costData = await dataService.readJsonFile('cost_accounting.json');
    
    const report = {
      totalCost: costData.cost_accounting?.reduce((sum, c) => sum + (c.totalCost || 0), 0) || 0,
      costByType: {},
      monthlyTrend: {}
    };

    costData.cost_accounting?.forEach(cost => {
      if (!report.costByType[cost.costType]) {
        report.costByType[cost.costType] = 0;
      }
      report.costByType[cost.costType] += cost.totalCost || 0;
    });

    const monthlyTrend = {};
    costData.cost_accounting?.forEach(cost => {
      const month = cost.period;
      if (month) {
        if (!monthlyTrend[month]) {
          monthlyTrend[month] = 0;
        }
        monthlyTrend[month] += cost.totalCost || 0;
      }
    });

    // Sort the monthly trend data by month
    const sortedMonthlyTrend = Object.entries(monthlyTrend)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    report.monthlyTrend = sortedMonthlyTrend;

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: '生成成本分析报表失败' });
  }
});

router.get('/progress', async (req, res) => {
  try {
    const plantingData = await dataService.readJsonFile('planting_plans.json');
    const harvestingData = await dataService.readJsonFile('harvesting_tasks.json');
    
    const report = {
      overallProgress: {
        planting: {
          planned: plantingData.planting_plans?.length || 0,
          inProgress: plantingData.planting_plans?.filter(p => p.status === 'in_progress').length || 0,
          completed: plantingData.planting_plans?.filter(p => p.status === 'completed').length || 0
        },
        harvesting: {
          planned: harvestingData.harvesting_tasks?.length || 0,
          inProgress: harvestingData.harvesting_tasks?.filter(t => t.status === 'in_progress').length || 0,
          completed: harvestingData.harvesting_tasks?.filter(t => t.status === 'completed').length || 0
        }
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: '生成进度汇总报表失败' });
  }
});

module.exports = router;
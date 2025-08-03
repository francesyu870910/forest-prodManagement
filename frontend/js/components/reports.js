function getLast12Months() {
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
}

async function loadReports() {
    showReport('production');
}

async function showReport(reportType) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    const clickedBtn = Array.from(tabBtns).find(btn =>
        btn.textContent.includes(getReportTypeText(reportType))
    );
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    const reportContent = document.getElementById('reportContent');

    try {
        switch(reportType) {
            case 'production':
                await showEnhancedProductionReport(reportContent);
                break;
            case 'cost':
                await showEnhancedCostReport(reportContent);
                break;
            case 'progress':
                await showEnhancedProgressReport(reportContent);
                break;
        }
    } catch (error) {
        console.error('加载报表失败:', error);
        showAlert('加载报表失败', 'error');
    }
}

function getReportTypeText(type) {
    const typeMap = {
        'production': '生产统计',
        'cost': '成本分析',
        'progress': '进度汇总'
    };
    return typeMap[type] || type;
}

async function showEnhancedProductionReport(container) {
    const [report, planting, harvesting, cultivation, transportation] = await Promise.all([
        apiService.getProductionReport(),
        apiService.getPlantingPlans(),
        apiService.getHarvestingTasks(),
        apiService.getCultivationTasks(),
        apiService.getTransportation()
    ]);

    const plantingBySpecies = {};
    const harvestingByMonth = {};
    const cultivationByType = {};

    planting.forEach(plan => {
        if (!plantingBySpecies[plan.treeSpecies]) {
            plantingBySpecies[plan.treeSpecies] = { count: 0, area: 0, seedlings: 0 };
        }
        plantingBySpecies[plan.treeSpecies].count++;
        plantingBySpecies[plan.treeSpecies].area += plan.actualArea || plan.planArea || 0;
        plantingBySpecies[plan.treeSpecies].seedlings += plan.actualSeedlingsUsed || plan.seedlingsQuantity || 0;
    });

    harvesting.forEach(task => {
        const month = task.actualStartDate ? task.actualStartDate.substring(0, 7) : task.plannedStartDate?.substring(0, 7);
        if (month) {
            if (!harvestingByMonth[month]) {
                harvestingByMonth[month] = { count: 0, volume: 0 };
            }
            harvestingByMonth[month].count++;
            harvestingByMonth[month].volume += task.actualVolume || task.estimatedVolume || 0;
        }
    });

    cultivation.forEach(task => {
        if (!cultivationByType[task.taskTypeName]) {
            cultivationByType[task.taskTypeName] = { count: 0, area: 0, cost: 0 };
        }
        cultivationByType[task.taskTypeName].count++;
        cultivationByType[task.taskTypeName].area += task.area || 0;
        cultivationByType[task.taskTypeName].cost += task.totalCost || 0;
    });

    const last12Months = getLast12Months();
    const harvestingTrendData = last12Months.map(month => harvestingByMonth[month]?.volume || 0);
    const maxHarvestVolume = Math.max(...harvestingTrendData, 1);

    container.innerHTML = `
        <h3>🌲 生产统计报表</h3>
        <div class="report-grid">
            <div class="report-stat-card primary">
                <div class="report-icon">🌳</div>
                <h4>造林统计</h4>
                <div class="report-number">${report.planting.totalPlans}</div>
                <p>总计划数 | 已完成: ${report.planting.completedPlans}</p>
                <div class="report-details">
                    <span>造林面积: ${report.planting.totalArea.toFixed(1)} 公顷</span>
                    <span>苗木数量: ${report.planting.totalSeedlings.toLocaleString()} 株</span>
                </div>
            </div>
            <div class="report-stat-card success">
                <div class="report-icon">⚡</div>
                <h4>采伐统计</h4>
                <div class="report-number">${report.harvesting.totalTasks}</div>
                <p>总任务数 | 已完成: ${report.harvesting.completedTasks}</p>
                <div class="report-details">
                    <span>采伐材积: ${report.harvesting.totalVolume.toFixed(1)} 立方米</span>
                </div>
            </div>
            <div class="report-stat-card warning">
                <div class="report-icon">🌿</div>
                <h4>抚育统计</h4>
                <div class="report-number">${report.cultivation.totalTasks}</div>
                <p>总任务数 | 已完成: ${report.cultivation.completedTasks}</p>
                <div class="report-details">
                    <span>抚育面积: ${report.cultivation.totalArea.toFixed(1)} 公顷</span>
                </div>
            </div>
            <div class="report-stat-card info">
                <div class="report-icon">🚛</div>
                <h4>运输统计</h4>
                <div class="report-number">${transportation.length}</div>
                <p>总运输记录</p>
                <div class="report-details">
                    <span>完成: ${transportation.filter(t => t.status === 'completed').length} 条</span>
                </div>
            </div>
        </div>

        <div class="chart-section">
            <h4>🌲 树种分布统计</h4>
            <div class="species-grid">
                ${Object.entries(plantingBySpecies).map(([species, data]) => `
                    <div class="species-item">
                        <h5>${species}</h5>
                        <div class="species-stats">
                            <div class="species-stat">
                                <span class="stat-value">${data.count}</span>
                                <span class="stat-label">项目数</span>
                            </div>
                            <div class="species-stat">
                                <span class="stat-value">${data.area.toFixed(1)}</span>
                                <span class="stat-label">面积(公顷)</span>
                            </div>
                            <div class="species-stat">
                                <span class="stat-value">${(data.seedlings/1000).toFixed(1)}K</span>
                                <span class="stat-label">苗木数量</span>
                            </div>
                        </div>
                        <div class="species-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((data.area / 200) * 100, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        

        <div class="chart-section">
            <h4>🌱 抚育作业类型分析</h4>
            <div class="cultivation-analysis">
                ${Object.entries(cultivationByType).map(([type, data]) => `
                    <div class="cultivation-type">
                        <div class="cultivation-header">
                            <h5>${type}</h5>
                            <span class="cultivation-count">${data.count} 次</span>
                        </div>
                        <div class="cultivation-metrics">
                            <div>面积: ${data.area.toFixed(1)} 公顷</div>
                            <div>成本: ¥${data.cost.toLocaleString()}</div>
                        </div>
                        <div class="cultivation-bar">
                            <div class="bar-fill" style="width: ${Math.min((data.count / 5) * 100, 100)}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="completion-section">
            <h4>✅ 完成率统计</h4>
            <div class="completion-grid">
                <div class="completion-item">
                    <span class="completion-label">造林完成率</span>
                    <div class="completion-bar">
                        <div class="completion-fill primary" style="width: ${report.planting.totalPlans > 0 ? (report.planting.completedPlans / report.planting.totalPlans * 100) : 0}%"></div>
                    </div>
                    <span class="completion-percentage">${report.planting.totalPlans > 0 ? Math.round(report.planting.completedPlans / report.planting.totalPlans * 100) : 0}%</span>
                </div>
                <div class="completion-item">
                    <span class="completion-label">采伐完成率</span>
                    <div class="completion-bar">
                        <div class="completion-fill success" style="width: ${report.harvesting.totalTasks > 0 ? (report.harvesting.completedTasks / report.harvesting.totalTasks * 100) : 0}%"></div>
                    </div>
                    <span class="completion-percentage">${report.harvesting.totalTasks > 0 ? Math.round(report.harvesting.completedTasks / report.harvesting.totalTasks * 100) : 0}%</span>
                </div>
                <div class="completion-item">
                    <span class="completion-label">抚育完成率</span>
                    <div class="completion-bar">
                        <div class="completion-fill warning" style="width: ${report.cultivation.totalTasks > 0 ? (report.cultivation.completedTasks / report.cultivation.totalTasks * 100) : 0}%"></div>
                    </div>
                    <span class="completion-percentage">${report.cultivation.totalTasks > 0 ? Math.round(report.cultivation.completedTasks / report.cultivation.totalTasks * 100) : 0}%</span>
                </div>
            </div>
        </div>
    `;
}

async function showEnhancedCostReport(container) {
    const [report, costData] = await Promise.all([
        apiService.getCostReport(),
        apiService.getCostAccounting()
    ]);

    const avgCostByType = {};
    const costTrendData = {};

    Object.entries(report.costByType).forEach(([type, totalCost]) => {
        const typeTasks = costData.filter(c => c.costType === type);
        avgCostByType[type] = typeTasks.length > 0 ? totalCost / typeTasks.length : 0;
    });

    Object.entries(report.monthlyTrend).forEach(([month, cost]) => {
        costTrendData[month] = cost;
    });

    const last12Months = getLast12Months();
    const costTrendValues = last12Months.map(month => costTrendData[month] || 0);
    const maxCost = Math.max(...costTrendValues, 1);

    container.innerHTML = `
        <h3>💰 成本分析报表</h3>
        <div class="cost-overview">
            <div class="cost-summary-card">
                <div class="cost-icon">💰</div>
                <div class="cost-summary">
                    <h4>总投入成本</h4>
                    <div class="cost-amount">¥${report.totalCost.toLocaleString()}</div>
                </div>
            </div>
            <div class="cost-metrics">
                <div class="cost-metric">
                    <span class="metric-label">平均单项成本</span>
                    <span class="metric-value">¥${Math.round(report.totalCost / costData.length).toLocaleString()}</span>
                </div>
                <div class="cost-metric">
                    <span class="metric-label">预算执行率</span>
                    <span class="metric-value">92.3%</span>
                </div>
                <div class="cost-metric">
                    <span class="metric-label">成本节约</span>
                    <span class="metric-value">¥${(costData.reduce((sum, c) => sum + (c.variance || 0), 0)).toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div class="cost-breakdown">
            <h4>📊 成本类型分析</h4>
            <div class="cost-types">
                ${Object.entries(report.costByType).map(([type, cost]) => {
                    const percentage = (cost / report.totalCost * 100).toFixed(1);
                    const avgCost = avgCostByType[type];
                    return `
                        <div class="cost-type-item">
                            <div class="cost-type-header">
                                <h5>${getCostTypeText(type)}</h5>
                                <span class="cost-percentage">${percentage}%</span>
                            </div>
                            <div class="cost-type-amount">¥${cost.toLocaleString()}</div>
                            <div class="cost-type-avg">平均: ¥${avgCost.toLocaleString()}</div>
                            <div class="cost-progress-bar">
                                <div class="cost-progress-fill" style="width: ${percentage}%; background-color: ${getCostTypeColor(type)}"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        

        <div class="cost-efficiency">
            <h4>⚡ 成本效率分析</h4>
            <div class="efficiency-metrics">
                <div class="efficiency-item">
                    <div class="efficiency-label">造林成本效率</div>
                    <div class="efficiency-value">¥${(report.costByType.planting / 100).toFixed(0)}/公顷</div>
                    <div class="efficiency-trend">↗ 提升 8.5%</div>
                </div>
                <div class="efficiency-item">
                    <div class="efficiency-label">采伐成本效率</div>
                    <div class="efficiency-value">¥${(report.costByType.harvesting / 1000).toFixed(0)}/立方米</div>
                    <div class="efficiency-trend">↘ 降低 3.2%</div>
                </div>
                <div class="efficiency-item">
                    <div class="efficiency-label">抚育成本效率</div>
                    <div class="efficiency-value">¥${(report.costByType.cultivation / 50).toFixed(0)}/公顷</div>
                    <div class="efficiency-trend">→ 持平</div>
                </div>
            </div>
        </div>
    `;
}

async function showEnhancedProgressReport(container) {
    const [report, planting, harvesting] = await Promise.all([
        apiService.getProgressReport(),
        apiService.getPlantingPlans(),
        apiService.getHarvestingTasks()
    ]);

    const currentDate = new Date();
    const delayedPlanting = planting.filter(p => {
        if (p.status === 'completed') return false;
        const endDate = new Date(p.planEndDate);
        return endDate < currentDate;
    });

    const delayedHarvesting = harvesting.filter(h => {
        if (h.status === 'completed') return false;
        const endDate = new Date(h.plannedEndDate);
        return endDate < currentDate;
    });

    container.innerHTML = `
        <h3>📊 进度汇总报表</h3>
        <div class="progress-overview-section">
            <div class="progress-summary">
                <div class="summary-item">
                    <div class="summary-icon">🎯</div>
                    <div class="summary-content">
                        <h4>总体完成率</h4>
                        <div class="summary-percentage">
                            ${Math.round(((report.overallProgress.planting.completed + report.overallProgress.harvesting.completed) / (report.overallProgress.planting.planned + report.overallProgress.harvesting.planned)) * 100)}%
                        </div>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <h4>延期项目</h4>
                        <div class="summary-count">${delayedPlanting.length + delayedHarvesting.length}</div>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">🚀</div>
                    <div class="summary-content">
                        <h4>进行中项目</h4>
                        <div class="summary-count">${report.overallProgress.planting.inProgress + report.overallProgress.harvesting.inProgress}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="detailed-progress">
            <div class="progress-section-detailed">
                <h4>🌲 造林项目进度详情</h4>
                <div class="progress-detail-grid">
                    <div class="progress-detail-item">
                        <div class="detail-header">
                            <span class="detail-label">计划项目</span>
                            <span class="detail-value">${report.overallProgress.planting.planned}</span>
                        </div>
                        <div class="detail-breakdown">
                            <div class="breakdown-item">
                                <span>进行中: ${report.overallProgress.planting.inProgress}</span>
                                <div class="mini-progress">
                                    <div class="mini-fill" style="width: ${(report.overallProgress.planting.inProgress / report.overallProgress.planting.planned) * 100}%"></div>
                                </div>
                            </div>
                            <div class="breakdown-item">
                                <span>已完成: ${report.overallProgress.planting.completed}</span>
                                <div class="mini-progress">
                                    <div class="mini-fill completed" style="width: ${(report.overallProgress.planting.completed / report.overallProgress.planting.planned) * 100}%"></div>
                                </div>
                            </div>
                            <div class="breakdown-item">
                                <span>延期: ${delayedPlanting.length}</span>
                                <div class="mini-progress">
                                    <div class="mini-fill delayed" style="width: ${(delayedPlanting.length / report.overallProgress.planting.planned) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-section-detailed">
                <h4>⚡ 采伐项目进度详情</h4>
                <div class="progress-detail-grid">
                    <div class="progress-detail-item">
                        <div class="detail-header">
                            <span class="detail-label">计划项目</span>
                            <span class="detail-value">${report.overallProgress.harvesting.planned}</span>
                        </div>
                        <div class="detail-breakdown">
                            <div class="breakdown-item">
                                <span>进行中: ${report.overallProgress.harvesting.inProgress}</span>
                                <div class="mini-progress">
                                    <div class="mini-fill" style="width: ${(report.overallProgress.harvesting.inProgress / report.overallProgress.harvesting.planned) * 100}%"></div>
                                </div>
                            </div>
                            <div class="breakdown-item">
                                <span>已完成: ${report.overallProgress.harvesting.completed}</span>
                                <div class="mini-progress">
                                    <div class="mini-fill completed" style="width: ${(report.overallProgress.harvesting.completed / report.overallProgress.harvesting.planned) * 100}%"></div>
                                </div>
                            </div>
                            <div class="breakdown-item">
                                <span>延期: ${delayedHarvesting.length}</span>
                                <div class="mini-progress">
                                    <div class="mini-fill delayed" style="width: ${(delayedHarvesting.length / report.overallProgress.harvesting.planned) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="timeline-section">
            <h4>📅 项目时间线</h4>
            <div class="timeline">
                ${[...planting.slice(0, 5), ...harvesting.slice(0, 3)].map(project => {
                    const isCompleted = project.status === 'completed';
                    const isDelayed = !isCompleted && new Date(project.planEndDate || project.plannedEndDate) < currentDate;
                    return `
                        <div class="timeline-item ${isCompleted ? 'completed' : isDelayed ? 'delayed' : 'active'}">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h5>${project.planName || project.taskName}</h5>
                                <div class="timeline-date">
                                    ${project.planStartDate || project.plannedStartDate} - ${project.planEndDate || project.plannedEndDate}
                                </div>
                                <div class="timeline-status">
                                    ${isCompleted ? '✅ 已完成' : isDelayed ? '⚠️ 延期' : '🚀 进行中'}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function getCostTypeColor(type) {
    const colors = {
        'planting': '#3498db',
        'cultivation': '#f39c12',
        'harvesting': '#e74c3c',
        'transportation': '#27ae60'
    };
    return colors[type] || '#95a5a6';
}

function getCostTypeText(type) {
    const typeMap = {
        'planting': '造林成本',
        'cultivation': '抚育成本',
        'harvesting': '采伐成本',
        'transportation': '运输成本'
    };
    return typeMap[type] || type;
}
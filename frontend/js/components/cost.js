async function loadCostAccounting() {
    try {
        const costs = await apiService.getCostAccounting();
        const tbody = document.querySelector('#costTable tbody');
        
        tbody.innerHTML = costs.map(cost => `
            <tr>
                <td>${cost.projectName}</td>
                <td>${getCostTypeText(cost.costType)}</td>
                <td>${cost.period}</td>
                <td>¥${cost.laborCost?.toFixed(2) || '0.00'}</td>
                <td>¥${cost.materialCost?.toFixed(2) || '0.00'}</td>
                <td>¥${cost.totalCost?.toFixed(2) || '0.00'}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="viewCostDetail('${cost.id}')">详情</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载成本数据失败:', error);
        showAlert('加载成本数据失败', 'error');
    }
}

function showCostForm(costId = null) {
    const title = costId ? '编辑成本记录' : '添加成本记录';
    const content = `
        <form id="costForm">
            <div class="form-group">
                <label for="projectName">项目名称</label>
                <input type="text" id="projectName" name="projectName" required>
            </div>
            <div class="form-group">
                <label for="costType">成本类型</label>
                <select id="costType" name="costType" required>
                    <option value="">请选择成本类型</option>
                    <option value="planting">造林成本</option>
                    <option value="cultivation">抚育成本</option>
                    <option value="harvesting">采伐成本</option>
                    <option value="transportation">运输成本</option>
                </select>
            </div>
            <div class="form-group">
                <label for="period">期间</label>
                <input type="month" id="period" name="period" required>
            </div>
            <div class="form-group">
                <label for="laborCost">人工成本</label>
                <input type="number" id="laborCost" name="laborCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="materialCost">材料成本</label>
                <input type="number" id="materialCost" name="materialCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="equipmentCost">设备成本</label>
                <input type="number" id="equipmentCost" name="equipmentCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="fuelCost">燃料成本</label>
                <input type="number" id="fuelCost" name="fuelCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="otherCost">其他费用</label>
                <input type="number" id="otherCost" name="otherCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="budgetAmount">预算金额</label>
                <input type="number" id="budgetAmount" name="budgetAmount" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="remarks">备注</label>
                <textarea id="remarks" name="remarks"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">保存</button>
            </div>
        </form>
    `;
    
    showModal(title, content);
    
    document.getElementById('costForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCostAccounting(costId);
    });
}

async function saveCostAccounting(costId) {
    try {
        const formData = new FormData(document.getElementById('costForm'));
        const costData = Object.fromEntries(formData);
        
        costData.laborCost = parseFloat(costData.laborCost);
        costData.materialCost = parseFloat(costData.materialCost);
        costData.equipmentCost = parseFloat(costData.equipmentCost);
        costData.fuelCost = parseFloat(costData.fuelCost);
        costData.otherCost = parseFloat(costData.otherCost);
        costData.budgetAmount = parseFloat(costData.budgetAmount);
        
        costData.totalCost = costData.laborCost + costData.materialCost + 
                           costData.equipmentCost + costData.fuelCost + costData.otherCost;
        costData.variance = costData.budgetAmount - costData.totalCost;
        
        if (costId) {
            await apiService.updateCostAccounting(costId, costData);
            showAlert('成本记录更新成功');
        } else {
            await apiService.createCostAccounting(costData);
            showAlert('成本记录创建成功');
        }
        
        closeModal();
        loadCostAccounting();
    } catch (error) {
        console.error('保存成本记录失败:', error);
        showAlert('保存成本记录失败', 'error');
    }
}

async function viewCostDetail(costId) {
    try {
        const costs = await apiService.getCostAccounting();
        const cost = costs.find(c => c.id === costId);
        
        if (!cost) {
            showAlert('成本记录不存在', 'error');
            return;
        }
        
        const content = `
            <div class="cost-detail">
                <h3>成本详情</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>项目名称:</label>
                        <span>${cost.projectName}</span>
                    </div>
                    <div class="detail-item">
                        <label>成本类型:</label>
                        <span>${getCostTypeText(cost.costType)}</span>
                    </div>
                    <div class="detail-item">
                        <label>核算期间:</label>
                        <span>${cost.period}</span>
                    </div>
                    <div class="detail-item">
                        <label>人工成本:</label>
                        <span>¥${cost.laborCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item">
                        <label>材料成本:</label>
                        <span>¥${cost.materialCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item">
                        <label>设备成本:</label>
                        <span>¥${cost.equipmentCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item">
                        <label>燃料成本:</label>
                        <span>¥${cost.fuelCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item">
                        <label>其他费用:</label>
                        <span>¥${cost.otherCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item total">
                        <label>总成本:</label>
                        <span>¥${cost.totalCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item">
                        <label>预算金额:</label>
                        <span>¥${cost.budgetAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-item ${cost.variance >= 0 ? 'positive' : 'negative'}">
                        <label>预算差异:</label>
                        <span>¥${cost.variance?.toFixed(2) || '0.00'}</span>
                    </div>
                    ${cost.remarks ? `
                    <div class="detail-item full-width">
                        <label>备注:</label>
                        <span>${cost.remarks}</span>
                    </div>
                    ` : ''}
                    <div class="detail-item full-width">
                        <label>负责会计:</label>
                        <span>${cost.accountantId || '未指定'}</span>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="editCostRecord('${cost.id}')">编辑</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        `;
        
        showModal('成本记录详情', content);
    } catch (error) {
        console.error('查看成本详情失败:', error);
        showAlert('查看成本详情失败', 'error');
    }
}

async function editCostRecord(costId) {
    try {
        const costs = await apiService.getCostAccounting();
        const cost = costs.find(c => c.id === costId);
        
        if (!cost) {
            showAlert('成本记录不存在', 'error');
            return;
        }
        
        closeModal();
        showCostForm(costId);
        
        setTimeout(() => {
            Object.keys(cost).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = cost[key];
                }
            });
        }, 100);
    } catch (error) {
        console.error('编辑成本记录失败:', error);
        showAlert('编辑成本记录失败', 'error');
    }
}

function getCostTypeText(costType) {
    const costTypeMap = {
        'planting': '造林成本',
        'cultivation': '抚育成本',
        'harvesting': '采伐成本',
        'transportation': '运输成本'
    };
    return costTypeMap[costType] || costType;
}
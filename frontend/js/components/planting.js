async function loadPlantingPlans() {
    try {
        const plans = await apiService.getPlantingPlans();
        const tbody = document.querySelector('#plantingTable tbody');
        
        tbody.innerHTML = plans.map(plan => `
            <tr>
                <td>${plan.planName}</td>
                <td>${plan.forestAreaName}</td>
                <td>${plan.treeSpecies}</td>
                <td>${plan.planArea}</td>
                <td><span class="status-badge status-${plan.status}">${getStatusText(plan.status)}</span></td>
                <td>${plan.progress || 0}%</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="editPlantingPlan('${plan.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deletePlantingPlan('${plan.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载造林计划失败:', error);
        showAlert('加载造林计划失败', 'error');
    }
}

function showPlantingForm(planId = null) {
    const title = planId ? '编辑造林计划' : '添加造林计划';
    const content = `
        <form id="plantingForm">
            <div class="form-group">
                <label for="planName">计划名称</label>
                <input type="text" id="planName" name="planName" required>
            </div>
            <div class="form-group">
                <label for="forestAreaCode">林区代码</label>
                <input type="text" id="forestAreaCode" name="forestAreaCode" required>
            </div>
            <div class="form-group">
                <label for="forestAreaName">林区名称</label>
                <input type="text" id="forestAreaName" name="forestAreaName" required>
            </div>
            <div class="form-group">
                <label for="location">位置</label>
                <input type="text" id="location" name="location" required>
            </div>
            <div class="form-group">
                <label for="treeSpecies">树种</label>
                <select id="treeSpecies" name="treeSpecies" required>
                    <option value="">请选择树种</option>
                    <option value="樟子松">樟子松</option>
                    <option value="落叶松">落叶松</option>
                    <option value="白桦">白桦</option>
                    <option value="杨树">杨树</option>
                    <option value="榆树">榆树</option>
                </select>
            </div>
            <div class="form-group">
                <label for="planStartDate">计划开始日期</label>
                <input type="date" id="planStartDate" name="planStartDate" required>
            </div>
            <div class="form-group">
                <label for="planEndDate">计划结束日期</label>
                <input type="date" id="planEndDate" name="planEndDate" required>
            </div>
            <div class="form-group">
                <label for="planArea">计划面积(公顷)</label>
                <input type="number" id="planArea" name="planArea" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="seedlingsQuantity">苗木数量</label>
                <input type="number" id="seedlingsQuantity" name="seedlingsQuantity" required>
            </div>
            <div class="form-group">
                <label for="estimatedCost">预估成本</label>
                <input type="number" id="estimatedCost" name="estimatedCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="status">状态</label>
                <select id="status" name="status" required>
                    <option value="planning">计划中</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                </select>
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
    
    document.getElementById('plantingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePlantingPlan(planId);
    });
    
    if (planId) {
        loadPlantingPlanData(planId);
    }
}

async function loadPlantingPlanData(planId) {
    try {
        const plans = await apiService.getPlantingPlans();
        const plan = plans.find(p => p.id === planId);
        
        if (plan) {
            Object.keys(plan).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = plan[key];
                }
            });
        }
    } catch (error) {
        console.error('加载造林计划数据失败:', error);
    }
}

async function savePlantingPlan(planId) {
    try {
        const formData = new FormData(document.getElementById('plantingForm'));
        const planData = Object.fromEntries(formData);
        
        planData.planArea = parseFloat(planData.planArea);
        planData.seedlingsQuantity = parseInt(planData.seedlingsQuantity);
        planData.estimatedCost = parseFloat(planData.estimatedCost);
        
        if (planId) {
            await apiService.updatePlantingPlan(planId, planData);
            showAlert('造林计划更新成功');
        } else {
            await apiService.createPlantingPlan(planData);
            showAlert('造林计划创建成功');
        }
        
        closeModal();
        loadPlantingPlans();
    } catch (error) {
        console.error('保存造林计划失败:', error);
        showAlert('保存造林计划失败', 'error');
    }
}

async function editPlantingPlan(planId) {
    showPlantingForm(planId);
}

async function deletePlantingPlan(planId) {
    showConfirm('确定要删除这个造林计划吗？', async function(result) {
        if (result) {
            try {
                await apiService.deletePlantingPlan(planId);
                showAlert('造林计划删除成功');
                loadPlantingPlans();
            } catch (error) {
                console.error('删除造林计划失败:', error);
                showAlert('删除造林计划失败', 'error');
            }
        }
    });
}

function getStatusText(status) {
    const statusMap = {
        'planning': '计划中',
        'in_progress': '进行中',
        'completed': '已完成',
        'planned': '已计划',
        'in_transit': '运输中'
    };
    return statusMap[status] || status;
}
async function loadHarvestingTasks() {
    try {
        const tasks = await apiService.getHarvestingTasks();
        const tbody = document.querySelector('#harvestingTable tbody');
        
        tbody.innerHTML = tasks.map(task => `
            <tr>
                <td>${task.taskName}</td>
                <td>${task.forestAreaName}</td>
                <td>${task.permitNumber}</td>
                <td>${task.area}</td>
                <td>${task.actualVolume || task.estimatedVolume}</td>
                <td><span class="status-badge status-${task.status}">${getStatusText(task.status)}</span></td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="editHarvestingTask('${task.id}')">编辑</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载采伐任务失败:', error);
        showAlert('加载采伐任务失败', 'error');
    }
}

function showHarvestingForm(taskId = null) {
    const title = taskId ? '编辑采伐任务' : '添加采伐任务';
    const content = `
        <form id="harvestingForm">
            <div class="form-group">
                <label for="taskName">任务名称</label>
                <input type="text" id="taskName" name="taskName" required>
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
                <label for="permitNumber">许可证号</label>
                <input type="text" id="permitNumber" name="permitNumber" required>
            </div>
            <div class="form-group">
                <label for="permitStartDate">许可开始日期</label>
                <input type="date" id="permitStartDate" name="permitStartDate" required>
            </div>
            <div class="form-group">
                <label for="permitEndDate">许可结束日期</label>
                <input type="date" id="permitEndDate" name="permitEndDate" required>
            </div>
            <div class="form-group">
                <label for="area">采伐面积(公顷)</label>
                <input type="number" id="area" name="area" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="treeSpecies">树种</label>
                <select id="treeSpecies" name="treeSpecies" required>
                    <option value="">请选择树种</option>
                    <option value="樟子松">樟子松</option>
                    <option value="落叶松">落叶松</option>
                    <option value="白桦">白桦</option>
                    <option value="杨树">杨树</option>
                </select>
            </div>
            <div class="form-group">
                <label for="estimatedVolume">预估材积(立方米)</label>
                <input type="number" id="estimatedVolume" name="estimatedVolume" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="workersCount">作业人数</label>
                <input type="number" id="workersCount" name="workersCount" required>
            </div>
            <div class="form-group">
                <label for="status">状态</label>
                <select id="status" name="status" required>
                    <option value="planned">已计划</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">保存</button>
            </div>
        </form>
    `;
    
    showModal(title, content);
    
    document.getElementById('harvestingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveHarvestingTask(taskId);
    });
    
    if (taskId) {
        loadHarvestingTaskData(taskId);
    }
}

async function saveHarvestingTask(taskId) {
    try {
        const formData = new FormData(document.getElementById('harvestingForm'));
        const taskData = Object.fromEntries(formData);
        
        taskData.area = parseFloat(taskData.area);
        taskData.estimatedVolume = parseFloat(taskData.estimatedVolume);
        taskData.workersCount = parseInt(taskData.workersCount);
        
        if (taskId) {
            await apiService.updateHarvestingTask(taskId, taskData);
            showAlert('采伐任务更新成功');
        } else {
            await apiService.createHarvestingTask(taskData);
            showAlert('采伐任务创建成功');
        }
        
        closeModal();
        loadHarvestingTasks();
    } catch (error) {
        console.error('保存采伐任务失败:', error);
        showAlert('保存采伐任务失败', 'error');
    }
}

async function loadHarvestingTaskData(taskId) {
    try {
        const tasks = await apiService.getHarvestingTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            Object.keys(task).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = task[key];
                }
            });
        }
    } catch (error) {
        console.error('加载采伐任务数据失败:', error);
    }
}

async function editHarvestingTask(taskId) {
    showHarvestingForm(taskId);
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
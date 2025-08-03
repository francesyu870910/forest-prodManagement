async function loadCultivationTasks() {
    try {
        const tasks = await apiService.getCultivationTasks();
        const tbody = document.querySelector('#cultivationTable tbody');
        
        tbody.innerHTML = tasks.map(task => `
            <tr>
                <td>${task.taskName}</td>
                <td>${task.forestAreaName}</td>
                <td>${task.taskTypeName}</td>
                <td>${task.area}</td>
                <td><span class="status-badge status-${task.status}">${getStatusText(task.status)}</span></td>
                <td>¥${task.totalCost?.toFixed(2) || '0.00'}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="editCultivationTask('${task.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCultivationTask('${task.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载抚育任务失败:', error);
        showAlert('加载抚育任务失败', 'error');
    }
}

function showCultivationForm(taskId = null) {
    const title = taskId ? '编辑抚育任务' : '添加抚育任务';
    const content = `
        <form id="cultivationForm">
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
                <label for="taskType">作业类型</label>
                <select id="taskType" name="taskType" required>
                    <option value="">请选择作业类型</option>
                    <option value="weeding">除草</option>
                    <option value="fertilizing">施肥</option>
                    <option value="pest_control">病虫害防治</option>
                    <option value="pruning">修剪</option>
                    <option value="irrigation">灌溉</option>
                </select>
            </div>
            <div class="form-group">
                <label for="scheduledDate">计划日期</label>
                <input type="date" id="scheduledDate" name="scheduledDate" required>
            </div>
            <div class="form-group">
                <label for="area">作业面积(公顷)</label>
                <input type="number" id="area" name="area" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="workersCount">作业人数</label>
                <input type="number" id="workersCount" name="workersCount" required>
            </div>
            <div class="form-group">
                <label for="materialCost">材料费用</label>
                <input type="number" id="materialCost" name="materialCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="laborCost">人工费用</label>
                <input type="number" id="laborCost" name="laborCost" step="0.01" required>
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
    
    const form = document.getElementById('cultivationForm');
    
    const taskTypeSelect = document.getElementById('taskType');
    taskTypeSelect.addEventListener('change', function() {
        const taskTypeName = this.options[this.selectedIndex].text;
        form.taskTypeName = { value: taskTypeName };
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCultivationTask(taskId);
    });
    
    if (taskId) {
        loadCultivationTaskData(taskId);
    }
}

async function saveCultivationTask(taskId) {
    try {
        const formData = new FormData(document.getElementById('cultivationForm'));
        const taskData = Object.fromEntries(formData);
        
        taskData.area = parseFloat(taskData.area);
        taskData.workersCount = parseInt(taskData.workersCount);
        taskData.materialCost = parseFloat(taskData.materialCost);
        taskData.laborCost = parseFloat(taskData.laborCost);
        taskData.totalCost = taskData.materialCost + taskData.laborCost;
        
        const taskTypeMap = {
            'weeding': '除草',
            'fertilizing': '施肥',
            'pest_control': '病虫害防治',
            'pruning': '修剪',
            'irrigation': '灌溉'
        };
        taskData.taskTypeName = taskTypeMap[taskData.taskType];
        
        if (taskId) {
            await apiService.updateCultivationTask(taskId, taskData);
            showAlert('抚育任务更新成功');
        } else {
            await apiService.createCultivationTask(taskData);
            showAlert('抚育任务创建成功');
        }
        
        closeModal();
        loadCultivationTasks();
    } catch (error) {
        console.error('保存抚育任务失败:', error);
        showAlert('保存抚育任务失败', 'error');
    }
}

async function loadCultivationTaskData(taskId) {
    try {
        const tasks = await apiService.getCultivationTasks();
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
        console.error('加载抚育任务数据失败:', error);
    }
}

async function editCultivationTask(taskId) {
    showCultivationForm(taskId);
}

async function deleteCultivationTask(taskId) {
    showConfirm('确定要删除这个抚育任务吗？', async function(result) {
        if (result) {
            try {
                // 注意：后端暂未实现删除功能，此处仅为前端完整性
                showAlert('删除功能暂未实现', 'error');
            } catch (error) {
                console.error('删除抚育任务失败:', error);
                showAlert('删除抚育任务失败', 'error');
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
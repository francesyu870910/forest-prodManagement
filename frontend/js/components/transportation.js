async function loadTransportation() {
    try {
        const records = await apiService.getTransportation();
        const tbody = document.querySelector('#transportationTable tbody');
        
        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.taskNumber}</td>
                <td>${record.vehicleNumber}</td>
                <td>${record.driverName}</td>
                <td>${record.origin}</td>
                <td>${record.destination}</td>
                <td>${record.loadVolume}</td>
                <td><span class="status-badge status-${record.status}">${getStatusText(record.status)}</span></td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="editTransportation('${record.id}')">编辑</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载运输记录失败:', error);
        showAlert('加载运输记录失败', 'error');
    }
}

function showTransportationForm(recordId = null) {
    const title = recordId ? '编辑运输记录' : '添加运输记录';
    const content = `
        <form id="transportationForm">
            <div class="form-group">
                <label for="taskNumber">任务编号</label>
                <input type="text" id="taskNumber" name="taskNumber" required>
            </div>
            <div class="form-group">
                <label for="vehicleNumber">车辆号牌</label>
                <input type="text" id="vehicleNumber" name="vehicleNumber" required>
            </div>
            <div class="form-group">
                <label for="driverName">司机姓名</label>
                <input type="text" id="driverName" name="driverName" required>
            </div>
            <div class="form-group">
                <label for="driverPhone">司机电话</label>
                <input type="tel" id="driverPhone" name="driverPhone" required>
            </div>
            <div class="form-group">
                <label for="origin">起点</label>
                <input type="text" id="origin" name="origin" required>
            </div>
            <div class="form-group">
                <label for="destination">终点</label>
                <input type="text" id="destination" name="destination" required>
            </div>
            <div class="form-group">
                <label for="distance">距离(公里)</label>
                <input type="number" id="distance" name="distance" required>
            </div>
            <div class="form-group">
                <label for="woodType">木材类型</label>
                <input type="text" id="woodType" name="woodType" required>
            </div>
            <div class="form-group">
                <label for="loadVolume">装载量(立方米)</label>
                <input type="number" id="loadVolume" name="loadVolume" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="fuelCost">燃料费用</label>
                <input type="number" id="fuelCost" name="fuelCost" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="driverWage">司机工资</label>
                <input type="number" id="driverWage" name="driverWage" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="tollFee">过路费</label>
                <input type="number" id="tollFee" name="tollFee" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="status">状态</label>
                <select id="status" name="status" required>
                    <option value="planned">已计划</option>
                    <option value="in_transit">运输中</option>
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
    
    document.getElementById('transportationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTransportation(recordId);
    });
    
    if (recordId) {
        loadTransportationData(recordId);
    }
}

async function saveTransportation(recordId) {
    try {
        const formData = new FormData(document.getElementById('transportationForm'));
        const transportData = Object.fromEntries(formData);
        
        transportData.distance = parseInt(transportData.distance);
        transportData.loadVolume = parseFloat(transportData.loadVolume);
        transportData.fuelCost = parseFloat(transportData.fuelCost);
        transportData.driverWage = parseFloat(transportData.driverWage);
        transportData.tollFee = parseFloat(transportData.tollFee);
        transportData.totalCost = transportData.fuelCost + transportData.driverWage + transportData.tollFee;
        
        if (recordId) {
            await apiService.updateTransportation(recordId, transportData);
            showAlert('运输记录更新成功');
        } else {
            await apiService.createTransportation(transportData);
            showAlert('运输记录创建成功');
        }
        
        closeModal();
        loadTransportation();
    } catch (error) {
        console.error('保存运输记录失败:', error);
        showAlert('保存运输记录失败', 'error');
    }
}

async function loadTransportationData(recordId) {
    try {
        const records = await apiService.getTransportation();
        const record = records.find(r => r.id === recordId);
        
        if (record) {
            Object.keys(record).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = record[key];
                }
            });
        }
    } catch (error) {
        console.error('加载运输记录数据失败:', error);
    }
}

async function editTransportation(recordId) {
    showTransportationForm(recordId);
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
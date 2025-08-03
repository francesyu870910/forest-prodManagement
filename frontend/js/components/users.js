async function loadUsers() {
    try {
        const users = await apiService.getUsers();
        const tbody = document.querySelector('#usersTable tbody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.department}</td>
                <td>${user.position}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="editUser('${user.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载用户数据失败:', error);
        showAlert('加载用户数据失败', 'error');
    }
}

function showUserForm(userId = null) {
    const title = userId ? '编辑用户' : '添加用户';
    const content = `
        <form id="userForm">
            <div class="form-group">
                <label for="userName">姓名</label>
                <input type="text" id="userName" name="name" required>
            </div>
            <div class="form-group">
                <label for="userEmail">邮箱</label>
                <input type="email" id="userEmail" name="email" required>
            </div>
            <div class="form-group">
                <label for="userPhone">电话</label>
                <input type="tel" id="userPhone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="userDepartment">部门</label>
                <select id="userDepartment" name="department" required>
                    <option value="">请选择部门</option>
                    <option value="造林技术部">造林技术部</option>
                    <option value="森林资源管理部">森林资源管理部</option>
                    <option value="采伐作业部">采伐作业部</option>
                    <option value="运输管理部">运输管理部</option>
                    <option value="财务成本部">财务成本部</option>
                </select>
            </div>
            <div class="form-group">
                <label for="userPosition">职位</label>
                <input type="text" id="userPosition" name="position" required>
            </div>
            <div class="form-group">
                <label for="userRole">角色</label>
                <select id="userRole" name="role" required>
                    <option value="">请选择角色</option>
                    <option value="admin">管理员</option>
                    <option value="manager">主管</option>
                    <option value="technician">技术员</option>
                    <option value="operator">作业员</option>
                    <option value="dispatcher">调度员</option>
                    <option value="accountant">会计</option>
                </select>
            </div>
            <div class="form-group">
                <label for="userWorkNumber">工号</label>
                <input type="text" id="userWorkNumber" name="workNumber" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">保存</button>
            </div>
        </form>
    `;
    
    showModal(title, content);
    
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUser(userId);
    });
    
    if (userId) {
        loadUserData(userId);
    }
}

async function loadUserData(userId) {
    try {
        const users = await apiService.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone;
            document.getElementById('userDepartment').value = user.department;
            document.getElementById('userPosition').value = user.position;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userWorkNumber').value = user.workNumber;
        }
    } catch (error) {
        console.error('加载用户数据失败:', error);
        showAlert('加载用户数据失败', 'error');
    }
}

async function saveUser(userId) {
    try {
        const formData = new FormData(document.getElementById('userForm'));
        const userData = Object.fromEntries(formData);
        
        if (userId) {
            await apiService.updateUser(userId, userData);
            showAlert('用户更新成功');
        } else {
            await apiService.createUser(userData);
            showAlert('用户创建成功');
        }
        
        closeModal();
        loadUsers();
    } catch (error) {
        console.error('保存用户失败:', error);
        showAlert('保存用户失败', 'error');
    }
}

async function editUser(userId) {
    showUserForm(userId);
}

async function deleteUser(userId) {
    showConfirm('确定要删除这个用户吗？', async function(result) {
        if (result) {
            try {
                await apiService.deleteUser(userId);
                showAlert('用户删除成功');
                loadUsers();
            } catch (error) {
                console.error('删除用户失败:', error);
                showAlert('删除用户失败', 'error');
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    
    // 更新用户信息显示
    const username = sessionStorage.getItem('username') || '管理员';
    const userSpan = document.querySelector('.user-info span');
    if (userSpan) {
        userSpan.textContent = `欢迎，${username}`;
    }
    
    // 绑定退出按钮事件
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showConfirm('确定要退出系统吗？', function(result) {
                if (result) {
                    sessionStorage.removeItem('isLoggedIn');
                    sessionStorage.removeItem('username');
                    window.location.href = 'login.html';
                }
            });
        });
    }
    
    initNavigation();
    loadDashboard();
});

window.addEventListener('error', function(e) {
    console.error('应用程序错误:', e.error);
    showAlert('系统出现错误，请稍后重试', 'error');
});
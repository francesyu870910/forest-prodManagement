function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>${title}</h3>
        ${content}
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    const activePageContent = document.querySelector('.page-content.active');
    
    if (activePageContent) {
        activePageContent.insertBefore(alertDiv, activePageContent.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// 自定义确认对话框，替换浏览器默认的confirm
function showConfirm(message, callback) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>确认操作</h3>
        <p style="margin: 20px 0; line-height: 1.5;">${message}</p>
        <div style="text-align: right; margin-top: 20px;">
            <button onclick="closeConfirm(false)" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer;">取消</button>
            <button onclick="closeConfirm(true)" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">确定</button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 保存回调函数到全局变量
    window.confirmCallback = callback;
}

function closeConfirm(result) {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    
    if (window.confirmCallback) {
        window.confirmCallback(result);
        window.confirmCallback = null;
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}
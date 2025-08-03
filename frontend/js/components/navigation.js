function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageContents = document.querySelectorAll('.page-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPage = item.getAttribute('data-page');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            pageContents.forEach(page => page.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(targetPage).classList.add('active');
            
            loadPageData(targetPage);
        });
    });
}

function loadPageData(page) {
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'planting':
            loadPlantingPlans();
            break;
        case 'cultivation':
            loadCultivationTasks();
            break;
        case 'harvesting':
            loadHarvestingTasks();
            break;
        case 'transportation':
            loadTransportation();
            break;
        case 'cost':
            loadCostAccounting();
            break;
        case 'reports':
            loadReports();
            break;
    }
}
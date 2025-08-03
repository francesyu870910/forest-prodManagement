const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    async getUsers() {
        return this.get('/users');
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async getPlantingPlans() {
        return this.get('/planting-plans');
    }

    async createPlantingPlan(planData) {
        return this.post('/planting-plans', planData);
    }

    async updatePlantingPlan(id, planData) {
        return this.put(`/planting-plans/${id}`, planData);
    }

    async deletePlantingPlan(id) {
        return this.delete(`/planting-plans/${id}`);
    }

    async getCultivationTasks() {
        return this.get('/cultivation-tasks');
    }

    async createCultivationTask(taskData) {
        return this.post('/cultivation-tasks', taskData);
    }

    async updateCultivationTask(id, taskData) {
        return this.put(`/cultivation-tasks/${id}`, taskData);
    }

    async getHarvestingTasks() {
        return this.get('/harvesting-tasks');
    }

    async createHarvestingTask(taskData) {
        return this.post('/harvesting-tasks', taskData);
    }

    async updateHarvestingTask(id, taskData) {
        return this.put(`/harvesting-tasks/${id}`, taskData);
    }

    async getTransportation() {
        return this.get('/transportation');
    }

    async createTransportation(transportData) {
        return this.post('/transportation', transportData);
    }

    async updateTransportation(id, transportData) {
        return this.put(`/transportation/${id}`, transportData);
    }

    async getCostAccounting() {
        return this.get('/cost-accounting');
    }

    async createCostAccounting(costData) {
        return this.post('/cost-accounting', costData);
    }

    async updateCostAccounting(id, costData) {
        return this.put(`/cost-accounting/${id}`, costData);
    }

    async getProductionReport() {
        return this.get('/reports/production');
    }

    async getCostReport() {
        return this.get('/reports/cost');
    }

    async getProgressReport() {
        return this.get('/reports/progress');
    }
}

const apiService = new ApiService();
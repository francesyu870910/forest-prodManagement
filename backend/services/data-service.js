const fs = require('fs').promises;
const path = require('path');

class DataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
  }

  async readJsonFile(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`读取文件失败: ${filename}`, error);
      return { error: '数据读取失败' };
    }
  }

  async writeJsonFile(filename, data) {
    try {
      const filePath = path.join(this.dataPath, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true };
    } catch (error) {
      console.error(`写入文件失败: ${filename}`, error);
      return { error: '数据保存失败' };
    }
  }

  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentTimestamp() {
    return new Date().toISOString();
  }
}

module.exports = new DataService();
const axios = require('axios');

class OdooService {
  constructor() {
    this.url = process.env.ODOO_URL;
    this.database = process.env.ODOO_DATABASE;
    this.username = process.env.ODOO_USERNAME;
    this.apiKey = process.env.ODOO_API_KEY;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async testConnection() {
    // Simple test to check if we can connect to Odoo
    try {
      if (!this.url || !this.database || !this.username || !this.apiKey) {
        throw new Error('Missing Odoo configuration. Please check ODOO_URL, ODOO_DATABASE, ODOO_USERNAME, and ODOO_API_KEY environment variables.');
      }

      // Try to get a simple list of categories as a connection test
      const response = await axios.post(`${this.url}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'product.category',
          method: 'search_read',
          args: [[], ['id', 'name']],
          kwargs: { limit: 1 }
        },
        id: Math.floor(Math.random() * 1000)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session_id=${this.apiKey}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.data.message || response.data.error.message);
      }

      return { success: true, data: response.data.result };
    } catch (error) {
      console.error('Odoo connection test failed:', error.message);
      throw error;
    }
  }

  async callOdoo(model, method, args = [], kwargs = {}) {
    try {
      if (!this.url || !this.database || !this.username || !this.apiKey) {
        throw new Error('Missing Odoo configuration. Please check environment variables.');
      }

      const response = await axios.post(`${this.url}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: model,
          method: method,
          args: args,
          kwargs: kwargs
        },
        id: Math.floor(Math.random() * 1000)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session_id=${this.apiKey}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.data?.message || response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error(`Odoo API call error (${model}.${method}):`, error.message);
      throw error;
    }
  }

  async getProducts(limit = 1000, offset = 0) {
    return await this.callOdoo('product.template', 'search_read', [
      [], // domain (empty = all products)
      ['id', 'default_code', 'name', 'categ_id', 'standard_price']
    ], {
      limit,
      offset
    });
  }

  async getCategories() {
    return await this.callOdoo('product.category', 'search_read', [
      [], // domain (empty = all categories)
      ['id', 'name', 'parent_id']
    ]);
  }

  async updateProductCost(productId, newCost) {
    return await this.callOdoo('product.template', 'write', [
      [productId], // product IDs
      { standard_price: newCost }
    ]);
  }

  async updateMultipleProductCosts(updates) {
    const promises = updates.map(update => 
      this.updateProductCost(update.productId, update.newCost)
    );
    
    return await Promise.all(promises);
  }
}

module.exports = new OdooService();
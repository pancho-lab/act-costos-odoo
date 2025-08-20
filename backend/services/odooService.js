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

  async callOdoo(model, method, args = [], kwargs = {}) {
    try {
      const response = await axios.post(`${this.url}/xmlrpc/2/object`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            this.database,
            this.username,
            this.apiKey,
            model,
            method,
            args,
            kwargs
          ]
        },
        id: Math.floor(Math.random() * 1000)
      }, {
        headers: this.getHeaders()
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
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
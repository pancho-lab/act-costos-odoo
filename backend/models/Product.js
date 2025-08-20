const db = require('../database/init');

class Product {
  static async create(productData) {
    return new Promise((resolve, reject) => {
      const { odoo_id, code, name, category_id, category_name, cost } = productData;
      
      db.run(
        `INSERT OR REPLACE INTO products (odoo_id, code, name, category_id, category_name, cost, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [odoo_id, code, name, category_id, category_name, cost],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, odoo_id });
          }
        }
      );
    });
  }

  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM products';
      let params = [];
      
      if (filters.category_id) {
        query += ' WHERE category_id = ?';
        params.push(filters.category_id);
      }
      
      query += ' ORDER BY name';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async findByOdooId(odooId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM products WHERE odoo_id = ?',
        [odooId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static async updateCost(odooId, newCost) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET cost = ?, last_updated = CURRENT_TIMESTAMP WHERE odoo_id = ?',
        [newCost, odooId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  static async updateCostsByCategory(categoryId, newCost) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET cost = ?, last_updated = CURRENT_TIMESTAMP WHERE category_id = ?',
        [newCost, categoryId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  static async getByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM products WHERE category_id = ? ORDER BY name',
        [categoryId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = Product;
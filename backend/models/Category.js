const db = require('../database/init');

class Category {
  static async create(categoryData) {
    return new Promise((resolve, reject) => {
      const { odoo_id, name, parent_id } = categoryData;
      
      db.run(
        `INSERT OR REPLACE INTO categories (odoo_id, name, parent_id, last_updated)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [odoo_id, name, parent_id],
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

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM categories ORDER BY name',
        [],
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

  static async findByOdooId(odooId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM categories WHERE odoo_id = ?',
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

  static async getWithProductCounts() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.*,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.odoo_id = p.category_id
        GROUP BY c.id, c.odoo_id, c.name, c.parent_id
        ORDER BY c.name
      `, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Category;
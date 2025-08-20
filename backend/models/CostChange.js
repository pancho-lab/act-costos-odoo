const db = require('../database/init');

class CostChange {
  static async create(changeData) {
    return new Promise((resolve, reject) => {
      const { 
        product_odoo_id, 
        product_name, 
        old_cost, 
        new_cost, 
        change_type, 
        category_id, 
        category_name 
      } = changeData;
      
      db.run(
        `INSERT INTO cost_changes 
         (product_odoo_id, product_name, old_cost, new_cost, change_type, category_id, category_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product_odoo_id, product_name, old_cost, new_cost, change_type, category_id, category_name],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }

  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT cc.*, p.name as current_product_name, p.cost as current_cost
        FROM cost_changes cc
        LEFT JOIN products p ON cc.product_odoo_id = p.odoo_id
      `;
      let params = [];
      let conditions = [];
      
      if (filters.synced !== undefined) {
        conditions.push('cc.synced_to_odoo = ?');
        params.push(filters.synced ? 1 : 0);
      }
      
      if (filters.category_id) {
        conditions.push('cc.category_id = ?');
        params.push(filters.category_id);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY cc.created_at DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async markAsSynced(ids) {
    return new Promise((resolve, reject) => {
      const placeholders = ids.map(() => '?').join(',');
      const params = [...ids, new Date().toISOString()];
      
      db.run(
        `UPDATE cost_changes 
         SET synced_to_odoo = 1, synced_at = ?
         WHERE id IN (${placeholders})`,
        params,
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

  static async getPendingSync() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM cost_changes WHERE synced_to_odoo = 0 ORDER BY created_at',
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
}

module.exports = CostChange;
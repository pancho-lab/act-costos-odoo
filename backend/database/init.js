const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'costos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initTables();
  }
});

function initTables() {
  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      odoo_id INTEGER UNIQUE NOT NULL,
      code TEXT,
      name TEXT NOT NULL,
      category_id INTEGER,
      category_name TEXT,
      cost DECIMAL(10,2) NOT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (odoo_id)
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      odoo_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      parent_id INTEGER,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Changes log table
  db.run(`
    CREATE TABLE IF NOT EXISTS cost_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_odoo_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      old_cost DECIMAL(10,2),
      new_cost DECIMAL(10,2) NOT NULL,
      change_type TEXT CHECK(change_type IN ('manual', 'bulk_category')) NOT NULL,
      category_id INTEGER,
      category_name TEXT,
      synced_to_odoo BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME,
      FOREIGN KEY (product_odoo_id) REFERENCES products (odoo_id)
    )
  `);

  console.log('Database tables initialized');
}

module.exports = db;
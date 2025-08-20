const express = require('express');
const router = express.Router();
const odooService = require('../services/odooService');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Sync products from Odoo
router.post('/sync/products', async (req, res) => {
  try {
    console.log('Starting product sync from Odoo...');
    
    const odooProducts = await odooService.getProducts();
    console.log(`Found ${odooProducts.length} products in Odoo`);
    
    let syncedCount = 0;
    
    for (const product of odooProducts) {
      const productData = {
        odoo_id: product.id,
        code: product.default_code || '',
        name: product.name,
        category_id: product.categ_id ? product.categ_id[0] : null,
        category_name: product.categ_id ? product.categ_id[1] : 'Sin categoría',
        cost: parseFloat(product.standard_price) || 0
      };
      
      await Product.create(productData);
      syncedCount++;
    }
    
    console.log(`Synced ${syncedCount} products`);
    res.json({ 
      success: true, 
      message: `Synced ${syncedCount} products from Odoo`,
      total: odooProducts.length
    });
    
  } catch (error) {
    console.error('Error syncing products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error syncing products from Odoo',
      error: error.message 
    });
  }
});

// Sync categories from Odoo
router.post('/sync/categories', async (req, res) => {
  try {
    console.log('Starting category sync from Odoo...');
    
    const odooCategories = await odooService.getCategories();
    console.log(`Found ${odooCategories.length} categories in Odoo`);
    
    let syncedCount = 0;
    
    for (const category of odooCategories) {
      const categoryData = {
        odoo_id: category.id,
        name: category.name,
        parent_id: category.parent_id ? category.parent_id[0] : null
      };
      
      await Category.create(categoryData);
      syncedCount++;
    }
    
    console.log(`Synced ${syncedCount} categories`);
    res.json({ 
      success: true, 
      message: `Synced ${syncedCount} categories from Odoo`,
      total: odooCategories.length
    });
    
  } catch (error) {
    console.error('Error syncing categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error syncing categories from Odoo',
      error: error.message 
    });
  }
});

// Test Odoo connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await odooService.testConnection();
    res.json({ 
      success: true, 
      message: 'Connection to Odoo successful',
      data: result.data
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to Odoo',
      error: error.message 
    });
  }
});

module.exports = router;
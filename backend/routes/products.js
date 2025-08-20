const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const CostChange = require('../models/CostChange');

// Get all products with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    const filters = {};
    
    if (category_id) {
      filters.category_id = parseInt(category_id);
    }
    
    const products = await Product.findAll(filters);
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.getByCategory(parseInt(categoryId));
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products by category',
      error: error.message
    });
  }
});

// Update single product cost
router.put('/:odooId/cost', async (req, res) => {
  try {
    const { odooId } = req.params;
    const { newCost } = req.body;
    
    if (!newCost || newCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid cost is required'
      });
    }
    
    // Get current product info
    const product = await Product.findByOdooId(parseInt(odooId));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update product cost
    await Product.updateCost(parseInt(odooId), parseFloat(newCost));
    
    // Log the change
    await CostChange.create({
      product_odoo_id: parseInt(odooId),
      product_name: product.name,
      old_cost: product.cost,
      new_cost: parseFloat(newCost),
      change_type: 'manual',
      category_id: product.category_id,
      category_name: product.category_name
    });
    
    res.json({
      success: true,
      message: 'Product cost updated successfully'
    });
  } catch (error) {
    console.error('Error updating product cost:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product cost',
      error: error.message
    });
  }
});

// Update all products in a category
router.put('/category/:categoryId/cost', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { newCost } = req.body;
    
    if (!newCost || newCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid cost is required'
      });
    }
    
    // Get products in category before update
    const products = await Product.getByCategory(parseInt(categoryId));
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found in this category'
      });
    }
    
    // Update all products in category
    const result = await Product.updateCostsByCategory(parseInt(categoryId), parseFloat(newCost));
    
    // Log changes for each product
    for (const product of products) {
      await CostChange.create({
        product_odoo_id: product.odoo_id,
        product_name: product.name,
        old_cost: product.cost,
        new_cost: parseFloat(newCost),
        change_type: 'bulk_category',
        category_id: parseInt(categoryId),
        category_name: product.category_name
      });
    }
    
    res.json({
      success: true,
      message: `Updated cost for ${result.changes} products in category`,
      updatedCount: result.changes
    });
  } catch (error) {
    console.error('Error updating category costs:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category costs',
      error: error.message
    });
  }
});

module.exports = router;
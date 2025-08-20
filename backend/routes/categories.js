const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error.message
    });
  }
});

// Get categories with product counts
router.get('/with-counts', async (req, res) => {
  try {
    const categories = await Category.getWithProductCounts();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories with counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories with product counts',
      error: error.message
    });
  }
});

// Get single category
router.get('/:odooId', async (req, res) => {
  try {
    const { odooId } = req.params;
    const category = await Category.findByOdooId(parseInt(odooId));
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving category',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const CostChange = require('../models/CostChange');
const odooService = require('../services/odooService');

// Get all cost changes
router.get('/', async (req, res) => {
  try {
    const { synced, category_id } = req.query;
    const filters = {};
    
    if (synced !== undefined) {
      filters.synced = synced === 'true';
    }
    
    if (category_id) {
      filters.category_id = parseInt(category_id);
    }
    
    const changes = await CostChange.findAll(filters);
    res.json({
      success: true,
      data: changes
    });
  } catch (error) {
    console.error('Error getting cost changes:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cost changes',
      error: error.message
    });
  }
});

// Get pending changes to sync
router.get('/pending-sync', async (req, res) => {
  try {
    const pendingChanges = await CostChange.getPendingSync();
    res.json({
      success: true,
      data: pendingChanges,
      count: pendingChanges.length
    });
  } catch (error) {
    console.error('Error getting pending changes:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending changes',
      error: error.message
    });
  }
});

// Sync changes to Odoo
router.post('/sync-to-odoo', async (req, res) => {
  try {
    const pendingChanges = await CostChange.getPendingSync();
    
    if (pendingChanges.length === 0) {
      return res.json({
        success: true,
        message: 'No pending changes to sync',
        syncedCount: 0
      });
    }
    
    console.log(`Starting sync of ${pendingChanges.length} changes to Odoo...`);
    
    const updates = pendingChanges.map(change => ({
      productId: change.product_odoo_id,
      newCost: change.new_cost
    }));
    
    // Update costs in Odoo
    await odooService.updateMultipleProductCosts(updates);
    
    // Mark changes as synced
    const changeIds = pendingChanges.map(change => change.id);
    await CostChange.markAsSynced(changeIds);
    
    console.log(`Successfully synced ${pendingChanges.length} changes to Odoo`);
    
    res.json({
      success: true,
      message: `Successfully synced ${pendingChanges.length} cost changes to Odoo`,
      syncedCount: pendingChanges.length
    });
    
  } catch (error) {
    console.error('Error syncing changes to Odoo:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing changes to Odoo',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

// Get all channels
router.get('/', channelController.getAllChannels);

// Get a single channel by ID
router.get('/:id', channelController.getChannelById);

// Create a new channel
router.post('/', channelController.createChannel);

// Update a channel
router.put('/:id', channelController.updateChannel);

// Delete a channel
router.delete('/:id', channelController.deleteChannel);

// Regenerate API key for a channel
router.post('/:id/regenerate-api-key', channelController.regenerateApiKey);

module.exports = router;
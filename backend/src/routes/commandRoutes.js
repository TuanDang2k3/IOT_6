const express = require('express');
const router = express.Router();
const commandController = require('../controllers/commandController');

// Get all commands
router.get('/', commandController.getAllCommands);

// Get a single command by ID
router.get('/:id', commandController.getCommandById);

// Get pending commands for a device by MAC address
router.get('/device/:macAddress/pending', commandController.getPendingCommandsByMac);

// Create a new command
router.post('/', commandController.createCommand);

// Update command status
router.put('/:id/status', commandController.updateCommandStatus);

// Delete a command
router.delete('/:id', commandController.deleteCommand);

module.exports = router;
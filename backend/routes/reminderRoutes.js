import express from 'express';
import mongoose from 'mongoose';
import { Reminder } from '../models/reminderModel.js'; // Use named import
import { Log } from '../models/logModel.js';
import { apiLimiter } from '../rateLimiter.js'; 

const router = express.Router();

// Create a new reminder
router.post('/', async (request, response) => {
  try {
    // Extract fields from request body
    const { title, description, dueDate, itemId, itemName, priority, status, user, actionType } = request.body;

    console.log('Received reminder data:', request.body);

    // Validate required fields
    if (!title || !dueDate) {
      return response.status(400).json({ message: 'Title and due date are required fields' });
    }

    // Create a new reminder with all possible fields from the model
    const newReminder = {
      title,
      description: description || '',
      dueDate,
      itemId: itemId || null,
      itemName: itemName || '',
      priority: priority || 'Medium',
      status: status || 'Pending',
      user: user || request.headers['x-user-name'] || 'DemoAdmin'
    };

    console.log('Creating reminder with data:', newReminder);

    // Create the reminder
    const reminder = await Reminder.create(newReminder);

    // Log the activity if Log model is available
    try {
      const username = request.headers['x-user-name'] || 'DemoAdmin';
      await Log.create({
        logType: 'reminder',
        username: username,
        user: username, // Make sure user field is populated correctly
        action: 'create', // Changed from 'update' to 'create'
        details: `${username} added a reminder "${title}"`,
        timestamp: new Date(),
      });
    } catch (logError) {
      console.error('Error logging reminder creation:', logError);
    }

    return response.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    response.status(500).json({ message: 'Error creating reminder', error: error.message });
  }
});

// Get all reminders
router.get('/', async (request, response) => {
  try {
    const reminders = await Reminder.find({}).sort({ dueDate: 1 });
    return response.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    response.status(500).json({ message: 'Error fetching reminders' });
  }
});

// Delete a reminder
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { actionType } = request.body || {};

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ message: 'Invalid reminder ID' });
    }

    // Find the reminder before deleting for logging
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return response.status(404).json({ message: 'Reminder not found' });
    }

    // Delete the reminder
    await Reminder.findByIdAndDelete(id);

    // Log the activity
    const username = request.headers['x-user-name'] || 'DemoAdmin'; // Changed from 'Anonymous' to 'DemoAdmin'
    await Log.create({
      logType: 'reminder',
      username: username,
      user: username, // Make sure user field is populated correctly
      action: 'delete', // Changed from 'update' to 'delete'
      details: `${username} deleted reminder "${reminder.title}"`,
      timestamp: new Date(),
    });

    return response.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    response.status(500).json({ message: 'Error deleting reminder', error: error.toString() });
  }
});

export default router;

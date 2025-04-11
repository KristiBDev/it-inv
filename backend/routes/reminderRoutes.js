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
    const { title, description, dueDate, itemId, actionType } = request.body;

    // Validate required fields
    if (!title || !dueDate) {
      return response.status(400).json({ message: 'Title and due date are required fields' });
    }

    // Create a new reminder
    const newReminder = {
      title,
      description,
      dueDate,
      itemId: itemId || null,
    };

    const reminder = await Reminder.create(newReminder);

    // Log the activity
    const username = request.headers['x-user-name'] || 'Anonymous';
    await Log.create({
      username,
      action: 'create_reminder',
      itemId: itemId || 'N/A',
      details: `Created reminder "${title}"`,
      timestamp: new Date(),
    });

    return response.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    response.status(500).json({ message: 'Error creating reminder' });
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
    const username = request.headers['x-user-name'] || 'Anonymous';
    await Log.create({
      username,
      action: 'delete_reminder',
      itemId: reminder.itemId || 'N/A',
      details: `Deleted reminder "${reminder.title}"`,
      timestamp: new Date(),
    });

    return response.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    response.status(500).json({ message: 'Error deleting reminder' });
  }
});

export default router;

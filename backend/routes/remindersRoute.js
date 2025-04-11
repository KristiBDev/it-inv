import express from "express";
import { Reminder } from "../models/reminderModel.js";
import { Item } from "../models/itemModel.js";
import { apiLimiter, getLimiter } from "../rateLimiter.js";
import { createReminderLog, updateReminderLog, deleteReminderLog, checkOverdueReminders } from "../utils/reminderUtils.js";

const router = express.Router();

// Get all reminders with optional filtering
router.get("/", getLimiter, async (request, response) => {
    try {
        const { status, priority, itemId, upcoming } = request.query;
        const filter = {};
        
        // Apply filters if provided
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (itemId) filter.itemId = itemId;
        
        // For upcoming reminders (next 7 days)
        if (upcoming === 'true') {
            const now = new Date();
            const sevenDaysLater = new Date();
            sevenDaysLater.setDate(now.getDate() + 7);
            filter.dueDate = { $gte: now, $lte: sevenDaysLater };
            filter.status = { $ne: 'Completed' }; // Exclude completed reminders
        }
        
        // Update any overdue reminders before serving the request
        await checkOverdueReminders();
        
        // Get reminders, sorted by due date (ascending)
        const reminders = await Reminder.find(filter).sort({ dueDate: 1 });
        
        return response.status(200).json({
            count: reminders.length,
            data: reminders,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Get reminders for a specific item
router.get("/item/:itemId", getLimiter, async (request, response) => {
    try {
        const { itemId } = request.params;
        const reminders = await Reminder.find({ itemId }).sort({ dueDate: 1 });
        
        return response.status(200).json({
            count: reminders.length,
            data: reminders,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Create a new reminder
router.post("/", apiLimiter, async (request, response) => {
    try {
        // Validate required fields
        if (!request.body.title || !request.body.dueDate) {
            return response.status(400).send({ message: "Title and due date are required" });
        }
        
        const reminderData = {
            title: request.body.title,
            description: request.body.description || '',
            dueDate: new Date(request.body.dueDate),
            priority: request.body.priority || 'Medium',
            status: request.body.status || 'Pending',
            user: request.body.user || 'DemoAdmin',
        };
        
        // If itemId is provided, verify item exists and attach reminder to it
        if (request.body.itemId) {
            const item = await Item.findOne({ customId: request.body.itemId });
            if (!item) {
                return response.status(404).send({ message: "Item not found" });
            }
            reminderData.itemId = request.body.itemId;
            reminderData.itemName = item.title;
        }
        
        // Create the reminder
        const reminder = await Reminder.create(reminderData);
        
        // Create a log entry
        await createReminderLog(reminder, reminderData.user);
        
        return response.status(201).json(reminder);
    } catch (error) {
        console.error("Error creating reminder:", error);
        return response.status(500).send({ message: error.message });
    }
});

// Update a reminder
router.put("/:id", apiLimiter, async (request, response) => {
    try {
        const { id } = request.params;
        const { user = "DemoAdmin" } = request.body;
        
        // Find the original reminder
        const oldReminder = await Reminder.findById(id);
        if (!oldReminder) {
            return response.status(404).send({ message: "Reminder not found" });
        }
        
        // Prepare update data
        const updateData = {};
        if (request.body.title !== undefined) updateData.title = request.body.title;
        if (request.body.description !== undefined) updateData.description = request.body.description;
        if (request.body.dueDate !== undefined) updateData.dueDate = new Date(request.body.dueDate);
        if (request.body.priority !== undefined) updateData.priority = request.body.priority;
        if (request.body.status !== undefined) updateData.status = request.body.status;
        
        // Update the reminder
        const reminder = await Reminder.findByIdAndUpdate(id, updateData, { new: true });
        
        // Create a log entry
        await updateReminderLog(reminder, oldReminder, user);
        
        return response.status(200).json(reminder);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Mark a reminder as completed
router.patch("/:id/complete", apiLimiter, async (request, response) => {
    try {
        const { id } = request.params;
        const { user = "DemoAdmin" } = request.body;
        
        // Find the original reminder
        const oldReminder = await Reminder.findById(id);
        if (!oldReminder) {
            return response.status(404).send({ message: "Reminder not found" });
        }
        
        // Update to completed
        const reminder = await Reminder.findByIdAndUpdate(id, 
            { status: 'Completed' }, 
            { new: true }
        );
        
        // Create a log entry
        await updateReminderLog(reminder, oldReminder, user);
        
        return response.status(200).json(reminder);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Delete a reminder
router.delete("/:id", apiLimiter, async (request, response) => {
    try {
        const { id } = request.params;
        const { user = "DemoAdmin" } = request.body;
        
        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return response.status(404).send({ message: "Reminder not found" });
        }
        
        // Delete the reminder
        await Reminder.findByIdAndDelete(id);
        
        // Create a log entry
        await deleteReminderLog(reminder, user);
        
        return response.status(200).send({ message: "Reminder deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Utility route to delete all reminders without environment checks
router.delete("/util/deleteAll", async (request, response) => {
    try {
        const result = await Reminder.deleteMany({});
        
        return response.status(200).json({
            message: "All reminders deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error deleting reminders:", error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;

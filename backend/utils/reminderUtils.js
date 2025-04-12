import { Log } from "../models/logModel.js";
import { Reminder } from "../models/reminderModel.js";
import { Item } from "../models/itemModel.js";

// Create log entry for reminder creation
export const createReminderLog = async (reminder, user = "DemoAdmin") => {
    try {
        let details = `${user} added a reminder "${reminder.title}"`;
        
        // Only add item reference if this reminder is connected to an actual item
        if (reminder.itemId && reminder.itemId !== 'standalone') {
            details += ` for item ${reminder.itemName} (${reminder.itemId})`;
            
            await Log.create({
                logType: 'reminder',
                itemId: reminder.itemId,
                itemName: reminder.itemName,
                action: 'create', // Changed from 'update' to 'create'
                user,
                details,
                changes: {
                    reminder: { added: `${reminder.title} - Due: ${new Date(reminder.dueDate).toLocaleDateString()}` }
                },
            });
        } else {
            // For standalone reminders, don't include itemId or itemName
            await Log.create({
                logType: 'reminder',
                action: 'create', // Changed from 'update' to 'create'
                user,
                details,
                changes: {
                    reminder: { added: `${reminder.title} - Due: ${new Date(reminder.dueDate).toLocaleDateString()}` }
                },
            });
        }
    } catch (error) {
        console.error("Error creating reminder log:", error);
    }
};

// Create log entry for reminder update
export const updateReminderLog = async (reminder, oldReminder, user = "DemoAdmin") => {
    try {
        // Track what fields were changed
        const changes = {};
        
        if (oldReminder.title !== reminder.title) 
            changes.title = { from: oldReminder.title, to: reminder.title };
        if (oldReminder.description !== reminder.description) 
            changes.description = { from: oldReminder.description, to: reminder.description };
        if (oldReminder.dueDate.toISOString() !== reminder.dueDate.toISOString()) 
            changes.dueDate = { 
                from: new Date(oldReminder.dueDate).toLocaleDateString(), 
                to: new Date(reminder.dueDate).toLocaleDateString() 
            };
        if (oldReminder.priority !== reminder.priority) 
            changes.priority = { from: oldReminder.priority, to: reminder.priority };
        if (oldReminder.status !== reminder.status) 
            changes.status = { from: oldReminder.status, to: reminder.status };

        // Create description text
        let details = `${user} updated reminder "${reminder.title}"`;
        
        // Only include item reference if reminder is connected to an item
        if (reminder.itemId && reminder.itemId !== 'standalone') {
            details += ` for item ${reminder.itemName} (${reminder.itemId})`;
            
            await Log.create({
                logType: 'reminder',
                itemId: reminder.itemId,
                itemName: reminder.itemName,
                action: 'update',
                user,
                details,
                changes,
            });
        } else {
            // For standalone reminders
            await Log.create({
                logType: 'reminder',
                action: 'update',
                user,
                details,
                changes,
            });
        }
    } catch (error) {
        console.error("Error creating reminder update log:", error);
    }
};

// Create log entry for reminder deletion
export const deleteReminderLog = async (reminder, user = "DemoAdmin") => {
    try {
        let details = `${user} deleted reminder "${reminder.title}"`;
        
        // Only include item reference if reminder is connected to an item
        if (reminder.itemId && reminder.itemId !== 'standalone') {
            details += ` for item ${reminder.itemName} (${reminder.itemId})`;
            
            await Log.create({
                logType: 'reminder',
                itemId: reminder.itemId,
                itemName: reminder.itemName,
                action: 'delete', // Changed from 'update' to 'delete'
                user,
                details,
                changes: {
                    reminder: { removed: `${reminder.title} - Due: ${new Date(reminder.dueDate).toLocaleDateString()}` }
                },
            });
        } else {
            // For standalone reminders
            await Log.create({
                logType: 'reminder',
                action: 'delete', // Changed from 'update' to 'delete'
                user,
                details,
                changes: {
                    reminder: { removed: `${reminder.title} - Due: ${new Date(reminder.dueDate).toLocaleDateString()}` }
                },
            });
        }
    } catch (error) {
        console.error("Error creating reminder deletion log:", error);
    }
};

// Check for overdue reminders and update their status
export const checkOverdueReminders = async () => {
    const now = new Date();
    try {
        const result = await Reminder.updateMany(
            { dueDate: { $lt: now }, status: 'Pending' },
            { $set: { status: 'Overdue' } }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} reminders to Overdue status`);
        }
        
        return result.modifiedCount;
    } catch (error) {
        console.error("Error checking overdue reminders:", error);
        return 0;
    }
};

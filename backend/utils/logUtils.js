import { Log } from "../models/logModel.js";

// Create log entry for item creation
export const createItemLog = async (item, user = "DemoAdmin") => {
    try {
        await Log.create({
            itemId: item.customId,
            itemName: item.title,
            action: 'create',
            user,
            details: `User ${user} created item ${item.title} (${item.customId})`,
        });
    } catch (error) {
        console.error("Error creating log:", error);
    }
};

// Create log entry for item update
export const updateItemLog = async (item, oldItem, user = "DemoAdmin") => {
    try {
        // Track what fields were changed
        const changes = {};
        if (oldItem.title !== item.title) changes.title = { from: oldItem.title, to: item.title };
        if (oldItem.category !== item.category) changes.category = { from: oldItem.category, to: item.category };
        if (oldItem.status !== item.status) changes.status = { from: oldItem.status, to: item.status };
        if (oldItem.department !== item.department) changes.department = { from: oldItem.department, to: item.department };
        
        // Create change description
        const changeDescriptions = Object.keys(changes).map(field => 
            `${field} changed from "${changes[field].from}" to "${changes[field].to}"`
        );
        
        await Log.create({
            itemId: item.customId,
            itemName: item.title,
            action: 'update',
            user,
            details: `User ${user} updated item ${item.title} (${item.customId}): ${changeDescriptions.join(", ")}`,
            changes,
        });
    } catch (error) {
        console.error("Error creating update log:", error);
    }
};

// Create log entry for item deletion
export const deleteItemLog = async (item, user = "DemoAdmin") => {
    try {
        await Log.create({
            itemId: item.customId,
            itemName: item.title,
            action: 'delete',
            user,
            details: `User ${user} deleted item ${item.title} (${item.customId})`,
        });
    } catch (error) {
        console.error("Error creating delete log:", error);
    }
};

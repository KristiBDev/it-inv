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
        
        // Check basic fields
        if (oldItem.title !== item.title) changes.title = { from: oldItem.title || 'N/A', to: item.title || 'N/A' };
        if (oldItem.category !== item.category) changes.category = { from: oldItem.category || 'N/A', to: item.category || 'N/A' };
        if (oldItem.status !== item.status) changes.status = { from: oldItem.status || 'N/A', to: item.status || 'N/A' };
        if (oldItem.department !== item.department) changes.department = { from: oldItem.department || 'N/A', to: item.department || 'N/A' };
        
        // Check additional fields
        if (oldItem.description !== item.description) 
            changes.description = { 
                from: oldItem.description || 'Not set', 
                to: item.description || 'Not set' 
            };
        if (oldItem.location !== item.location) 
            changes.location = { 
                from: oldItem.location || 'Not set', 
                to: item.location || 'Not set' 
            };
        if (String(oldItem.purchaseDate) !== String(item.purchaseDate)) 
            changes.purchaseDate = { 
                from: oldItem.purchaseDate ? new Date(oldItem.purchaseDate).toLocaleDateString() : 'Not set', 
                to: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'Not set' 
            };
        if (oldItem.purchasePrice !== item.purchasePrice) 
            changes.purchasePrice = { 
                from: oldItem.purchasePrice !== undefined ? oldItem.purchasePrice : 'Not set', 
                to: item.purchasePrice !== undefined ? item.purchasePrice : 'Not set' 
            };
        if (oldItem.manufacturer !== item.manufacturer) 
            changes.manufacturer = { 
                from: oldItem.manufacturer || 'Not set', 
                to: item.manufacturer || 'Not set' 
            };
        if (oldItem.model !== item.model) 
            changes.model = { 
                from: oldItem.model || 'Not set', 
                to: item.model || 'Not set' 
            };
        if (oldItem.serialNumber !== item.serialNumber) 
            changes.serialNumber = { 
                from: oldItem.serialNumber || 'Not set', 
                to: item.serialNumber || 'Not set' 
            };
        if (oldItem.notes !== item.notes) 
            changes.notes = { 
                from: oldItem.notes || 'Not set', 
                to: item.notes || 'Not set' 
            };
        if (oldItem.item_user !== item.item_user) 
            changes.item_user = { 
                from: oldItem.item_user || 'Not set', 
                to: item.item_user || 'Not set' 
            };
        
        // Create change description for the most important fields
        const primaryChanges = Object.entries(changes)
            .filter(([field]) => ['title', 'category', 'status', 'department'].includes(field))
            .map(([field, change]) => `${field} changed from "${change.from}" to "${change.to}"`);
        
        const changeCount = Object.keys(changes).length;
        const otherChangesCount = changeCount - primaryChanges.length;
        let changeDescription = primaryChanges.join(", ");
        
        if (otherChangesCount > 0) {
            changeDescription += ` and ${otherChangesCount} other field${otherChangesCount > 1 ? 's' : ''}`;
        }
        
        await Log.create({
            itemId: item.customId,
            itemName: item.title,
            action: 'update',
            user,
            details: `User ${user} updated item ${item.title} (${item.customId}): ${changeDescription || 'Minor updates'}`,
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

// Create log entry for note creation
export const createNoteLog = async (item, note, user = "DemoAdmin") => {
    try {
        await Log.create({
            itemId: item.customId,
            itemName: item.title,
            action: 'update',
            user,
            details: `User ${user} added a note to item ${item.title} (${item.customId}): "${note.content}"`,
            changes: {
                note: { added: note.content }
            },
        });
    } catch (error) {
        console.error("Error creating note log:", error);
    }
};

// Create log entry for note deletion
export const deleteNoteLog = async (item, note, user = "DemoAdmin") => {
    try {
        await Log.create({
            itemId: item.customId,
            itemName: item.title,
            action: 'update',
            user,
            details: `User ${user} deleted a note from item ${item.title} (${item.customId})`,
            changes: {
                note: { removed: note.content }
            },
        });
    } catch (error) {
        console.error("Error creating note deletion log:", error);
    }
};

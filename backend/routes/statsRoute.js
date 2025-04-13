import express from "express";
import { Reminder } from "../models/reminderModel.js";
import { Item } from "../models/itemModel.js";
import { getLimiter } from "../rateLimiter.js";
import { checkOverdueReminders } from "../utils/reminderUtils.js";

const router = express.Router();

// Get dashboard stats
router.get("/dashboard", getLimiter, async (request, response) => {
    try {
        // Update any overdue reminders first
        await checkOverdueReminders();
        
        // Get reminder stats
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const overdueCount = await Reminder.countDocuments({
            status: 'Overdue'
        });
        
        const thisMonthCount = await Reminder.countDocuments({
            dueDate: { $gt: now, $lte: endOfMonth },
            status: { $ne: 'Completed' }
        });
        
        // Get item stats
        const totalItems = await Item.countDocuments({});
        const maintenanceItems = await Item.countDocuments({ status: 'Maintenance' });
        
        return response.status(200).json({
            reminders: {
                overdue: overdueCount,
                thisMonth: thisMonthCount
            },
            items: {
                total: totalItems,
                maintenance: maintenanceItems
            }
        });
    } catch (error) {
        console.error("Error getting dashboard stats:", error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;

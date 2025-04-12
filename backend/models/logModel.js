import mongoose from "mongoose";

const logSchema = mongoose.Schema(
    {
        itemId: {
            type: String,
            required: true,
        },
        itemName: {
            type: String,
            // Changed from required:true to have a default value for standalone reminders
            default: 'N/A',
        },
        action: {
            type: String,
            required: true,
            enum: ['create', 'update', 'delete'],
        },
        user: {
            type: String,
            default: 'DemoAdmin',
        },
        details: {
            type: String,
            required: true,
        },
        changes: {
            type: Object,
            default: {},
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const Log = mongoose.model("Log", logSchema);

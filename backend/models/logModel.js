import mongoose from "mongoose";

const logSchema = mongoose.Schema(
    {
        logType: {
            type: String,
            enum: ['item', 'reminder'],
            default: 'item'
        },
        itemId: {
            type: String,
            required: function() {
                // Only require itemId for item logs, not for reminder logs
                return this.logType === 'item';
            }
        },
        itemName: {
            type: String,
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

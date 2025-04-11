import mongoose from "mongoose";

const reminderSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        itemId: {
            type: String,
            default: null, // null for standalone reminders
        },
        itemName: {
            type: String,
            default: '',
        },
        dueDate: {
            type: Date,
            required: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Overdue'],
            default: 'Pending',
        },
        user: {
            type: String,
            default: 'DemoAdmin',
        },
        notificationSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to automatically set status based on due date
reminderSchema.pre("save", function (next) {
    const now = new Date();
    if (this.status !== 'Completed') {
        // If due date has passed and status is not completed, set to overdue
        if (this.dueDate < now) {
            this.status = 'Overdue';
        } else {
            this.status = 'Pending';
        }
    }
    next();
});

// Export as a named export instead of default export
export const Reminder = mongoose.model("Reminder", reminderSchema, "reminders");

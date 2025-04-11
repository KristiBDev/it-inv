import React, { useState, useEffect } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const ReminderList = ({ reminders, isLoading, onComplete, onDelete }) => {
  // Group reminders by status
  const [groupedReminders, setGroupedReminders] = useState({
    overdue: [],
    today: [],
    upcoming: [],
    completed: []
  });

  useEffect(() => {
    if (!reminders) return;

    const grouped = {
      overdue: [],
      today: [],
      upcoming: [],
      completed: []
    };

    reminders.forEach(reminder => {
      const dueDate = new Date(reminder.dueDate);
      
      if (reminder.status === 'Completed') {
        grouped.completed.push(reminder);
      } else if (reminder.status === 'Overdue' || (isPast(dueDate) && !isToday(dueDate))) {
        grouped.overdue.push(reminder);
      } else if (isToday(dueDate)) {
        grouped.today.push(reminder);
      } else {
        grouped.upcoming.push(reminder);
      }
    });

    setGroupedReminders(grouped);
  }, [reminders]);

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const classes = {
      Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`text-xs px-2.5 py-0.5 rounded ${classes[priority] || classes.Medium}`}>
        {priority}
      </span>
    );
  };

  // Status icon component
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'Completed':
        return <FaCheckCircle className="text-green-500" title="Completed" />;
      case 'Overdue':
        return <FaExclamationTriangle className="text-red-500" title="Overdue" />;
      default:
        return <FaClock className="text-blue-500" title="Pending" />;
    }
  };

  const ReminderGroup = ({ title, reminders, icon }) => {
    if (!reminders.length) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          {icon} {title} <span className="text-sm text-gray-500">({reminders.length})</span>
        </h3>
        <div className="space-y-2">
          {reminders.map(reminder => (
            <div 
              key={reminder._id} 
              className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex justify-between">
                <div className="flex items-start gap-2">
                  <StatusIcon status={reminder.status} />
                  <div>
                    <h4 className="font-medium">{reminder.title}</h4>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <PriorityBadge priority={reminder.priority} />
                      <span className="text-xs text-gray-500">
                        Due: {format(new Date(reminder.dueDate), 'MMM d, yyyy')}
                      </span>
                      {reminder.itemId && (
                        <Link 
                          to={`/inventory/${reminder.itemId}`} 
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {reminder.itemName}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {reminder.status !== 'Completed' && (
                    <button
                      onClick={() => onComplete(reminder._id)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Mark as completed"
                    >
                      <FaCheckCircle />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(reminder._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete reminder"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!reminders || reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reminders found</p>
      </div>
    );
  }

  return (
    <div className="reminder-list">
      <ReminderGroup 
        title="Overdue" 
        reminders={groupedReminders.overdue}
        icon={<FaExclamationTriangle className="text-red-500" />} 
      />
      <ReminderGroup 
        title="Due Today" 
        reminders={groupedReminders.today}
        icon={<FaClock className="text-yellow-500" />} 
      />
      <ReminderGroup 
        title="Upcoming" 
        reminders={groupedReminders.upcoming}
        icon={<FaClock className="text-blue-500" />} 
      />
      <ReminderGroup 
        title="Completed" 
        reminders={groupedReminders.completed}
        icon={<FaCheckCircle className="text-green-500" />} 
      />
    </div>
  );
};

export default ReminderList;

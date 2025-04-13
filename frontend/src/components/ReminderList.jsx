import React, { useState, useEffect } from 'react';
import { isPast, isToday, isThisMonth } from 'date-fns';
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaTrash, FaEye, FaLink, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

// Export stats object without initial values
export const homePageStats = {
  overdue: undefined,
  thisMonth: undefined
};

const ReminderList = ({ reminders, isLoading, onComplete, onDelete, onView, isNightMode }) => {
  // Group reminders by status
  const [groupedReminders, setGroupedReminders] = useState({
    overdue: [],
    today: [],
    thisMonth: [],
    upcoming: [],
    completed: []
  });

  useEffect(() => {
    if (!reminders) return;

    const grouped = {
      overdue: [],
      today: [],
      thisMonth: [],
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
      } else if (isThisMonth(dueDate) && !isToday(dueDate)) {
        // Add to "Due this month" category if it's due this month but not today
        grouped.thisMonth.push(reminder);
      } else {
        grouped.upcoming.push(reminder);
      }
    });

    setGroupedReminders(grouped);
    
    // Update the homePageStats directly from grouped reminders
    homePageStats.overdue = grouped.overdue.length;
    homePageStats.thisMonth = grouped.thisMonth.length;
    
    console.log("Updated homePageStats in ReminderList:", homePageStats);
    
  }, [reminders]);

  // Get status icon for a reminder
  const getStatusIcon = (reminder) => {
    const dueDate = new Date(reminder.dueDate);
    const today = new Date();
    
    if (reminder.status === 'Completed') {
      return <FaCheckCircle className="text-green-500" size={14} title="Completed" />;
    } else if (reminder.status === 'Overdue' || dueDate < today) {
      return <FaExclamationTriangle className="text-red-500" size={14} title="Overdue" />;
    } else {
      return <FaClock className="text-blue-500" size={14} title="Upcoming" />;
    }
  };

  // Render a reminder card
  const ReminderCard = ({ reminder, relatedItem }) => {
    return (
      <div 
        className={`border rounded-lg shadow-sm p-3 ${
          isNightMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200'
        } h-36 flex flex-col`}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(reminder)}
            <h3 className="font-medium truncate max-w-[150px]" title={reminder.title}>
              {reminder.title}
            </h3>
            {reminder.itemId && (
              <Link 
                to={`/items/edit/${reminder.itemId}`} 
                className="text-blue-500 hover:text-blue-700"
                title={`Go to item: ${reminder.itemName || relatedItem?.title || reminder.itemId}`}
              >
                <FaLink size={14} />
              </Link>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            new Date(reminder.dueDate) < new Date() 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          } ${isNightMode ? 'bg-opacity-20' : ''}`}>
            {new Date(reminder.dueDate) < new Date() ? 'Overdue' : 'Upcoming'}
          </span>
        </div>
        
        <div className="flex-grow overflow-hidden">
          <p className="text-secondary text-xs mb-1 line-clamp-2 h-8" title={reminder.description}>
            {reminder.description || 'No description provided'}
          </p>
          
          {/* Display related item if available - moved higher up for better visibility */}
          {reminder.itemId && (
            <div className={`p-1 rounded text-xs ${isNightMode ? 'bg-gray-700' : 'bg-gray-100'} truncate`}>
              <span className="font-medium mr-1">Item:</span>
              <span title={reminder.itemName || relatedItem?.title || reminder.itemId} className="truncate">
                {((reminder.itemName || relatedItem?.title || reminder.itemId).substring(0, 25))}
                {(reminder.itemName || relatedItem?.title || reminder.itemId).length > 25 ? '...' : ''}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-xs text-secondary">
              Due: {new Date(reminder.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-1">
            {onView && (
              <button
                onClick={() => onView(reminder)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="View details"
              >
                <FaEye size={14} />
              </button>
            )}
            {onComplete && reminder.status !== 'Completed' && (
              <button
                onClick={() => onComplete(reminder._id)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Mark as completed"
              >
                <FaCheckCircle size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(reminder._id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete reminder"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ReminderGroup = ({ title, reminders, icon, relatedItems }) => {
    if (!reminders.length) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          {icon} {title} <span className="text-sm text-gray-500">({reminders.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map(reminder => (
            <ReminderCard 
              key={reminder._id || reminder.id} 
              reminder={reminder}
              relatedItem={relatedItems ? relatedItems.find(item => item.customId === reminder.itemId) : null}
            />
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
        relatedItems={[]}
      />
      <ReminderGroup 
        title="Due Today" 
        reminders={groupedReminders.today}
        icon={<FaClock className="text-yellow-500" />}
        relatedItems={[]}
      />
      <ReminderGroup 
        title="Due this Month" 
        reminders={groupedReminders.thisMonth}
        icon={<FaCalendarAlt className="text-blue-400" />}
        relatedItems={[]}
      />
      <ReminderGroup 
        title="Upcoming" 
        reminders={groupedReminders.upcoming}
        icon={<FaClock className="text-blue-500" />}
        relatedItems={[]}
      />
      <ReminderGroup 
        title="Completed" 
        reminders={groupedReminders.completed}
        icon={<FaCheckCircle className="text-green-500" />}
        relatedItems={[]}
      />
    </div>
  );
};

export default ReminderList;

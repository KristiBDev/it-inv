import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isNightMode } = useTheme();

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
        const response = await axios.get(`${apiUrl}/reminders`);
        
        // Make sure we always set an array to the reminders state
        if (Array.isArray(response.data)) {
          setReminders(response.data);
        } else if (response.data && Array.isArray(response.data.reminders)) {
          setReminders(response.data.reminders);
        } else {
          console.warn('Reminders API did not return an array:', response.data);
          setReminders([]); // Set to empty array if response format is unexpected
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
        toast.error('Failed to load reminders');
        setReminders([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  // Handle reminder creation
  const handleCreateReminder = () => {
    // Navigate to create reminder form or open a modal
    toast.info('Create reminder functionality will be implemented soon');
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.delete(`${apiUrl}/reminders/${id}`);
      setReminders(reminders.filter(reminder => reminder._id !== id));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  return (
    <div className="p-4 min-h-screen">
      <div className="flex justify-between items-center">
        <BackButton />
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold my-6">Reminders</h1>

      <div className="app-card shadow-xl rounded-xl overflow-hidden">
        <div className="app-card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold">Maintenance Reminders</h2>
          <button 
            onClick={handleCreateReminder}
            className="app-btn app-btn-primary py-2 px-4"
          >
            Add Reminder
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="p-6">
            {!Array.isArray(reminders) || reminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-secondary mb-4">No reminders found</p>
                <p className="text-secondary">Create reminders for maintenance tasks, warranty expirations, or other important dates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reminders.map((reminder, index) => (
                  <div 
                    key={reminder._id || reminder.id || index} 
                    className={`border rounded-lg shadow-sm p-4 ${
                      isNightMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{reminder.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        new Date(reminder.dueDate) < new Date() 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      } ${isNightMode ? 'bg-opacity-20' : ''}`}>
                        {new Date(reminder.dueDate) < new Date() ? 'Overdue' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-secondary text-sm mb-3">{reminder.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary">
                        Due: {new Date(reminder.dueDate).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;

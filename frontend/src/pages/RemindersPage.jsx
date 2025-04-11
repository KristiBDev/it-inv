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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    itemId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
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
        
        // Fetch items for dropdown menu
        const itemsResponse = await axios.get(`${apiUrl}/items`);
        if (Array.isArray(itemsResponse.data)) {
          setItems(itemsResponse.data);
        } else if (itemsResponse.data && Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          setItems([]);
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
  }, []); // This effect runs only once when component mounts

  // Handle reminder creation modal
  const handleCreateReminder = () => {
    setIsModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewReminder({
      title: '',
      description: '',
      dueDate: '',
      itemId: ''
    });
  };
  
  // Handle input change for new reminder
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit new reminder
  const handleSubmitReminder = async (e) => {
    e.preventDefault();
    
    if (!newReminder.title || !newReminder.dueDate) {
      toast.error('Title and due date are required');
      return;
    }
    
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      
      // Format the submission data to match the model
      const reminderData = {
        ...newReminder,
        // Add any missing fields with defaults
        priority: newReminder.priority || 'Medium',
        status: 'Pending',
        user: 'DemoAdmin', // Or get from authentication if available
        actionType: 'create_reminder'
      };
      
      console.log('Submitting reminder:', reminderData); // For debugging
      
      const response = await axios.post(`${apiUrl}/reminders`, reminderData);
      
      if (response.data) {
        setReminders(prev => [...prev, response.data]);
        toast.success('Reminder created successfully');
        closeModal();
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create reminder';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.delete(`${apiUrl}/reminders/${id}`, {
        data: { actionType: 'delete_reminder' } // Add action type to correctly log the activity
      });
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
      
      {/* Create Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-semibold mb-4">Create New Reminder</h3>
            
            <form onSubmit={handleSubmitReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newReminder.title}
                  onChange={handleInputChange}
                  className="app-input shadow-sm w-full"
                  placeholder="Reminder title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                <textarea
                  name="description"
                  value={newReminder.description}
                  onChange={handleInputChange}
                  className="app-textarea shadow-sm w-full"
                  placeholder="Describe the reminder"
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newReminder.dueDate}
                  onChange={handleInputChange}
                  className="app-input shadow-sm w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Related Item (Optional)</label>
                <select
                  name="itemId"
                  value={newReminder.itemId}
                  onChange={handleInputChange}
                  className="app-select shadow-sm w-full"
                >
                  <option value="">-- Select Item --</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title} ({item.customId})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="app-btn app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { deleteReminder } from '../services/remindersService';
import { FaEye, FaExclamationTriangle, FaClock, FaCheckCircle, FaTrash, FaLink } from 'react-icons/fa';
import ReminderList from '../components/ReminderList';

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 250;

// Helper function to sanitize input
const sanitizeInput = (input) => {
  if (!input) return '';
  // Remove HTML tags and trim
  return input.replace(/<[^>]*>?/gm, '').trim();
};

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
  const [searchText, setSearchText] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { isNightMode } = useTheme();
  const location = useLocation(); // Get location for URL query params
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check for itemId in URL params when component mounts
  useEffect(() => {
    // Get itemId from URL parameters
    const params = new URLSearchParams(location.search);
    const itemIdParam = params.get('itemId');
    
    if (itemIdParam) {
      console.log('ItemId found in URL:', itemIdParam);
      // Pre-fill the related item field in the new reminder form
      setNewReminder(prev => ({
        ...prev,
        itemId: itemIdParam
      }));
      setSearchText(itemIdParam);
      
      // Also open the modal if there's an itemId in URL
      setIsModalOpen(true);
    }
  }, [location.search]);

  // Debug function to log item structure
  const logItemsStructure = () => {
    if (items.length > 0) {
      console.log('Sample item structure:', items[0]);
      console.log('customId exists?', items.some(item => item.customId));
    } else {
      console.log('No items loaded');
    }
  };

  // Helper function to get item details by customId
  const getItemByCustomId = (customId) => {
    if (!customId) return null;
    return items.find(item => item.customId === customId);
  };

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
        const response = await axios.get(`${apiUrl}/reminders`);
        
        // Make sure we always set an array to the reminders state
        if (Array.isArray(response.data)) {
          setReminders(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setReminders(response.data.data);
        } else if (response.data && Array.isArray(response.data.reminders)) {
          setReminders(response.data.reminders);
        } else {
          console.warn('Reminders API did not return an array:', response.data);
          setReminders([]); // Set to empty array if response format is unexpected
        }
        
        // Fetch items for dropdown menu - fixed to handle the data structure properly
        const itemsResponse = await axios.get(`${apiUrl}/items`);
        console.log('Items response:', itemsResponse.data);
        
        if (Array.isArray(itemsResponse.data)) {
          setItems(itemsResponse.data);
        } else if (itemsResponse.data && Array.isArray(itemsResponse.data.data)) {
          setItems(itemsResponse.data.data);
        } else if (itemsResponse.data && Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          console.warn('Items API did not return an array:', itemsResponse.data);
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setReminders([]);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []); // This effect runs only once when component mounts

  // Log items structure after they're loaded
  useEffect(() => {
    if (items.length > 0) {
      logItemsStructure();
    }
  }, [items]);

  // Filter items based on search text with improved debugging
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredItems([]);
      setShowDropdown(false);
      return;
    }

    console.log('Searching for:', searchText);
    console.log('Items available:', items.length);
    
    // First try with customId property
    let matchingItems = items.filter(item => 
      item.customId && item.customId.toLowerCase().includes(searchText.toLowerCase())
    );
    
    // If no matches found, try alternative property names
    if (matchingItems.length === 0) {
      const alternativeNames = ['custom_id', 'customID', 'inventoryId', 'inventory_id'];
      
      alternativeNames.forEach(propName => {
        if (matchingItems.length === 0) {
          matchingItems = items.filter(item => 
            item[propName] && item[propName].toLowerCase().includes(searchText.toLowerCase())
          );
          if (matchingItems.length > 0) {
            console.log(`Found matches using property: ${propName}`);
          }
        }
      });
    }
    
    // Additional fallback to search in title if still no matches
    if (matchingItems.length === 0) {
      matchingItems = items.filter(item => 
        item.title && item.title.toLowerCase().includes(searchText.toLowerCase())
      );
      if (matchingItems.length > 0) {
        console.log('Found matches in title instead of customId');
      }
    }
    
    console.log('Matching items found:', matchingItems.length);
    
    // Limit to 5 results
    const limitedMatches = matchingItems.slice(0, 5);
    setFilteredItems(limitedMatches);
    setShowDropdown(limitedMatches.length > 0);
  }, [searchText, items]);

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
    setSearchText('');
    setShowDropdown(false);
  };

  // Open detail modal
  const openDetailModal = (reminder) => {
    setSelectedReminder(reminder);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setSelectedReminder(null);
    setShowDetailModal(false);
  };
  
  // Handle input change for new reminder
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Apply length restrictions based on field name
    if (name === 'title' && value.length > MAX_TITLE_LENGTH) {
      toast.info(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`);
      return;
    }
    
    if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
      toast.info(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }
    
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input change with additional logging
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchText(value);
  };

  // Modified item selection handler to use customId instead of _id
  const handleSelectItem = (item) => {
    setNewReminder(prev => ({
      ...prev,
      itemId: item.customId // Using customId which is what the backend expects
    }));
    setSearchText(item.customId);
    setShowDropdown(false);
    
    console.log('Selected item:', item);
    console.log('Set itemId to:', item.customId);
  };
  
  // Submit new reminder
  const handleSubmitReminder = async (e) => {
    e.preventDefault();
    
    // Sanitize and validate inputs
    const sanitizedTitle = sanitizeInput(newReminder.title).substring(0, MAX_TITLE_LENGTH);
    const sanitizedDescription = sanitizeInput(newReminder.description).substring(0, MAX_DESCRIPTION_LENGTH);
    
    if (!sanitizedTitle) {
      toast.error('Title is required');
      return;
    }
    
    if (!newReminder.dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      
      // Format the submission data to match the model
      const reminderData = {
        ...newReminder,
        title: sanitizedTitle,
        description: sanitizedDescription,
        // If we have searchText but no itemId, try to find the item by customId
        itemId: newReminder.itemId || 
                (searchText ? items.find(i => i.customId === searchText)?.customId || searchText : ''),
        // Add any missing fields with defaults
        priority: newReminder.priority || 'Medium',
        status: 'Pending',
        user: 'DemoAdmin',
        actionType: 'create_reminder'
      };
      
      console.log('Submitting reminder:', reminderData);
      
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
      // Use the imported deleteReminder function
      const result = await deleteReminder(id);
      
      // If we get here with a result, it means deleteReminder didn't throw
      // and either succeeded or returned a "probably deleted" response
      setReminders(reminders.filter(reminder => reminder._id !== id));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      
      // If the error indicates the reminder was probably deleted despite the error
      if (error.probablyDeleted) {
        // Still update UI to remove the reminder
        setReminders(reminders.filter(reminder => reminder._id !== id));
        toast.info('Reminder was likely deleted despite server errors');
      } else {
        // Show error message for other errors
        toast.error(error.userMessage || 'Failed to delete reminder');
      }
    }
  };

  return (
    <div className="p-4 min-h-screen">
      <div className="flex justify-between items-center">
        
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
              <ReminderList 
                reminders={reminders}
                isLoading={false}
                onDelete={handleDeleteReminder}
                onView={openDetailModal}
                isNightMode={isNightMode}
              />
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
              
              <div className="relative">
                <label className="block text-sm font-medium text-secondary mb-1">Related Item (Optional)</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearchChange}
                  className="app-input shadow-sm w-full"
                  placeholder="Search by custom ID (e.g. INV-932418)"
                />

                {/* Autocomplete dropdown */}
                {showDropdown && (
                  <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md shadow-lg ${isNightMode ? 'bg-gray-700' : 'bg-white'} border ${isNightMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    {filteredItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectItem(item)}
                        className={`px-4 py-2 text-sm cursor-pointer hover:${isNightMode ? 'bg-gray-600' : 'bg-gray-100'}`}
                      >
                        <div className="font-medium">{item.customId}</div>
                        <div className="text-xs text-secondary">{item.title}</div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Reminder Detail Modal */}
      {showDetailModal && selectedReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`relative w-full max-w-lg p-6 rounded-lg shadow-xl ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button 
              onClick={closeDetailModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              {selectedReminder.status === 'Completed' ? (
                <FaCheckCircle className="text-green-500" />
              ) : new Date(selectedReminder.dueDate) < new Date() ? (
                <FaExclamationTriangle className="text-red-500" />
              ) : (
                <FaClock className="text-blue-500" />
              )}
              <h3 className="text-xl font-semibold">{selectedReminder.title}</h3>
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">Status</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  new Date(selectedReminder.dueDate) < new Date() 
                    ? 'bg-red-100 text-red-800' 
                    : selectedReminder.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                } ${isNightMode ? 'bg-opacity-20' : ''}`}>
                  {new Date(selectedReminder.dueDate) < new Date() ? 'Overdue' : 
                   selectedReminder.status === 'Completed' ? 'Completed' : 'Upcoming'}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">Due Date</h4>
                <p>{new Date(selectedReminder.dueDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">Description</h4>
                <p className="whitespace-pre-line">{selectedReminder.description || 'No description provided'}</p>
              </div>
              
              {selectedReminder.itemId && (
                <div>
                  <h4 className="text-sm font-medium text-secondary mb-1">Related Item</h4>
                  <div className={`p-3 rounded ${isNightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="font-medium">{getItemByCustomId(selectedReminder.itemId)?.title || 'Unknown Item'}</p>
                    <p className="text-sm text-secondary mt-1">ID: {selectedReminder.itemId}</p>
                    <div className="mt-2">
                      <a 
                        href={`/items/edit/${selectedReminder.itemId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Item Details
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => {
                    handleDeleteReminder(selectedReminder._id);
                    closeDetailModal();
                  }}
                  className="app-btn app-btn-danger"
                >
                  Delete Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;

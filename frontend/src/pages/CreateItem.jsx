import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';

const CreateItem = () => {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    category: 'Laptop',
    status: 'Available',
    department: 'IT',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    customId: '',
    dateAdded: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // Generate a custom ID when component loads
  useEffect(() => {
    generateCustomId();
  }, []);

  // Function to generate a custom ID
  const generateCustomId = () => {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const newId = `${prefix}-${timestamp}-${random}`;
    setGeneratedId(newId);
    setItemData({...itemData, customId: newId});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!itemData.title) {
      toast.error('Item name is required');
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/items`, {
        ...itemData,
        customId: generatedId,
        dateAdded: new Date().toISOString()
      });
      
      toast.success('Item created successfully!');
      navigate('/');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Failed to create item. Please try again.');
        console.error('Error creating item:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-wide">Add New Item</h1>
          <ThemeToggle />
        </div>
        
        <div className="app-card p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto-generated fields - Fixed background color */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Item ID (Auto-generated)</label>
                  <input
                    type="text"
                    value={generatedId}
                    className="app-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">This ID is automatically generated and cannot be modified</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Added</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={itemData.dateAdded}
                    className="app-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Current date is automatically set</p>
                </div>
              </div>

              {/* Required fields section */}
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-xl font-semibold mb-3 border-b pb-2">Basic Information</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Item Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={itemData.title}
                  onChange={handleChange}
                  className="app-input"
                  required
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  name="category"
                  value={itemData.category}
                  onChange={handleChange}
                  className="app-select"
                  required
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Printer">Printer</option>
                  <option value="Server">Server</option>
                  <option value="Network Device">Network Device</option>
                  <option value="Peripheral">Peripheral</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status <span className="text-red-500">*</span></label>
                <select
                  name="status"
                  value={itemData.status}
                  onChange={handleChange}
                  className="app-select"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department <span className="text-red-500">*</span></label>
                <select
                  name="department"
                  value={itemData.department}
                  onChange={handleChange}
                  className="app-select"
                  required
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={itemData.description}
                  onChange={handleChange}
                  className="app-textarea h-24"
                  placeholder="Enter item description"
                ></textarea>
              </div>

              {/* Additional details section */}
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-xl font-semibold mb-3 mt-2 border-b pb-2">Additional Details</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={itemData.location}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Where is this item located?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={itemData.purchaseDate}
                  onChange={handleChange}
                  className="app-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purchase Price</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={itemData.purchasePrice}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={itemData.manufacturer}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="E.g., Dell, HP, Apple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={itemData.model}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="E.g., XPS 15, MacBook Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={itemData.serialNumber}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Serial/identification number"
                />
              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="app-btn app-btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="app-btn app-btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateItem;
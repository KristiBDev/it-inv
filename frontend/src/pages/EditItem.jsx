import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import ItemNotes from '../components/ItemNotes';
import ItemHistory from '../components/ItemHistory';
import ItemTag from '../components/ItemTag';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const EditItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    department: '',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
  });
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isNightMode } = useTheme();

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/items/${id}`)
      .then((response) => {
        const itemData = response.data;
        setItem(itemData);
        setFormData({
          title: itemData.title || '',
          description: itemData.description || '',
          category: itemData.category || '',
          status: itemData.status || '',
          department: itemData.department || '',
          location: itemData.location || '',
          purchaseDate: itemData.purchaseDate ? new Date(itemData.purchaseDate).toISOString().split('T')[0] : '',
          purchasePrice: itemData.purchasePrice || '',
          manufacturer: itemData.manufacturer || '',
          model: itemData.model || '',
          serialNumber: itemData.serialNumber || '',
        });
        
        // Get the QR code
        if (itemData.qrCode) {
          setQrCode(itemData.qrCode);
        } else {
          // If QR code doesn't exist in the item data, fetch it separately
          axios.get(`${apiUrl}/items/${id}/qrcode`)
            .then(qrResponse => {
              setQrCode(qrResponse.data.qrCode);
            })
            .catch(error => {
              console.error("Error fetching QR code:", error);
            });
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to load item');
        setLoading(false);
      });
  }, [id]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.put(`${apiUrl}/items/${id}`, formData);
      setMessage('Item updated successfully!');
      toast.success('Item updated successfully!');
      // Refresh history after update
      setRefresh(!refresh);
      // Wait a moment before navigating back
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      if (error.response?.status === 429) {
        // Use the server's response message if available
        const errorMessage = error.response.data.message || "Item update limit reached. Please try again later.";
        toast.error(errorMessage);
        setMessage('Rate limit exceeded. Please try again later.');
      } else {
        console.error(error);
        setMessage('Failed to update item. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handler to refresh history when notes change
  const handleNotesChange = () => {
    setRefresh(!refresh);
  };
  
  // Function to download the QR code as an image
  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qrcode-${item.customId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Function to print the QR code
  const printQRCode = () => {
    if (qrCode) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code for ${item.title} (${item.customId})</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: Arial, sans-serif;
              }
              .container {
                text-align: center;
              }
              img {
                max-width: 300px;
                margin-bottom: 20px;
              }
              h2, p {
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${qrCode}" alt="QR Code">
              <h2>${item.title}</h2>
              <p>ID: ${item.customId}</p>
              <p>Department: ${item.department}</p>
              <p>Category: ${item.category}</p>
              <p>Status: ${item.status}</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="p-4 min-h-screen">
      <div className="flex justify-between items-center">
        <BackButton />
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold my-6">Edit Item</h1>
      
      <div className="app-card shadow-xl rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : !item ? (
          <div className="p-6 text-center text-secondary">Item not found.</div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Left column - Non-editable information */}
            <div className={`${isNightMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} p-8 md:w-1/3`}>
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold mb-6 border-b pb-2 border-opacity-50">
                  Item Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <span className="block text-sm font-medium text-secondary">Item ID</span>
                    <p className="mt-1 text-2xl font-bold">{item.customId}</p>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-secondary">Date Added</span>
                    <p className="mt-1 text-lg">
                      {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-secondary">Last Updated</span>
                    <p className="mt-1 text-lg">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-opacity-50">
                    <span className="block text-sm font-medium text-secondary mb-2">Current Status</span>
                    <span className={`status-badge ${
                        item.status === 'In Use'
                          ? 'status-badge-in-use'
                          : item.status === 'Available'
                          ? 'status-badge-available'
                          : 'status-badge-maintenance'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  
                  {/* Asset Label Section */}
                  {qrCode && (
                    <div className="mt-8 pt-6 border-t border-opacity-50">
                      <span className="block text-sm font-medium text-secondary mb-2">Asset Label</span>
                      <ItemTag item={item} qrCode={qrCode} compact={true} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Edit form */}
            <div className="p-8 md:w-2/3">
              <h2 className="text-xl font-semibold mb-6 border-b pb-2 border-opacity-50">
                Edit Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="app-select shadow-sm"
                        required
                      >
                        <option value="">Select Category</option>
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
                      <label className="block text-sm font-medium text-secondary mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="app-select shadow-sm"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">IT</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {['Available', 'In Use', 'Maintenance'].map(status => (
                          <label 
                            key={status}
                            className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                              formData.status === status
                                ? isNightMode 
                                  ? 'border-blue-400 bg-blue-900 bg-opacity-50 text-blue-200'
                                  : 'border-primary bg-primary bg-opacity-10 text-primary'
                                : isNightMode
                                  ? 'border-gray-600 hover:bg-gray-700 text-gray-200'
                                  : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={status}
                              checked={formData.status === status}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <span>{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="app-textarea h-24 w-full"
                      placeholder="Enter item description"
                    ></textarea>
                  </div>
                </div>
                
                {/* Additional Details Section */}
                <div className="mb-6 pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                        placeholder="Where is this item located?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Purchase Date</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Purchase Price</label>
                      <input
                        type="number"
                        name="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Manufacturer</label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                        placeholder="E.g., Dell, HP, Apple"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Model</label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                        placeholder="E.g., XPS 15, MacBook Pro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Serial Number</label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        className="app-input shadow-sm"
                        placeholder="Serial/identification number"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    className="app-btn app-btn-primary w-full py-3 px-4 shadow-md"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update Item'}
                  </button>
                </div>
                
                {message && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  } ${isNightMode ? 'bg-opacity-20 text-opacity-90' : ''}`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modularized components */}
      {!loading && item && (
        <>
          {/* ItemNotes component */}
          <div className="app-card shadow-lg rounded-lg overflow-hidden mt-8">
            <div className="app-card-header">
              <h2 className="text-xl font-semibold">Item Notes</h2>
            </div>
            <div className={isNightMode ? 'bg-gray-800' : ''}>
              <ItemNotes 
                itemId={item.customId} 
                onNotesChange={handleNotesChange}
                isNightMode={isNightMode}
              />
            </div>
          </div>
          
          {/* ItemHistory component */}
          <div className="app-card shadow-lg rounded-lg overflow-hidden mt-8">
            <div className="app-card-header">
              <h2 className="text-xl font-semibold">Item History</h2>
            </div>
            <div>
              <ItemHistory 
                itemId={item.customId} 
                key={`history-${refresh}`}
                logColorScheme={{
                  create: {
                    border: 'border-l-emerald-500',
                    bg: 'log-entry-create',
                    badge: 'log-badge-create'
                  },
                  update: {
                    border: 'border-l-blue-500',
                    bg: 'log-entry-update',
                    badge: 'log-badge-update'
                  },
                  delete: {
                    border: 'border-l-purple-500',
                    bg: 'log-entry-delete',
                    badge: 'log-badge-delete'
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditItem;
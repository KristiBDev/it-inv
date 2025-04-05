import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import ItemNotes from '../components/ItemNotes';
import ItemHistory from '../components/ItemHistory';
import ItemTag from '../components/ItemTag';
import { toast } from 'react-toastify';
import { FaDownload, FaPrint } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const EditItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: '',
    department: '',
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
          title: itemData.title,
          category: itemData.category,
          status: itemData.status,
          department: itemData.department,
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
      
      <div className="card shadow-xl rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : !item ? (
          <div className="p-6 text-center text-gray-500">Item not found.</div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Left column - Non-editable information */}
            <div className={`${isNightMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} p-8 md:w-1/3`}>
              <div className="sticky top-8">
                <h2 className={`text-xl font-semibold mb-6 ${isNightMode ? 'text-blue-300 border-blue-700' : 'text-blue-800 border-blue-200'} border-b pb-2`}>
                  Item Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <span className={`block text-sm font-medium ${isNightMode ? 'text-blue-300' : 'text-blue-600'}`}>Item ID</span>
                    <p className={`mt-1 text-2xl font-bold ${isNightMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.customId}</p>
                  </div>
                  
                  <div>
                    <span className={`block text-sm font-medium ${isNightMode ? 'text-blue-300' : 'text-blue-600'}`}>Date Added</span>
                    <p className={`mt-1 text-lg ${isNightMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className={`block text-sm font-medium ${isNightMode ? 'text-blue-300' : 'text-blue-600'}`}>Last Updated</span>
                    <p className={`mt-1 text-lg ${isNightMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div className={`mt-8 pt-6 border-t ${isNightMode ? 'border-blue-700' : 'border-blue-200'}`}>
                    <span className={`block text-sm font-medium ${isNightMode ? 'text-blue-300' : 'text-blue-600'} mb-2`}>Current Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'In Use'
                          ? 'bg-green-200 text-green-800'
                          : item.status === 'Available'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  
                  {/* Asset Label Section */}
                  {qrCode && (
                    <div className={`mt-8 pt-6 border-t ${isNightMode ? 'border-blue-700' : 'border-blue-200'}`}>
                      <span className={`block text-sm font-medium ${isNightMode ? 'text-blue-300' : 'text-blue-600'} mb-2`}>Asset Label</span>
                      <ItemTag item={item} qrCode={qrCode} compact={true} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Edit form */}
            <div className={`p-8 md:w-2/3 ${isNightMode ? 'bg-gray-800' : ''}`}>
              <h2 className={`text-xl font-semibold mb-6 ${isNightMode ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'} border-b pb-2`}>
                Edit Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields */}
                <div>
                  <label className={`block text-sm font-medium ${isNightMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Name</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full border ${isNightMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isNightMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full border ${isNightMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network">Network</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isNightMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full border ${isNightMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
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
                  <label className={`block text-sm font-medium ${isNightMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Status</label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['In Use', 'Available', 'Maintenance'].map(status => (
                      <label 
                        key={status}
                        className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                          formData.status === status
                            ? isNightMode 
                              ? 'border-blue-400 bg-blue-900 bg-opacity-50 text-blue-200'
                              : 'border-blue-500 bg-blue-50 text-blue-700'
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
                
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 shadow-md"
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

        {/* Modularized          ents */}
      {!loading && item && (
        <>
          {/* ItemNotes component with improved dark mode styling */}
          <div className={`mt-8 card shadow-lg rounded-lg overflow-hidden ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${isNightMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isNightMode ? 'text-gray-100' : 'text-gray-800'}`}>Item Notes</h2>
            </div>
            <div className={isNightMode ? 'bg-gray-800 text-gray-200' : ''}>
              <ItemNotes 
                itemId={item.customId} 
                onNotesChange={handleNotesChange}
                isNightMode={isNightMode}
              />
            </div>
          </div>
          
          {/* ItemHistory component with improved dark mode styling */}
          <div className={`mt-8 card shadow-lg rounded-lg overflow-hidden ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${isNightMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isNightMode ? 'text-gray-100' : 'text-gray-800'}`}>Item History</h2>
            </div>
            <div className={isNightMode ? 'bg-gray-800 text-gray-200' : ''}>
              <ItemHistory 
                itemId={item.customId} 
                key={`history-${refresh}`}
                isNightMode={isNightMode}
                logColorScheme={{
                  create: {
                    border: isNightMode ? 'border-l-emerald-500' : 'border-l-emerald-500',
                    bg: isNightMode ? 'bg-emerald-900 bg-opacity-15' : 'bg-emerald-50',
                    badge: isNightMode ? 'bg-emerald-800 bg-opacity-50 text-emerald-200' : 'bg-emerald-200 text-emerald-800'
                  },
                  update: {
                    border: isNightMode ? 'border-l-blue-500' : 'border-l-blue-500',
                    bg: isNightMode ? 'bg-blue-900 bg-opacity-15' : 'bg-blue-50',
                    badge: isNightMode ? 'bg-blue-800 bg-opacity-50 text-blue-200' : 'bg-blue-200 text-blue-800'
                  },
                  delete: {
                    border: isNightMode ? 'border-l-purple-500' : 'border-l-purple-500',
                    bg: isNightMode ? 'bg-purple-900 bg-opacity-15' : 'bg-purple-50',
                    badge: isNightMode ? 'bg-purple-800 bg-opacity-50 text-purple-200' : 'bg-purple-200 text-purple-800'
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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

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
  const [itemLogs, setItemLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

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
        setLoading(false);
        
        // After fetching the item, fetch its logs
        fetchItemLogs(itemData.customId);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to load item');
        setLoading(false);
      });
  }, [id]);
  
  const fetchItemLogs = (itemId) => {
    setLogsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/logs/item/${itemId}`)
      .then((response) => {
        setItemLogs(response.data.data || []);
        setLogsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching item logs:", error);
        setLogsLoading(false);
      });
  };

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
      // Wait a moment before navigating back
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else {
        console.error(error);
        setMessage('Failed to update item. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <BackButton />
      <h1 className="text-3xl font-bold my-6 text-gray-800">Edit Item</h1>
      
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : !item ? (
          <div className="p-6 text-center text-gray-500">Item not found.</div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Left column - Non-editable information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:w-1/3">
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold mb-6 text-blue-800 border-b border-blue-200 pb-2">
                  Item Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <span className="block text-sm font-medium text-blue-600">Item ID</span>
                    <p className="mt-1 text-2xl font-bold text-gray-800">{item.customId}</p>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-blue-600">Date Added</span>
                    <p className="mt-1 text-lg text-gray-700">
                      {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-blue-600">Last Updated</span>
                    <p className="mt-1 text-lg text-gray-700">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-blue-200">
                    <span className="block text-sm font-medium text-blue-600 mb-2">Current Status</span>
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
                </div>
              </div>
            </div>
            
            {/* Right column - Edit form */}
            <div className="p-8 md:w-2/3">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-2">
                Edit Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network">Network</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['In Use', 'Available', 'Maintenance'].map(status => (
                      <label 
                        key={status}
                        className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                          formData.status === status
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Item Logs Section */}
      {!loading && item && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Item History</h2>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {logsLoading ? (
              <div className="p-6 text-center">
                <Spinner />
              </div>
            ) : itemLogs.length > 0 ? (
              <div className="p-4 space-y-3">
                {itemLogs.map((log) => (
                  <div 
                    key={log._id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      log.action === 'create'
                        ? 'border-l-green-500 bg-green-50'
                        : log.action === 'update'
                        ? 'border-l-yellow-500 bg-yellow-50'
                        : 'border-l-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.action === 'create'
                            ? 'bg-green-200 text-green-800'
                            : log.action === 'update'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </span>
                    </div>
                    
                    <p className="font-medium mt-1 text-gray-800">
                      <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} this item
                    </p>
                    
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="mt-2 pl-2 border-l-2 border-gray-300">
                        {Object.entries(log.changes).map(([field, change]) => (
                          <p key={field} className="text-sm text-gray-600">
                            <span className="font-medium capitalize">{field}:</span> {change.from} → {change.to}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No history available for this item.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditItem;
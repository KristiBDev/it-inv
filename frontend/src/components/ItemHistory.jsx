import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useTheme } from '../contexts/ThemeContext';

const ItemHistory = ({ itemId }) => {
  const [itemLogs, setItemLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { isNightMode } = useTheme();
  
  useEffect(() => {
    if (itemId) {
      fetchItemLogs(itemId);
    }
  }, [itemId]);
  
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
        toast.error("Failed to load item history");
        setLogsLoading(false);
      });
  };

  return (
    <div className="p-6">
      {logsLoading ? (
        <div className="p-6 text-center">
          <Spinner />
        </div>
      ) : itemLogs.length > 0 ? (
        <div className="space-y-3">
          {itemLogs.map((log) => (
            <div 
              key={log._id} 
              className={`p-3 rounded-lg border-l-4 ${
                log.action === 'create'
                  ? isNightMode 
                    ? 'border-l-emerald-500 bg-emerald-900 bg-opacity-15' 
                    : 'border-l-green-500 bg-green-50'
                  : log.action === 'update'
                  ? isNightMode 
                    ? 'border-l-blue-500 bg-blue-900 bg-opacity-15'
                    : 'border-l-yellow-500 bg-yellow-50'
                  : isNightMode
                    ? 'border-l-purple-500 bg-purple-900 bg-opacity-15'
                    : 'border-l-red-500 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.action === 'create'
                      ? isNightMode ? 'bg-emerald-800 bg-opacity-50 text-emerald-200' : 'bg-green-200 text-green-800'
                      : log.action === 'update'
                      ? isNightMode ? 'bg-blue-800 bg-opacity-50 text-blue-200' : 'bg-yellow-200 text-yellow-800'
                      : isNightMode ? 'bg-purple-800 bg-opacity-50 text-purple-200' : 'bg-red-200 text-red-800'
                  }`}
                >
                  {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                </span>
              </div>
              
              <p className={`font-medium mt-1 ${isNightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} 
                {log.action === 'delete' && log.itemName ? 
                  <span className="font-normal"> item {log.itemName} {log.itemCode ? `(${log.itemCode})` : ''}</span> : 
                  ' this item'}
              </p>
              
              {log.changes && Object.keys(log.changes).length > 0 && (
                <div className={`mt-2 pl-2 border-l-2 ${isNightMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  {Object.entries(log.changes).map(([field, change]) => (
                    <p key={field} className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium capitalize">{field}:</span> {change.from ? `${change.from} → ${change.to}` : (change.added ? `Added: "${change.added}"` : change.removed ? `Removed: "${change.removed}"` : '')}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-6 text-center ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No history available for this item.
        </div>
      )}
    </div>
  );
};

export default ItemHistory;

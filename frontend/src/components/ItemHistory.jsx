import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ItemHistory = ({ itemId }) => {
  const [itemLogs, setItemLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
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
        setLogsLoading(false);
      });
  };

  return (
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
                        <span className="font-medium capitalize">{field}:</span> {change.from ? `${change.from} → ${change.to}` : (change.added ? `Added: "${change.added}"` : change.removed ? `Removed: "${change.removed}"` : '')}
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
  );
};

export default ItemHistory;

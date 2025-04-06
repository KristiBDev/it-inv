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
              className={`p-3 rounded-lg ${
                log.action === 'create'
                  ? 'log-entry-create'
                  : log.action === 'update'
                  ? 'log-entry-update'
                  : 'log-entry-delete'
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="text-sm text-secondary">
                  {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`log-badge ${
                  log.action === 'create'
                    ? 'log-badge-create'
                    : log.action === 'update'
                    ? 'log-badge-update'
                    : 'log-badge-delete'
                  }`}
                >
                  {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                </span>
              </div>
              
              <p className="font-medium mt-1">
                <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} 
                {log.action === 'delete' && log.itemName ? 
                  <span className="font-normal"> item {log.itemName} {log.itemCode ? `(${log.itemCode})` : ''}</span> : 
                  ' this item'}
              </p>
              
              {log.changes && Object.keys(log.changes).length > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-gray-300">
                  {Object.entries(log.changes).map(([field, change]) => (
                    <p key={field} className="text-sm text-secondary">
                      <span className="font-medium capitalize">{field}:</span> {change.from ? `${change.from} → ${change.to}` : (change.added ? `Added: "${change.added}"` : change.removed ? `Removed: "${change.removed}"` : '')}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-secondary">
          No history available for this item.
        </div>
      )}
    </div>
  );
};

export default ItemHistory;

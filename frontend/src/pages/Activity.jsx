import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { useTheme } from '../contexts/ThemeContext';
import BackButton from '../components/BackButton';

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isNightMode } = useTheme();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchAllLogs();
  }, []);
  
  const fetchAllLogs = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/logs`)
      .then((response) => {
        const allLogs = response.data.data || [];
        setLogs(allLogs);
        setTotalPages(Math.ceil(allLogs.length / pageSize));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activity logs:", error);
        toast.error("Failed to load activity logs");
        setLoading(false);
      });
  };

  // Get current page logs
  const getCurrentLogs = () => {
    const indexOfLastLog = currentPage * pageSize;
    const indexOfFirstLog = indexOfLastLog - pageSize;
    return logs.slice(indexOfFirstLog, indexOfLastLog);
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <BackButton />
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <Spinner />
        </div>
      ) : logs.length > 0 ? (
        <>
          <div className="space-y-3">
            {getCurrentLogs().map((log) => (
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
                  {log.itemName ? 
                    <span className="font-normal"> item <a href={`/items/details/${log.itemId}`} className="text-blue-600 hover:underline">{log.itemName}</a> {log.itemCode ? `(${log.itemCode})` : ''}</span> : 
                    ' an item'}
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages).keys()].map(number => {
                  // Display limited page numbers
                  if (
                    totalPages <= 7 ||
                    number === 0 ||
                    number === totalPages - 1 ||
                    (currentPage - 2 <= number && number <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {number + 1}
                      </button>
                    );
                  } else if (
                    (number === 1 && currentPage > 4) ||
                    (number === totalPages - 2 && currentPage < totalPages - 3)
                  ) {
                    return <span key={number} className="px-2">...</span>;
                  } else {
                    return null;
                  }
                })}
              </div>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Next
              </button>
            </div>
          )}
          
          <div className="text-center text-gray-500 text-sm mt-3">
            Showing {Math.min((currentPage - 1) * pageSize + 1, logs.length)} to {Math.min(currentPage * pageSize, logs.length)} of {logs.length} entries
          </div>
        </>
      ) : (
        <div className="p-6 text-center text-secondary">
          No activity logs available.
        </div>
      )}
    </div>
  );
};

export default Activity;

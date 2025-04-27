import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { useTheme } from '../contexts/ThemeContext';

import LogEntry from '../components/LogEntry';

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isNightMode } = useTheme();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  
  // Date range filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    fetchAllLogs();
  }, []);
  
  // Filter logs whenever search term, dates, or logs change
  useEffect(() => {
    filterLogs();
  }, [searchTerm, startDate, endDate, logs]);
  
  const fetchAllLogs = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/logs`)
      .then((response) => {
        const allLogs = response.data.data || [];
        setLogs(allLogs);
        setFilteredLogs(allLogs);
        setTotalPages(Math.ceil(allLogs.length / pageSize));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activity logs:", error);
        toast.error("Failed to load activity logs");
        setLoading(false);
      });
  };

  // Filter logs based on search term and date range
  const filterLogs = () => {
    let filtered = [...logs];
    
    // Apply date range filters
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0); // Start of day
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDateTime);
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDateTime);
    }
    
    // Apply text search if there's a search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        // Check item name
        if (log.itemName && log.itemName.toLowerCase().includes(term)) return true;
        
        // Check item code
        if (log.itemCode && log.itemCode.toLowerCase().includes(term)) return true;
        
        // Check user
        if (log.user && log.user.toLowerCase().includes(term)) return true;
        
        // Check action
        if (log.action && log.action.toLowerCase().includes(term)) return true;
        
        // Check ID
        if (log._id && log._id.toLowerCase().includes(term)) return true;
        
        // Check itemId
        if (log.itemId && log.itemId.toLowerCase().includes(term)) return true;
        
        // Check changes
        if (log.changes) {
          for (const [field, change] of Object.entries(log.changes)) {
            if (field.toLowerCase().includes(term)) return true;
            if (change.from && String(change.from).toLowerCase().includes(term)) return true;
            if (change.to && String(change.to).toLowerCase().includes(term)) return true;
            if (change.added && String(change.added).toLowerCase().includes(term)) return true;
            if (change.removed && String(change.removed).toLowerCase().includes(term)) return true;
          }
        }
        
        return false;
      });
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setTotalPages(Math.ceil(filtered.length / pageSize));
  };

  // Get current page logs from filtered logs
  const getCurrentLogs = () => {
    const indexOfLastLog = currentPage * pageSize;
    const indexOfFirstLog = indexOfLastLog - pageSize;
    return filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle date range changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };
  
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
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
        
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4 p-4 rounded-lg shadow">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Text Search */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 pl-10 border  rounded-lg"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Date Range Filters - grouped together */}
        <div className="flex items-center gap-3">
          {/* Start Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Start:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-auto max-w-[160px] p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          {/* End Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">End:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-auto max-w-[160px] p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
        
        {/* Filter Status and Clear Button */}
        {(searchTerm || startDate || endDate) && (
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredLogs.length} of {logs.length} entries
            </div>
            
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <Spinner />
        </div>
      ) : filteredLogs.length > 0 ? (
        <>
          <div className="space-y-3">
            {getCurrentLogs().map((log) => (
              <LogEntry key={log._id} log={log} />
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
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
            {(searchTerm || startDate || endDate) && logs.length > filteredLogs.length && ` (filtered from ${logs.length} total entries)`}
          </div>
        </>
      ) : (
        <div className="p-6 text-center text-secondary">
          {(searchTerm || startDate || endDate) ? 'No logs match your filter criteria.' : 'No activity logs available.'}
        </div>
      )}
    </div>
  );
};

export default Activity;

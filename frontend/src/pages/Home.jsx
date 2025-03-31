import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AiOutlineEye } from 'react-icons/ai';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdOutlineAddBox } from 'react-icons/md';
import { MdOutlineDelete } from 'react-icons/md';
import { AiOutlineDownload } from 'react-icons/ai'; // Add this import for the download icon
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai'; // Import sort icons

const Home = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]); // Add state for filtered items
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments"); // Add state for department filter
  const [loading, setLoading] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // Add state for sorting

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    document.body.classList.toggle('dark-mode', !isNightMode);
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/items`)
      .then((response) => {
        setItems(response.data.data);
        setFilteredItems(response.data.data); // Initialize filtered items
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterItems(term, selectedDepartment);
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    filterItems(searchTerm, department);
  };

  const filterItems = (term, department) => {
    setFilteredItems(
      items.filter(
        (item) =>
          (item.title.toLowerCase().includes(term) ||
            item.customId.toLowerCase().includes(term)) &&
          (department === "All Departments" || item.department === department)
      )
    );
  };

  const sortItems = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredItems(sortedItems);
  };

  const downloadCSV = () => {
    if (filteredItems.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Name", "Category", "Status", "Date Added", "Department", "ID"];
    const rows = filteredItems.map(item => [
      item.title,
      item.category,
      item.status,
      item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : "N/A",
      item.department,
      item.customId,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-6 min-h-screen ${isNightMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold tracking-wide">IT Inventory Dashboard</h1>
        <div className="flex items-center">
          <label className="mr-2 text-lg font-medium">Dark Mode</label>
          <input
            type="checkbox"
            checked={isNightMode}
            onChange={toggleNightMode}
            className="toggle-checkbox"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Total Items</h2>
          <p className="text-4xl font-bold mt-2">{items?.length || 0}</p> {/* Add null check */}
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">In Use</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'In Use').length || 0}</p> {/* Add null check */}
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Maintenance</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'Maintenance').length || 0}</p> {/* Add null check */}
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg p-3 w-full onethird shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={downloadCSV}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-green-600 transition"
        >
          <AiOutlineDownload className="text-xl" />
          <span className="hidden md:inline">Download CSV</span>
        </button>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          className="border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All Departments</option>
          <option>HR</option>
          <option>Finance</option>
          <option>IT</option>
          <option>Marketing</option>
          <option>Operations</option>
        </select>
        <Link
          to="/items/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Add Item
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left hidden md:table-cell">Category</th>
              <th className="p-4 text-left hidden md:table-cell">Status</th>
              <th className="p-4 text-left hidden md:table-cell">Date Added</th>
              <th className="p-4 text-left hidden md:table-cell">Department</th>
              <th className="p-4 text-left hidden md:table-cell">ID</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(filteredItems || []).map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-100 transition ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-4">{item?.title || 'N/A'}</td>
                <td className="p-4 hidden md:table-cell">{item?.category || 'N/A'}</td>
                <td className="p-4 hidden md:table-cell">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item?.status === 'In Use'
                        ? 'bg-green-200 text-green-800'
                        : item?.status === 'Available'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {item?.status || 'N/A'}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  {item?.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4 hidden md:table-cell">{item?.department || 'N/A'}</td>
                <td className="p-4 hidden md:table-cell">{item?.customId || 'N/A'}</td>
                <td className="p-4 flex gap-2">
                  <Link
                    to={`/items/details/${item?.customId}`}
                    className="text-blue-500 hover:text-blue-700 transition"
                  >
                    <AiOutlineEye />
                  </Link>
                  <Link
                    to={`/items/edit/${item?.customId}`}
                    className="text-green-500 hover:text-green-700 transition"
                  >
                    <AiOutlineEdit />
                  </Link>
                  <Link
                    to={`/items/delete/${item?.customId}`}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <MdOutlineDelete />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
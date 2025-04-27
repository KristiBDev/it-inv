import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateItem from './pages/CreateItem';
import EditItem from './pages/EditItem';
import InventoryList from './pages/InventoryList';
import Activity from './pages/Activity';
import RemindersPage from './pages/RemindersPage';
// Other imports as needed

function App() {
  return (
    <ThemeProvider>
      <>
        <ToastContainer position="bottom-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/items/create" element={<CreateItem />} />
            <Route path="/items/edit/:id" element={<EditItem />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/logs" element={<div className="p-6">Logs / Activity Page (Coming Soon)</div>} />
            <Route path="/activity" element={<Activity />} />
          </Route>
        </Routes>
      </>
    </ThemeProvider>
  );
}

export default App;
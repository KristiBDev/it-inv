import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CreateItem from './pages/CreateItem'
import DeleteItem from './pages/DeleteItem'
import EditItem from './pages/EditItem'
import Home from './pages/Home'
import { useTheme } from './contexts/ThemeContext'

const App = () => {
  const { isNightMode } = useTheme();
  
  // Add data-theme attribute to the root element based on night mode
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isNightMode ? 'dark' : 'light');
  }, [isNightMode]);
  
  return (
    <div className="app-container">
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/items/create' element={<CreateItem />} />
        <Route path='/items/edit/:id' element={<EditItem />} />
        <Route path='/items/delete/:id' element={<DeleteItem />} />
      </Routes>
    </div>
  )
}

export default App
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CreateItem from './pages/CreateItem'
import DeleteItem from './pages/DeleteItem'
import EditItem from './pages/EditItem'
import Home from './pages/Home'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/items/create' element={<CreateItem />} />
      {/*<Route path='/items/details/:id' element={<ShowItem />} />*/}
      <Route path='/items/edit/:id' element={<EditItem />} />
      <Route path='/items/delete/:id' element={<DeleteItem />} />
    </Routes>
  )
}

export default App
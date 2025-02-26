import React from 'react'
import { BrowserRouter as  Router , Routes, Route , useLocation } from "react-router-dom"
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/Login'

const App = () => {
  return (
    <div>
      <Router>
        <ConditionalNavbar/>
        <Routes>
       <Route path='/dashboard' element={<Dashboard/>} />
       <Route path='/register' element= {<Register/>}/>
       <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App

const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = [
   '/register',
    '/login'
  ];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return shouldHideNavbar ? null : <Navbar />;
};


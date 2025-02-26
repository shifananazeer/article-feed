import React from 'react'
import { BrowserRouter as  Router , Routes, Route , useLocation } from "react-router-dom"
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOtp'
import { ToastContainer } from "react-toastify";
import ArticleCreation from './pages/ArticleCreation'

const App = () => {
  return (
    <div>
      <Router>
        <ConditionalNavbar/>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
       <Route path='/' element={<Dashboard/>} />
       <Route path='/register' element= {<Register/>}/>
       <Route path="/login" element={<Login />} />
       <Route path='/verify-otp' element={<VerifyOTP/>}/>
       <Route path='/create' element={<ArticleCreation/>}/>
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
    '/login',
    '/verify-otp'
  ];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return shouldHideNavbar ? null : <Navbar />;
};


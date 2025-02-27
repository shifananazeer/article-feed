import React from 'react'
import { BrowserRouter as  Router , Routes, Route , useLocation } from "react-router-dom"
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOtp'
import { ToastContainer } from "react-toastify";
import ArticleCreation from './pages/ArticleCreation'
import MyArticles from './pages/MyArticles'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import PrivateRoute from './components/PriviteRoute'

const App = () => {
  return (
    <div>
      <Router>
        <ConditionalNavbar/>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>

        <Route path='/register' element= {<Register/>}/>
        <Route path="/login" element={<Login />} />
        <Route path='/verify-otp' element={<VerifyOTP/>}/>

        <Route element={<PrivateRoute />}>
       <Route path='/' element={<Dashboard/>} />
       <Route path='/create' element={<ArticleCreation/>}/>
       <Route path='/myarticle' element={<MyArticles/>}/>
       <Route path='/settings' element={<Settings/>}/>
       </Route>

       <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App

const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/register", "/login", "/verify-otp"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || !["/", "/create", "/myarticle", "/settings"].includes(location.pathname);

  return shouldHideNavbar ? null : <Navbar />;
};


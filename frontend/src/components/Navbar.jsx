import React from 'react'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Remove tokens & user ID from local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    // Redirect to login page
    navigate("/login");
    toast.success("Logout successfully")
  };
  return (
    <div>
         <nav className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center">
      {/* Left Side - Logo */}
      <div className="text-lg font-bold">Feed Hive</div>

      {/* Center - Navigation Links */}
      <div className="space-x-6">
        <a href="/" className="text-gray-300 hover:text-white">Dashboard</a>
        <a href="/settings" className="text-gray-300 hover:text-white">Settings</a>
        <a href="/create" className="text-gray-300 hover:text-white">Create Article</a>
        <a href="myarticle" className="text-gray-300 hover:text-white">My Articles</a>
      </div>

      {/* Right Side - Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </nav>
    </div>
  )
}

export default Navbar

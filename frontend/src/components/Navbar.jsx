import React from 'react'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    navigate("/login");
    toast.success("Logout successfully")
  };
  return (
    <div>
         <nav className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="text-lg font-bold">Feed Hive</div>

   
      <div className="space-x-6">
      <button onClick={() => navigate("/")} className="text-gray-300 hover:text-white">Dashboard</button>
      <button onClick={() => navigate("/settings")} className="text-gray-300 hover:text-white">Settings</button>
      <button onClick={() => navigate("/create")} className="text-gray-300 hover:text-white">Create Article</button>
      <button onClick={() => navigate("/myarticle")} className="text-gray-300 hover:text-white">My Articles</button>
      </div>

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

import React from 'react'

const Navbar = () => {
  return (
    <div>
         <nav className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center">
      {/* Left Side - Logo */}
      <div className="text-lg font-bold">Feed Hive</div>

      {/* Center - Navigation Links */}
      <div className="space-x-6">
        <a href="#" className="text-gray-300 hover:text-white">Dashboard</a>
        <a href="#" className="text-gray-300 hover:text-white">Settings</a>
        <a href="#" className="text-gray-300 hover:text-white">Create Article</a>
        <a href="#" className="text-gray-300 hover:text-white">My Articles</a>
      </div>

      {/* Right Side - Logout Button */}
      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
        Logout
      </button>
    </nav>
    </div>
  )
}

export default Navbar

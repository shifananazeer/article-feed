import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; 
import { toast } from "react-toastify";

const Login = () => {
   const [, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [error, setError] = useState("");

   useEffect(() => {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
  
      if (accessToken && userId) {
        setIsAuthenticated(true);
        navigate("/");
      } else {
       setIsAuthenticated(false)
      }
    }, []);

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { emailOrPhone, password } = formData;

    if (!emailOrPhone || !password) {
      setError("Please enter email/phone and password");
      return;
    }

    try {
      console.log("api call ......")
      const response = await axiosInstance.post("/auth/login", { emailOrPhone, password });

      const { accessToken, refreshToken, userId } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);

      toast.success("Login successful!");
      navigate("/");

    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Try again.");
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
   
          <div className="mb-4">
            <label className="block text-gray-700">Email or Phone</label>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter email or phone"
            />
          </div>

     
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter password"
            />
          </div>

   
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

   
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-blue-500 hover:underline">
      Register
    </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

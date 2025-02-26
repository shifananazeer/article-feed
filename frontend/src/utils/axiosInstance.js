import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:import.meta.env.VITE_API_URL, 
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

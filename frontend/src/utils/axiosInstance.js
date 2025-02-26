import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:`${import.meta.env.VITE_API_URL}/api`, 
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and request was not retried already
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // Store new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry original request with new access token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);

      } catch (err) {
        console.error("Refresh token failed, logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        window.location.href = "/login"; // Redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

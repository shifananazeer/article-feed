import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (accessToken && userId) {
      setIsAuthenticated(true);
    } else {
      alert("Unauthorized access. Please log in.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Dashboard</h1>
          <p>Welcome! You are logged in.</p>
        </div>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </div>
  );
};

export default Dashboard;

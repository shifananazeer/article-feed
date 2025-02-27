import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axiosInstance'
import { toast } from "react-toastify";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
    preferences: [],
  });
  const navigate = useNavigate()

  const articleCategories = ["Technology", "Health", "Finance", "Education", "Sports"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreferencesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, preferences: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", formData);
      console.log("Response:", response.data);
      toast.success("OTP sent to email. Please verify your account.");
      
    
      navigate("/verify-otp", { state: { email: formData.email } });
      
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Register</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First & Last Name */}
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 p-2 border rounded"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 p-2 border rounded"
            />
          </div>

          {/* Phone & Email */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          {/* Date of Birth */}
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          {/* Password & Confirm Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          {/* Article Preferences (Multi-select) */}
          <label className="block font-medium">Article Preferences:</label>
          <select
            multiple
            name="preferences"
            value={formData.preferences}
            onChange={handlePreferencesChange}
            className="w-full p-2 border rounded h-32"
          >
            {articleCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Show selected preferences */}
          {formData.preferences.length > 0 && (
            <div className="mt-2 text-sm">
              <strong>Selected:</strong> {formData.preferences.join(", ")}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="w-full bg-blue-900 text-white p-2 rounded hover:bg-blue-800">
            Register
          </button>
        </form>

          {/* Login Link */}
          <p className="mt-4 text-center text-gray-600">
          If you  have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

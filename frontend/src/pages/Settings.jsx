import React, { useEffect, useState } from "react"; 
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosInstance";

const Settings = () => {
    const userId = localStorage.getItem('userId');
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        dob: "",
        preferences: [], 
    });
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [categories, setCategories] = useState([]); 
    const token = localStorage.getItem('accessToken')

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axiosInstance.get(`/auth/userDetails/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });
                
                setUser({
                    firstName: response.data.user.firstName,
                    lastName: response.data.user.lastName,
                    phone: response.data.user.phone,
                    dob: response.data.user.dob.split("T")[0], 
                    preferences: response.data.user.preferences || [],
                });
            } catch (error) {
                console.error("Error fetching user details:", error);
                Swal.fire("Error!", "Failed to load user details.", "error");
            }
        };
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/articles/categories'); 
                console.log("respo" , response)
                setCategories(response.data || []); 
            } catch (error) {
                console.error("Error fetching categories:", error);
                Swal.fire("Error!", "Failed to load categories.", "error");
            }
        };


        fetchUserDetails();
        fetchCategories();
    }, [userId]);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(
                `/auth/users/${userId}`,
                {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    dob: user.dob,
                    preferences: user.preferences, 
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`, 
                        "Content-Type": "application/json", 
                    }
                }
            );
            Swal.fire("Success!", "User details updated.", "success");
        } catch (error) {
            Swal.fire("Error!", "Failed to update details.", "error");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/auth/reset-password/${userId}`, {
                oldPassword,
                newPassword,
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json",
                }
            });
            Swal.fire("Success!", "Password reset successfully.", "success");
        } catch (error) {
            Swal.fire("Error!", error.response.data.message, "error");
        }
    };


    const handlePreferencesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setUser({ ...user, preferences: selectedOptions }); 
    };

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Profile Settings</h2>
                <form onSubmit={handleUpdateDetails}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">First Name</label>
                        <input
                            type="text"
                            value={user.firstName}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Last Name</label>
                        <input
                            type="text"
                            value={user.lastName}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Phone</label>
                        <input
                            type="text"
                            value={user.phone}
                            onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Date of Birth</label>
                        <input
                            type="date"
                            value={user.dob}
                            onChange={(e) => setUser({ ...user, dob: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>

                    <div className="mb-4">
    <label className="block text-gray-700 font-semibold">Current Preferences</label>
    <div className="mb-2">
        {user.preferences.length > 0 ? (
            user.preferences.map((pref, index) => (
                <span key={index} className="inline-block bg-blue-200 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                    {pref}
                </span>
            ))
        ) : (
            <span className="text-gray-500">No preferences selected</span>
        )}
    </div>
    <label className="block text-gray-700 font-semibold">Select Preferences</label>
                        <select
                            multiple
                            value={user.preferences}
                            onChange={handlePreferencesChange}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-500">
                            Hold down the Ctrl (Windows) or Command (Mac) button to select multiple options.
                        </p>
</div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200">
                        Update Details
                    </button>
                </form>

                <h3 className="text-lg font-semibold mt-8 mb-4">Reset Password</h3>
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Old Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white p-3 rounded-md hover:bg-red-700 transition duration-200">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;

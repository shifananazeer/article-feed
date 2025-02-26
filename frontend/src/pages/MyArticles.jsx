import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ThumbsUp, ThumbsDown , Edit, Trash2 } from "lucide-react"

const MyArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArticle();
    }, []);

    const fetchArticle = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axiosInstance.get(`/articles/articles/${userId}`);
            console.log("API Response:", response.data); // Debugging

            // Ensure `articles` is extracted properly
            setArticles(response.data.articles || []);
        } catch (err) {
            console.error("Error fetching articles:", err);
            setError("Failed to load articles. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (articles.length === 0) return <div className="text-center py-8">No articles found.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Articles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <div key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {article.images?.length > 0 && (
                            <div className="relative h-48">
                                {/* Use <img> for React projects */}
                                <img 
                                 src={`${import.meta.env.VITE_API_URL}/${article.images?.[0]}`}
                                  alt={article.title} 
                                  className="w-full h-48 object-cover"
                                  onError={(e) => e.target.src = "/placeholder.svg"} 
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                            {/* <p className="text-gray-600 mb-2">{article.description}</p> */}
                           
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{article.category}</span>
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button>Read More</button>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {article.tags?.map((tag, index) => (
                                    <span key={index} className="bg-blue-200 rounded-full px-2 py-1 text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  <span>{article.likes}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  <span>{article.disLikes}</span>
                </div>
              </div>

                 {/* Buttons */}
                 <div className="flex justify-end mt-4 space-x-3">
                                <button
                                    onClick={() => handleEdit(article._id)}
                                    className="text-blue-500 hover:text-blue-700 transition flex items-center space-x-1"
                                >
                                    <Edit size={20} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(article._id)}
                                    className="text-red-500 hover:text-red-700 transition flex items-center space-x-1"
                                >
                                    <Trash2 size={20} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyArticles;

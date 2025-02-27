import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ThumbsUp, ThumbsDown, XCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const [likedArticles, setLikedArticles] = useState({});
  const [dislikedArticles, setDislikedArticles] = useState({});
  const token  = localStorage.getItem('accessToken')

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    

    if (accessToken && userId) {
      setIsAuthenticated(true);
    } else {
      alert("Unauthorized access. Please log in.");
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
        try {
            const response = await axiosInstance.get(`/articles/prefrences/${userId}` ,{
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            setArticles(response.data.articles);
        } catch (err) {
            setError("Failed to load articles.");
        } finally {
            setLoading(false);
        }
    };

    fetchArticles();
}, [userId]);


const handleLikeDislike = async (articleId, action) => {
  try {
    const response = await axiosInstance.post(
        `/articles/like-dislike`,
        { articleId, action },
        {
            headers: {
                "Authorization": `Bearer ${token}` // Add token in the header
            }
        }
    );

      setArticles((prev) =>
          prev.map((article) =>
              article._id === articleId
                  ? { ...article, likes: response.data.likes, dislikes: response.data.dislikes }
                  : article
          )
      );
  } catch (error) {
      console.error("Error updating like/dislike", error);
  }
};


const handleBlock = async (articleId) => {
  try {
      await axiosInstance.post(`/articles/block`, { userId, articleId } ,{
        headers: {
            "Authorization": `Bearer ${token}` 
        }
      });
      setArticles((prev) => prev.filter((article) => article._id !== articleId)); 
  } catch (error) {
      console.error("Error blocking article", error);
  }
};

  return (
    <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard - Recommended Articles</h2>

            {loading && <p className="text-gray-500">Loading articles...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && articles.length === 0 && <p className="text-gray-500">No articles found for your preferences.</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <div key={article._id} className="border border-gray-200 rounded-lg p-4 shadow-md">
                        {article.images?.length > 0 && (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/${article.images?.[0]}`}
                                alt={article.title}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        )}
                        <h3 className="text-lg font-semibold mt-2">{article.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{article.description.substring(0, 100)}...</p>
                        <p className="text-gray-500 text-xs mt-1">Category: {article.category}</p>

                          {/* Like & Dislike Buttons */}
                          <div className="flex items-center mt-3 space-x-4">
                          <button
                                onClick={() => handleLikeDislike(article._id, "like")}
                                className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition text-gray-500 hover:text-green-600"
                            >
                                <ThumbsUp size={18} className={`${article.likes > 0 ? "text-green-500" : ""}`} />
                                <span>{article.likes}</span>
                            </button>
                            
                            <button
                                onClick={() => handleLikeDislike(article._id, "dislike")}
                                className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition text-gray-500 hover:text-red-600"
                            >
                                <ThumbsDown size={18} className={`${article.dislikes > 0 ? "text-red-500" : ""}`} />
                                <span>{article.dislikes}</span>
                            </button>
                            <button  onClick={()=>handleBlock(article._id)}  >Block</button>
                        </div>

                       

                        <button
                            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                            onClick={() => window.location.href = `/article/${article._id}`}
                        >
                            Read More
                        </button>
                    </div>
                ))}
            </div>
        </div>
  );
};

export default Dashboard;

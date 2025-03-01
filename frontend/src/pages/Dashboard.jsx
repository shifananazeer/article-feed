import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ThumbsUp, ThumbsDown, XCircle } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Dashboard = () => {
  const navigate = useNavigate();
  const [, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (token && userId) {
      setIsAuthenticated(true);
    } else {
      alert("Unauthorized access. Please log in.");
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axiosInstance.get(`/articles/prefrences/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setArticles((prev) =>
        prev.map((article) =>
          article._id === articleId
            ? { ...article, likes: response.data.likes, dislikes: response.data.disLikes }
            : article
        )
      );
    } catch (error) {
      console.error("Error updating like/dislike", error);
    }
  };

  const handleBlock = async (articleId) => {
    try {
      await axiosInstance.post(`/articles/block`, { userId, articleId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setArticles((prev) => prev.filter((article) => article._id !== articleId));
    } catch (error) {
      console.error("Error blocking article", error);
    }
  };

  const openModal = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
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
              src={article.images[0]}
                alt={article.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <h3 className="text-lg font-semibold mt-2">{article.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{article.description.substring(0, 100)}...</p>
            <p className="text-gray-500 text-xs mt-1">Category: {article.category}</p>

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
                <span>{article.disLikes}</span>
              </button>
              <button onClick={() => handleBlock(article._id)}>Block</button>
            </div>

            <button
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              onClick={() => openModal(article)}
            >
              Read More
            </button>
          </div>
        ))}
      </div>

      {/* Modal Component */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedArticle.title}</h2>
              <button onClick={closeModal}>
                <XCircle size={24} className="text-gray-500 hover:text-red-500" />
              </button>
            </div>
              
                {selectedArticle.images?.length > 0 && (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="w-full h-64 rounded-lg"
              >
                {selectedArticle.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image} 
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <p className="text-gray-700 mt-3">{selectedArticle.description}</p>
            <p className="text-gray-500 text-xs mt-1">Category: {selectedArticle.category}</p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 w-full"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

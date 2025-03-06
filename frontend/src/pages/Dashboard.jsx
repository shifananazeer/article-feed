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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const articlesPerPage = 3;
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

  const fetchArticles = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/articles/prefrences/${userId}?page=${page}&limit=${articlesPerPage}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setArticles(response.data.articles);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles(1, searchQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLikeDislike = async (articleId, action) => {
    try {
      const response = await axiosInstance.post(
        `/articles/like-dislike`,
        { articleId, action, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedData = response.data;
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article._id === articleId
            ? {
                ...article,
                likes: updatedData.likes,
                disLikes: updatedData.disLikes,
                likedBy:
                  action === "like"
                    ? [...(article.likedBy || []), userId]
                    : article.likedBy.filter((id) => id !== userId),
                dislikedBy:
                  action === "dislike"
                    ? [...(article.dislikedBy || []), userId]
                    : article.dislikedBy.filter((id) => id !== userId),
              }
            : article
        )
      );
    } catch (error) {
      console.error("Error updating like/dislike", error);
    }
  };

  const handleBlock = async (articleId) => {
    try {
      await axiosInstance.post(
        `/articles/block`,
        { userId, articleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded-md w-1/2"
        />
        <button
          onClick={handleSearch}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article._id} className="border border-gray-200 rounded-lg p-4 shadow-md">
            {article.images?.length > 0 && (
              <img src={article.images[0]} alt={article.title} className="w-full h-48 object-cover rounded-lg" />
            )}
            <h3 className="text-lg font-semibold mt-2">{article.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{article.description.substring(0, 100)}...</p>

            <div className="flex items-center mt-3 space-x-4">
              <button onClick={() => handleLikeDislike(article._id, "like")} className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm">
                <ThumbsUp size={18} className="text-gray-500 hover:text-green-600" />
                <span>{article?.likedBy?.length || 0}</span>
              </button>

              <button onClick={() => handleLikeDislike(article._id, "dislike")} className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm">
                <ThumbsDown size={18} className="text-gray-500 hover:text-red-600" />
                <span>{article?.dislikedBy?.length || 0}</span>
              </button>

              <button onClick={() => handleBlock(article._id)} className="text-red-500 hover:text-red-700 text-sm">
                Block
              </button>
            </div>

            <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={() => openModal(article)}>
              Read More
            </button>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="mt-10 flex justify-center">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 mx-2 bg-blue-500 text-white hover:bg-blue-600">
          Previous
        </button>
        <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 mx-2 bg-blue-500 text-white hover:bg-blue-600">
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

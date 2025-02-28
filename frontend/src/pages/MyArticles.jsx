import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ThumbsUp, ThumbsDown , Edit, Trash2 , XCircle } from "lucide-react"
import Swal from "sweetalert2"; 
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const MyArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const token = localStorage.getItem('accessToken')
      const [showModal, setShowModal] = useState(false);
      const [selectedArticle, setSelectedArticle] = useState(null);
    

    useEffect(() => {
        fetchArticle();
    }, []);

    const fetchArticle = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axiosInstance.get(`/articles/articles/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            console.log("API Response:", response.data); 
            setArticles(response.data.articles || []);
        } catch (err) {
            console.error("Error fetching articles:", err);
            setError("Failed to load articles. Please try again.");
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (articleId) => {
    
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });
    
        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/articles/dele/${articleId}` ,{
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                });
    
                if (response.data.success) {
                    setArticles(prevArticles => prevArticles.filter(article => article._id !== articleId));
                    Swal.fire("Deleted!", "Your article has been deleted.", "success");
                } else {
                    Swal.fire("Error!", "Failed to delete article.", "error");
                }
            } catch (error) {
                console.error("Error deleting article:", error);
                Swal.fire("Error!", "Something went wrong.", "error");
            }
        }
    };

    const handleEditClick = (article) => {
        setEditingArticle({
            ...article,
            tags: article.tags ? article.tags.join(", ") : "", 
            images: article.images || [], 
        });
        setIsModalOpen(true);
    };
    

    const handleUpdateArticle = async () => {
        try {
            const formData = new FormData();
            formData.append("title", editingArticle.title);
            formData.append("description", editingArticle.description);
            formData.append("category", editingArticle.category);
            formData.append("tags", editingArticle.tags);
            editingArticle.images.forEach((image, index) => {
                formData.append(`existingImages[${index}]`, image);
            });
            if (editingArticle.newImages) {
                editingArticle.newImages.forEach((file) => {
                    formData.append("newImages", file);
                });
            }
            const response = await axiosInstance.put(
                `/articles/update/${editingArticle._id}`,
                formData,
                {
                    headers: { 
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}` 
                    },
                }
            );
            if (response.data.success) {
                setArticles((prevArticles) =>
                    prevArticles.map((article) =>
                        article._id === editingArticle._id ? { ...article, ...response.data.article } : article
                    )
                );
                setIsModalOpen(false);
                Swal.fire("Success!", "Article updated successfully.", "success");
            } else {
                Swal.fire("Error!", "Failed to update article.", "error");
            }
        } catch (error) {
            console.error("Error updating article:", error);
            Swal.fire("Error!", "Something went wrong.", "error");
        }
    };
    const handleRemoveExistingImage = (index) => {
        const updatedImages = editingArticle.images.filter((_, i) => i !== index);
        setEditingArticle({ ...editingArticle, images: updatedImages });
    }; 
    const handleNewImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setEditingArticle({ ...editingArticle, newImages: files });
    };


    const openModal = (article) => {
        setSelectedArticle(article);
        setShowModal(true);
      };
    
      const closeModal = () => {
        setShowModal(false);
        setSelectedArticle(null);
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
                              
                                <img 
                                src={article.images[0]}
                                  alt={article.title} 
                                  className="w-full h-48 object-cover"
                                  onError={(e) => e.target.src = "/placeholder.svg"} 
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                           
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{article.category}</span>
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                           
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

              <button
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              onClick={() => openModal(article)}
            >
              Read More
            </button>

         
                 <div className="flex justify-end mt-4 space-x-3">
                                <button
                                   onClick={() => handleEditClick(article)} 
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
            {isModalOpen && (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-[700px]"> {/* Increased width */}
            <h2 className="text-xl font-semibold mb-4">Edit Article</h2>

            <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
            <input
                type="text"
                value={editingArticle?.title || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                className="w-full p-2 border rounded"
            />

            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
                value={editingArticle?.description || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, description: e.target.value })}
                className="w-full p-2 border rounded"
            />

            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
                value={editingArticle?.category || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                className="w-full p-2 border rounded"
            >
                <option value="Tech">Tech</option>
                <option value="Health">Health</option>
                <option value="Business">Business</option>
                <option value="Lifestyle">Lifestyle</option>
            </select>

            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Tags</label>
            <input
                type="text"
                value={editingArticle?.tags || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, tags: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter tags separated by commas"
            />

            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Images</label>
            <div className="flex flex-wrap gap-2">
                {editingArticle?.images?.map((image, index) => (
                    <div key={index} className="relative">
                        <img   src={image}  alt="Article" className="w-20 h-20 object-cover rounded" />
                        <button
                            className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                            onClick={() => handleRemoveExistingImage(index)}
                        >
                            ✖
                        </button>
                    </div>
                ))}
            </div>

            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Upload New Images</label>
            <input
                type="file"
                multiple
                onChange={handleNewImageUpload}
                className="w-full p-2 border rounded"
            />

            <div className="flex justify-end mt-4">
                <button onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-400 text-white rounded">
                    Cancel
                </button>
                <button onClick={handleUpdateArticle} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Save
                </button>
            </div>
        </div>
    </div>
)}


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

export default MyArticles;

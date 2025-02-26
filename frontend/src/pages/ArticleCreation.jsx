
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"
import axiosInstance from "../utils/axiosInstance"

const ArticleCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    images: [],
  })

  const [previews, setPreviews] = useState([])
  const [message, setMessage] = useState("")
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/articles/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setMessage("Failed to load categories.")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }))

      // Create preview URLs for new images
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previews[index])
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("tags", formData.tags);
    data.append("author", localStorage.getItem("userId")); // Fetch userId from localStorage
  
    formData.images.forEach((image) => {
      data.append("images", image); // Append each image
    });
  
    try {
      const response = await axiosInstance.post("/articles/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setMessage(response.data.message);
      setFormData({ title: "", description: "", category: "", tags: "", images: [] });
      setPreviews([]);
      navigate('/myarticles')
      
    } catch (error) {
      console.error("Error creating article:", error);
      setMessage("Failed to create article.");
    }
  };

  

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [previews])

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Create New Article</h2>
      {message && <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            className="w-full p-2 border rounded-md"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            className="w-full p-2 border rounded-md"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Images</label>
          <input
            type="file"
            className="w-full p-2 border rounded-md"
            name="images"
            onChange={handleFileChange}
            multiple
            accept="image/*"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md 
                   hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default ArticleCreation


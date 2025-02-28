import Article from "../models/Article.js";
import Category from '../models/Category.js'
import User from '../models/User.js'
import mongoose  from "mongoose";
import { v2 as cloudinary } from "cloudinary";

export const createArticle = async (req, res) => {
  try {
      console.log("📤 Received Article Creation Request");
      console.log("📥 Request Body:", req.body);

      const { title, description, category, tags, author } = req.body;

      // ✅ Check if `author` exists before proceeding
      if (!author) {
          return res.status(400).json({ success: false, message: "Author is required." });
      }

      if (!req.files || req.files.length === 0) {
          return res.status(400).json({ success: false, message: "No images uploaded" });
      }

      // ✅ Upload images to Cloudinary
      let uploadedImages = [];
      for (const file of req.files) {
          try {
              console.log("⏳ Uploading file to Cloudinary:", file.path);
              const result = await cloudinary.uploader.upload(file.path, {
                  folder: "articles",
                  resource_type: "image",
              });
              uploadedImages.push(result.secure_url);
          } catch (uploadError) {
              console.error("❌ Cloudinary Upload Error:", uploadError);
              return res.status(500).json({ success: false, message: "Cloudinary upload failed", error: uploadError.message });
          }
      }

      // ✅ Ensure tags are properly formatted
      const tagArray = tags ? tags.split(",").map(tag => tag.trim()) : [];

      // ✅ Create the new article
      const article = new Article({
          title,
          description,
          category,
          tags: tagArray,
          author,  // ✅ Ensure `author` is saved
          images: uploadedImages, // ✅ Save Cloudinary URLs
      });

      await article.save();
      console.log("✅ Article created successfully:", article);

      res.json({ success: true, article });
  } catch (error) {
      console.error("❌ Article Creation Error:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

  export const getCategories =  async (req , res) => {
    try {
      const categories = await Category.find().sort({ createdAt: -1 }); 
      console.log("cat" , categories)
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  export const getArticlesByUserId = async (req , res) => {
    try {
      const { userId } = req.params;
      console.log("userId",userId)

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      const articles = await Article.find({ author: userId }).sort({ createdAt: -1 });
  
      if (!articles.length) {
        return res.status(200).json({ message: "No articles found for this user." });
      }
      console.log("arti" , articles)
      res.status(200).json({ articles });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  export const deleteArticle = async (req , res) => {
    try {
      const { articleId } = req.params;
     console.log("article Id" , articleId)
      const deletedArticle = await Article.findByIdAndDelete( articleId );

      if (!deletedArticle) {
          return res.status(404).json({ success: false, message: "Article not found" });
      }
      res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
  }

  export const updateArticle = async (req, res) => {
    try {
        console.log("🔹 Received update request for article ID:", req.params.id);
        console.log("📤 Request Body:", req.body);
        console.log("📸 Uploaded Files:", req.files);

        const { title, description, category, tags, existingImages } = req.body;
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        let parsedExistingImages = [];
        if (existingImages) {
            try {
                parsedExistingImages = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
            } catch (err) {
                console.error("❌ Error parsing existingImages:", err);
                return res.status(400).json({ success: false, message: "Invalid image data" });
            }
        }

        // Store the existing images (Cloudinary URLs)
        article.images = parsedExistingImages;

        // Handle new images uploaded via "newImages"
        if (req.files && req.files.length > 0) {
            try {
                const uploadedImages = await Promise.all(
                    req.files.map(async (file) => {
                        console.log("⏳ Uploading file to Cloudinary:", file.path);
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: "articles",
                            resource_type: "image",
                        });
                        console.log("✅ Cloudinary Upload Success:", result.secure_url);
                        return result.secure_url; // Store only the Cloudinary URL
                    })
                );
                article.images.push(...uploadedImages);
            } catch (uploadError) {
                console.error("❌ Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // Update article details
        article.title = title;
        article.description = description;
        article.category = category;
        article.tags = tags ? tags.split(",").map(tag => tag.trim()) : [];

        await article.save();
        console.log("✅ Article updated successfully:", article);

        res.json({ success: true, article });
    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getDashboardArticles = async (req, res) => {
  try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }
      const { preferences } = user;

      if (!preferences || preferences.length === 0) {
          return res.json({ success: true, articles: [] });
      }
      const articles = await Article.find({
          category: { $in: preferences },  
          blockBy: { $ne: userId }      
      }).sort({ createdAt: -1 }); 
      res.json({ success: true, articles });
  } catch (error) {
      console.error("Get Dashboard Articles Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const likeOrDislikeArticle = async (req, res) => {
  console.log("body" , req.body)
  const { articleId, action } = req.body; 

  try {
      const article = await Article.findById(articleId);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (action === "like") {
          article.likes += 1;
      } else if (action === "dislike") {
          article.disLikes += 1;
      }

      await article.save();
      res.json({ likes: article.likes, dislikes: article.dislikes });
  } catch (error) {
      res.status(500).json({ message: "Error updating likes/dislikes" });
  }
};

export const blockArticle = async (req, res) => {
  const { userId, articleId } = req.body;

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const article = await Article.findById(articleId);
      if (!article) return res.status(404).json({ message: "Article not found" });
      if (!article.blockBy.includes(userId)) {
          article.blockBy.push(userId);
          await article.save();
      }

      res.json({ message: "Article blocked successfully", blockBy: article.blockBy });
  } catch (error) {
      res.status(500).json({ message: "Error blocking article", error: error.message });
  }
};



import Article from "../models/Article.js";
import Category from '../models/Category.js'
import User from '../models/User.js'
import mongoose  from "mongoose";
import { v2 as cloudinary } from "cloudinary";

export const createArticle = async (req, res) => {
  try {
      console.log(" Received Article Creation Request");
      console.log(" Request Body:", req.body);

      const { title, description, category, tags, author } = req.body;

   
      if (!author) {
          return res.status(400).json({ success: false, message: "Author is required." });
      }

      if (!req.files || req.files.length === 0) {
          return res.status(400).json({ success: false, message: "No images uploaded" });
      }

  
      let uploadedImages = [];
      for (const file of req.files) {
          try {
              console.log(" Uploading file to Cloudinary:", file.path);
              const result = await cloudinary.uploader.upload(file.path, {
                  folder: "articles",
                  resource_type: "image",
              });
              uploadedImages.push(result.secure_url);
          } catch (uploadError) {
              console.error(" Cloudinary Upload Error:", uploadError);
              return res.status(500).json({ success: false, message: "Cloudinary upload failed", error: uploadError.message });
          }
      }

    
      const tagArray = tags ? tags.split(",").map(tag => tag.trim()) : [];

    
      const article = new Article({
          title,
          description,
          category,
          tags: tagArray,
          author,  
          images: uploadedImages, 
      });

      await article.save();
      console.log(" Article created successfully:", article);

      res.json({ success: true, article });
  } catch (error) {
      console.error(" Article Creation Error:", error);
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
        console.log(" Received update request for article ID:", req.params.id);
        console.log(" Request Body:", req.body);
        console.log(" Uploaded Files:", req.files);

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
                console.error(" Error parsing existingImages:", err);
                return res.status(400).json({ success: false, message: "Invalid image data" });
            }
        }

       
        article.images = parsedExistingImages;
        if (req.files && req.files.length > 0) {
            try {
                const uploadedImages = await Promise.all(
                    req.files.map(async (file) => {
                        console.log(" Uploading file to Cloudinary:", file.path);
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: "articles",
                            resource_type: "image",
                        });
                        console.log(" Cloudinary Upload Success:", result.secure_url);
                        return result.secure_url; 
                    })
                );
                article.images.push(...uploadedImages);
            } catch (uploadError) {
                console.error(" Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }
        article.title = title;
        article.description = description;
        article.category = category;
        article.tags = tags ? tags.split(",").map(tag => tag.trim()) : [];

        await article.save();
        console.log(" Article updated successfully:", article);

        res.json({ success: true, article });
    } catch (error) {
        console.error(" Update Error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getDashboardArticles = async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
  
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Get user preferences
      const { preferences } = user;
      if (!preferences || preferences.length === 0) {
        return res.json({ success: true, articles: [], totalPages: 0, currentPage: page });
      }
  
      // Build query for filtering
      const query = {
        category: { $in: preferences },
        blockBy: { $ne: userId },
        ...(search && {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ],
        }),
      };
  
      // Get total number of articles
      const totalArticles = await Article.countDocuments(query);
      const totalPages = Math.ceil(totalArticles / limit);
  
      // Fetch paginated articles
      const articles = await Article.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
  
      // Send response
      res.json({
        success: true,
        articles,
        totalPages,
        currentPage: page,
      });
  
    } catch (error) {
      console.error("Get Dashboard Articles Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  


  export const likeOrDislikeArticle = async (req, res) => {
    console.log("req.user:", req.user);  // Debugging

    const { articleId, action } = req.body;
    const userId = req.user?.id; 

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const article = await Article.findById(articleId);
        if (!article) return res.status(404).json({ message: "Article not found" });

        if (!article.likedBy) article.likedBy = [];
        if (!article.dislikedBy) article.dislikedBy = [];

        const likedIndex = article.likedBy.indexOf(userId);
        const dislikedIndex = article.dislikedBy.indexOf(userId);

        if (action === "like") {
            if (likedIndex === -1) {
                article.likes += 1;
                article.likedBy.push(userId);

                if (dislikedIndex !== -1) {
                    article.disLikes -= 1;
                    article.dislikedBy.splice(dislikedIndex, 1);
                }
            }
        } else if (action === "dislike") {
            if (dislikedIndex === -1) {
                article.disLikes += 1;
                article.dislikedBy.push(userId);

                if (likedIndex !== -1) {
                    article.likes -= 1;
                    article.likedBy.splice(likedIndex, 1);
                }
            }
        }

        await article.save();
        res.json({ likes: article.likes, disLikes: article.disLikes });

    } catch (error) {
        res.status(500).json({ message: "Error updating likes/dislikes", error });
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



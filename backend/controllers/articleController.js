import Article from "../models/Article.js";
import Category from '../models/Category.js'
import mongoose  from "mongoose";
// Create a new article
export const createArticle = async (req, res) => {
  try {
    const { title, description, category, tags, author } = req.body;
    const imageUrls = req.files.map((file) => `uploads/${file.filename}`); // Save file paths

    const newArticle = new Article({
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(","),
      images: imageUrls, // Store image URLs as an array
      author
    });

    await newArticle.save();
    res.status(201).json({ message: "Article created successfully", article: newArticle });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


  export const getCategories =  async (req , res) => {
    try {
      const categories = await Category.find().sort({ createdAt: -1 }); // Fetch all categories
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
  
      // Find all articles where the author matches the given userId
      const articles = await Article.find({ author: userId }).sort({ createdAt: -1 });
  
      if (!articles.length) {
        return res.status(404).json({ message: "No articles found for this user." });
      }
      console.log("arti" , articles)
      res.status(200).json({ articles });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
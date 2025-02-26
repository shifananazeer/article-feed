import Article from "../models/Article.js";

// Create a new article
export const createArticle = async (req, res) => { 
    try {
      let imageUrl = "";
  
      // `req.file.location` contains the S3 image URL (multer-s3 handles it)
      if (req.file) {
        imageUrl = req.file.location;
      }
  
      const { title, description, category, tags ,author } = req.body;
  
      const newArticle = new Article({
        title,
        description,
        category,
        tags: Array.isArray(tags) ? tags : tags.split(","), // Fixed syntax
        imageUrl,
        author
      });
  
      await newArticle.save();
      res.status(201).json({ message: "Article created successfully", article: newArticle });
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
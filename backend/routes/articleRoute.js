import express from "express";
import upload from "../utils/upload.js"; 
import { createArticle  , getCategories , getArticlesByUserId} from "../controllers/articleController.js";

const router = express.Router();

router.post("/create", upload.array("images", 5), createArticle); 
router.get('/categories' , getCategories)
router.get("/articles/:userId", getArticlesByUserId)

export default router;

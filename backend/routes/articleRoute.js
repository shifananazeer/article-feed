import express from "express";
import upload from "../utils/upload.js"; 
import { createArticle  , getCategories , getArticlesByUserId ,deleteArticle ,updateArticle, getDashboardArticles ,likeOrDislikeArticle , blockArticle} from "../controllers/articleController.js";

const router = express.Router();

router.post("/create", upload.array("images", 5), createArticle); 
router.get('/categories' , getCategories)
router.get("/articles/:userId", getArticlesByUserId)
router.delete('/dele/:articleId' , deleteArticle)
router.put("/update/:id", upload.array("newImages", 5), updateArticle)
router.get('/prefrences/:userId' , getDashboardArticles)
router.post("/like-dislike", likeOrDislikeArticle);
router.post("/block", blockArticle);

export default router;

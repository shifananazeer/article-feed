import express from "express";
import upload from "../utils/upload.js"; 
import { createArticle  , getCategories , getArticlesByUserId ,deleteArticle ,updateArticle, getDashboardArticles ,likeOrDislikeArticle , blockArticle} from "../controllers/articleController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", upload.array("images", 5), createArticle); 
router.get('/categories' , getCategories)
router.get("/articles/:userId",authenticateUser, getArticlesByUserId)
router.delete('/dele/:articleId' ,authenticateUser, deleteArticle)
router.put("/update/:id", upload.array("newImages", 5), updateArticle)
router.get('/prefrences/:userId' ,authenticateUser, getDashboardArticles)
router.post("/like-dislike",authenticateUser, likeOrDislikeArticle);
router.post("/block",authenticateUser, blockArticle);

export default router;

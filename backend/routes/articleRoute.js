import express from "express";
import upload from "../utils/upload.js"; 
import { createArticle } from "../controllers/articleController.js";

const router = express.Router();

router.post("/create", upload.single("image"), createArticle);

export default router;

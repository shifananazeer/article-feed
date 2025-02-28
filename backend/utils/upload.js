import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary"; // Ensure Cloudinary is imported

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "articles",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });

export default upload; // ✅ Add this line

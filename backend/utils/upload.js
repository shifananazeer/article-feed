import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// AWS S3 Configuration
const s3 = new aws.S3({
  region: process.env.AWS_REGION, // FIXED: Used correct variable
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // FIXED: Match .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // FIXED: Match .env
});

// Configure Multer-S3 for automatic file uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read", // Make files publicly accessible
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `articles/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload; // FIXED: Use ES Modules

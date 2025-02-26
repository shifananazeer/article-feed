import express from 'express';
import { register, verifyOTP  , login , refreshAccessToken} from '../controllers/authController.js';

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post('/login', login);
router.post("/refresh-token", refreshAccessToken);

export default router;

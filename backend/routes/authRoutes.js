import express from 'express';
import { register, verifyOTP  , login , refreshAccessToken , updateUserDetails , resetPassword, getUserDetails} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post('/login', login);
router.post("/refresh-token", refreshAccessToken);
router.put("/users/:userId",authenticateUser, updateUserDetails);
router.put("/reset-password/:userId",authenticateUser, resetPassword);
router.get('/userDetails/:userId' ,authenticateUser, getUserDetails)


export default router;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; // Ensure you have this function

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, dob, password, confirmPassword, preferences } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email or Phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // ✅ Hash password

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            dob,
            password: hashedPassword,
            preferences,
            otp,
            otpExpiresAt,
            isVerified: false,
        });

        await newUser.save();
        await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);

        res.status(201).json({ message: "OTP sent to email, verify to activate account" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user);

        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
        res.status(200).json({ message: "Account verified", accessToken });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;
        console.log("body", emailOrPhone)

        // Check if user exists using email or phone
        const user = await User.findOne({ 
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] 
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: "Account not verified. Please verify your email." });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Store refresh token in cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.status(200).json({ message: "Login successful", accessToken  , refreshToken});

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
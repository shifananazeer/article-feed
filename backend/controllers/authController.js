import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; 
import STATUS_CODES from '../constants/statusCode.js';
import MESSAGES from '../constants/messages.js';

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
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message:MESSAGES.PASSWORD_ERROR });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.EXIST });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

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

        res.status(STATUS_CODES.CREATED).json({ message:MESSAGES.OTP_SEND });
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_SERVER_ERROR, error });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message:MESSAGES.INVALID_OTP });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user);

        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
        res.status(STATUS_CODES.OK).json({ message:MESSAGES.VERIFIED, accessToken  , refreshToken , userId: user._id})

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_SERVER_ERROR, error });
    }
};

export const login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;
        console.log("body", emailOrPhone , password)
        const user = await User.findOne({ 
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] 
        });

        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUNT });
        }
        if (!user.isVerified) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.NOT_VERIFIED });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message:MESSAGES.CREDENTIAL_ERROR });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.status(STATUS_CODES.OK).json({ message:MESSAGES.LOGIN_SUCCESS , accessToken  , refreshToken ,userId: user._id});

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message:MESSAGES.INTERNAL_SERVER_ERROR, error });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHERIZED });
      }
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(STATUS_CODES.FORBIDDEN).json({ message: MESSAGES.UNAUTHERIZED});
        }
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(STATUS_CODES.NOT_FOUND).json({ message:MESSAGES.USER_NOT_FOUNT });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  
        res.status(STATUS_CODES.OK).json({ accessToken, refreshToken: newRefreshToken });
      });
  
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_SERVER_ERROR, error });
    }
  };


  export const updateUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, phone, dob, preferences } = req.body; 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.dob = dob;
        if (preferences) {
            user.preferences = preferences; 
        }
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error("Update User Details Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.USER_NOT_FOUNT});
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message:MESSAGES.PASSWORD_ERROR});
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message:  MESSAGES.RESET_SUCCESS});
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("userId" , userId)
        const user = await User.findById(userId).select("-password"); 
        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.USER_NOT_FOUNT });
        }
        console.log("user" , user)
        res.json({ success: true, user });
    } catch (error) {
        console.error("Get User Details Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message:MESSAGES.INTERNAL_SERVER_ERROR });
    }
};
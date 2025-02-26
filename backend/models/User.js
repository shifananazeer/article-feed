import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  preferences: { type: [String], required: true },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default model("User", UserSchema);

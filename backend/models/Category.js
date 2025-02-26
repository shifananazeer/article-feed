import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Category", categorySchema);

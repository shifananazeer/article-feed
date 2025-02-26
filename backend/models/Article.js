import mongoose, { Schema, model } from "mongoose";

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    images: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    likes:{type:Number , default:0},
    disLikes:{type:Number , default:0},
    blockBy:[{type: Schema.Types.ObjectId}],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Article", articleSchema);

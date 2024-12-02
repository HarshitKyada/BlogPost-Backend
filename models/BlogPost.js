const mongoose = require("mongoose");
const { Schema } = mongoose;

const contentBlockSchema = new Schema({
  type: {
    type: String,
    enum: ["heading", "paragraph", "image", "affiliate-link"],
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.type === "heading" || this.type === "paragraph";
    },
  },
  imageUrl: String, // Store the base64 string here
  binaryData: String, // For images (base64 string)
  link: String, // For affiliate link
});

const blogPostSchema = new Schema({
  title: { type: String, required: true },
  featuredImage: { type: String, required: true }, // Base64 string
  featuredImageBinary: { type: String },
  contentBlocks: [contentBlockSchema],
  createdAt: { type: Date, default: Date.now },
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;

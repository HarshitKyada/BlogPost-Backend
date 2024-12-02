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
      // Require content only for "heading" and "paragraph" types
      return this.type === "heading" || this.type === "paragraph";
    },
  },
  imageUrl: String, // For images
  binaryData: String, // For images
  link: String, // For affiliate link
});

const blogPostSchema = new Schema({
  title: { type: String, required: true },
  featuredImage: { type: String, required: true }, // URL to the uploaded image
  featuredImageBinary: { type: String },
  contentBlocks: [contentBlockSchema],
  createdAt: { type: Date, default: Date.now },
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;

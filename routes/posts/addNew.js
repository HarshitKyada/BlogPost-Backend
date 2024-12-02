const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const BlogPost = require("../../models/BlogPost");
const util = require("util");

const router = express.Router();

// Handle image upload in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "contentImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { title, contentBlocks } = req.body;

      // Convert featured image to base64
      const featuredImageBuffer = req.files["featuredImage"]?.[0]?.buffer;
      const featuredImageBase64 = featuredImageBuffer
        ? featuredImageBuffer.toString("base64")
        : null;

      let parsedContentBlocks = [];
      if (contentBlocks) {
        try {
          parsedContentBlocks = JSON.parse(contentBlocks);

          // Convert content images to base64
          const contentImages = req.files["contentImages"] || [];
          let imageIndex = 0;

          parsedContentBlocks = parsedContentBlocks.map((block) => {
            if (block.type === "image" && contentImages[imageIndex]) {
              const imageBuffer = contentImages[imageIndex].buffer;
              block.imageUrl = imageBuffer.toString("base64");
              imageIndex++;
            }
            return block;
          });
        } catch (error) {
          return res.status(400).json({
            error: "Invalid contentBlocks data: must be a valid JSON string",
          });
        }
      }

      const newBlogPost = new BlogPost({
        title,
        featuredImage: featuredImageBase64,
        contentBlocks: parsedContentBlocks,
      });

      await newBlogPost.save();
      res.status(201).json({
        message: "Blog post created successfully",
        data: newBlogPost,
      });
    } catch (error) {
      console.error("Error creating blog post:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;

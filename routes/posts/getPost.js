const express = require("express");
const fs = require("fs");
const path = require("path");
const BlogPost = require("../../models/BlogPost");

const router = express.Router();

router.get("/getblog/:id?", async (req, res) => {
  const blogId = req.params.id;

  if (blogId) {
    try {
      const blogPost = await BlogPost.findById(blogId);

      if (!blogPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Return the base64 binary data as part of the contentBlocks
      blogPost.contentBlocks = blogPost.contentBlocks.map((block) => {
        if (block.type === "image" && block.imageUrl) {
          block.binaryData = block.imageUrl; // base64 data
        }
        return block;
      });

      // Add binary data for featuredImage
      if (blogPost.featuredImage) {
        blogPost.featuredImageBinary = blogPost.featuredImage; // base64 data
      }

      return res.json({
        data: blogPost,
        success: true,
        message: "Blog post fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    try {
      const blogPosts = await BlogPost.find();

      if (!blogPosts || blogPosts.length === 0) {
        return res.status(404).json({ error: "No blog posts found" });
      }

      // Add binary data for all featuredImages
      const processedPosts = blogPosts.map((post) => {
        if (post.featuredImage) {
          post.featuredImageBinary = post.featuredImage; // base64 data
        }
        return post;
      });

      return res.json({
        data: processedPosts,
        success: true,
        message: "All blog posts fetched successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Internal server error" });
    }
  }
});

module.exports = router;

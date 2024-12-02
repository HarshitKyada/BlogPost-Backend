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

      // Add binary data to contentBlocks
      blogPost.contentBlocks = await Promise.all(
        blogPost.contentBlocks.map(async (block) => {
          if (block.type === "image") {
            const filePath = path.resolve(
              __dirname,
              "../../uploads",
              path.basename(block.imageUrl)
            );

            if (fs.existsSync(filePath)) {
              try {
                const imageBuffer = fs.readFileSync(filePath);
                block.binaryData = imageBuffer.toString("base64");
              } catch (error) {
                console.error("Error reading file:", error);
                block.binaryData = null;
              }
            } else {
              block.binaryData = null;
            }
          }
          return block;
        })
      );

      // Add binary data for featuredImage
      if (blogPost.featuredImage) {
        const featuredImagePath = path.resolve(
          __dirname,
          "../../uploads",
          path.basename(blogPost.featuredImage)
        );

        if (fs.existsSync(featuredImagePath)) {
          try {
            const featuredImageBuffer = fs.readFileSync(featuredImagePath);
            blogPost.featuredImageBinary =
              featuredImageBuffer.toString("base64");
          } catch (error) {
            console.error("Error reading featured image:", error);
            blogPost.featuredImageBinary = null;
          }
        } else {
          blogPost.featuredImageBinary = null;
        }
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

      const processedPosts = await Promise.all(
        blogPosts.map(async (post) => {
          if (post.featuredImage) {
            const featuredImagePath = path.resolve(
              __dirname,
              "../../uploads",
              path.basename(post.featuredImage)
            );

            if (fs.existsSync(featuredImagePath)) {
              try {
                const featuredImageBuffer = fs.readFileSync(featuredImagePath);
                post.featuredImageBinary =
                  featuredImageBuffer.toString("base64");
              } catch (error) {
                console.error("Error reading featured image:", error);
                post.featuredImageBinary = null;
              }
            } else {
              post.featuredImageBinary = null;
            }
          }
          return post;
        })
      );

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

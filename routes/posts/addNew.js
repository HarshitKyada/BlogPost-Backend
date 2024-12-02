const express = require("express");
const multer = require("multer");
const path = require("path");
const BlogPost = require("../../models/BlogPost");
const fs = require("fs");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

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

      const featuredImage = req.files["featuredImage"]?.[0]?.path;

      let parsedContentBlocks = [];
      if (contentBlocks) {
        try {
          parsedContentBlocks = JSON.parse(contentBlocks);

          const contentImages = req.files["contentImages"] || [];
          let imageIndex = 0;
          parsedContentBlocks = parsedContentBlocks.map((block) => {
            if (block.type === "image" && contentImages[imageIndex]) {
              block.imageUrl = contentImages[imageIndex].path;
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
        featuredImage,
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

// Serve static files for images
router.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

module.exports = router;

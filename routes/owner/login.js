// routes/login.js
const express = require("express");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../../models/OwnerProfile");

const router = express.Router();

router.post("/owner/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email (case-insensitive search)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, // Case-insensitive search
    });

    if (user) {
      // Check if the password is valid
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Check if the user already has a token
        if (!user.token) {
          // Generate a new token if none exists
          user.token = crypto.randomBytes(64).toString("hex");
        }

        // Generate a new uniqueId if it doesn't exist
        const uniqueId = user.uniqueId || uuidv4(); // Generate new uniqueId only if it doesn't exist

        // Update user with uniqueId if it's new
        if (!user.uniqueId) {
          user.uniqueId = uniqueId;
        }

        await user.save(); // Save any changes to the user

        return res.status(200).json({
          success: true,
          message: `Login successful, ${user.name}`,
          user: {
            name: user.name,
            email: user.email,
            token: user.token,
            uniqueId: user.uniqueId,
          },
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Login failed",
          error: "Incorrect password",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Login failed",
        error: "User not found",
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;

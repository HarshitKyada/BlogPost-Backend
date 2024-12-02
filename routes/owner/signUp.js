const express = require("express");
const OwnerProfile = require("../../models/OwnerProfile");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/owner/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existingUser = await OwnerProfile.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const ownerProfile = new OwnerProfile({
      name: name,
      email: email,
      password: hashedPassword,
    });

    await ownerProfile.save();

    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

module.exports = router;

const express = require("express");
const AuthChecker = require("../../component/common/AuthChecker");
const router = express.Router();

router.post("/sync/:id", async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;
  const isAuth = await AuthChecker(token, id);

  if (!isAuth) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user login required",
    });
  }
  try {
    return res.status(200).json({
      success: true,
      message: "Sync successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

module.exports = router;

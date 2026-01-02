const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {upload} = require('../middlewares/uploadMiddleware')
const { registerUser, loginUser,  getUserInfo, googleAuth} = require("../controllers/authController");
const { uploadProfileImage  } = require("../controllers/authController");


const router = express.Router();

router.post("/register",upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect ,getUserInfo);
router.post("/google", googleAuth);
router.post("/upload-image",protect, upload.single("image"), uploadProfileImage);



module.exports = router;





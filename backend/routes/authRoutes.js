const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {upload} = require('../middlewares/uploadMiddleware')
const { registerUser, loginUser,  getUserInfo,logout } = require("../controllers/authController");
const { uploadProfileImage } = require("../controllers/authController");


const router = express.Router();

router.post("/register",upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect ,getUserInfo);

router.post("/upload-image", upload.single("image"), uploadProfileImage);



module.exports = router;






const User = require("../models/User");
const jwt = require("jsonwebtoken");


 const generateToken = (id) => {
     return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "12h",});
 }

 //register user 
 exports.registerUser = async (req, res) => {

    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    
    try{
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
         // Check if an image was uploaded via Multer
        let profileImageUrl;
        if (req.file) {
            profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
          const user = await User.create({ 
            name, 
            email, 
            password,
            profileImageUrl: profileImageUrl || undefined 
        });

            res.status(201).json({
                user : {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl : user.profileImageUrl ,
            },
                token: generateToken(user._id),
            });
        
    }catch (error) {
        res.status(500).json({ message: "Server error"  });
    }
    };


    
 //login user 
 exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    //validation : check all fields are filled
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            user,
            _id: user._id,
            name: user.name,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
 };
 //get user 
 exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); //exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }

    
 };

exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImageUrl: profileImageUrl },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Image uploaded successfully",
            profileImageUrl,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during upload", error: error.message });
    }
};




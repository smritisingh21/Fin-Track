const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
      profileImageUrl: {
        type: String,
        default: "", // You can provide a default avatar URL here
    },
}, {
    timestamps: true,
});

//hashing password before saving

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
       return next();
    }
    // const salt = await bcrypt.genSalt(10); //generating salt , adds random string to password before hashing
    this.password = await bcrypt.hash(this.password, 10); //hashing the password with salt
});


UserSchema.methods.matchPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); //comparing entered password with hashed password
}

module.exports = mongoose.model("User", UserSchema);

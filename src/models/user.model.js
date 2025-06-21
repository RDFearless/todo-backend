import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: [true, "Fullname is required"],
            trim: true,
            minLength: [2, "Fullname must be at least 2 characters"],
            maxLength: [50, "Fullname can't be more than 50 characters"]
        },
        
        email: {
            type: String,
            required: [true, "email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email address"
            ]
        },
        
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
            minLength: [3, "Username must be at least 3 characters"],
            maxLength: [20, "Username can't be more than 20 characters"],
            match: [
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            ]
        },
        
        password: {
            type: String,
            required: [true, "password is required"]
        },
        
        refreshToken: {
            type: String
        },
        
        collections: [{
            type: Schema.Types.ObjectId,
            ref: "Collection"
        }]
    }, { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordValid = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

export const User = mongoose.model("User", userSchema);
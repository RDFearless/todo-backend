import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {
    validateFullname, 
    validateUsername,
    validateEmail,
    validatePassword
} from "../utils/validations.js"
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return {refreshToken, accessToken};
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to generate tokens");
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const {fullname, username, email, password} = req.body;
    
    validateFullname(fullname);
    validateUsername(username);
    validateEmail(email);
    validatePassword(password);
    
    const userExists = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    );
    if(userExists) {
        throw new ApiError(400, "User already exixts, please log in");
    }
    
    const user = await User.create({
        fullname: fullname.trim(),
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password
    });
    if(!user) {
        throw new ApiError(500, "Server error while registering user");
    }
    
    // rmv pass and token from response
    const registeredUser = await User.findById(user._id).select("-password -refreshToken -collections");
    
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            registeredUser,
            "New user registered"
        )
    );
});

const loginUser = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body;
    
    if(!username && !email) {
        throw new ApiError(400, "both username and email can't be empty");
    }
    
    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    );
    
    if(!user) {
        throw new ApiError(404, "User not found");
    }
    
    // password validation
    if(!password) {
        throw new ApiError(400, "password can't be empty");
    }
    const isPasswordCorrect = await user.isPasswordValid(password);
    if(!isPasswordCorrect) {
        throw new ApiError(403, "Invalid credentials");
    }
    
    // tokens
    const {refreshToken, accessToken} = await generateAccessAndRefreshToken(user._id);
    
    const loggedUser = await User.findById(user._id).select("-password -refreshToken");
    
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            loggedUser,
            "User logged in"
        )
    );
});

const logoutUser = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        
        await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
        
        const options = {
            httpOnly: true,
            secure: true
        }
        
        return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out"
            )
        );
    } catch (error) {
        console.error("Logout error:", error);
        throw new ApiError(500, "Failed to logout due to server error");
    }
});

const accessRefreshToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized");
    }
    
    const decodedToken = jwt.verify(
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET
    );
    
    try {
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        if(incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(403, "Refresh Token is expired or used");
        }
        
        const {refreshToken, accessToken} = await generateAccessAndRefreshToken(user._id);
            
        const options = {
            httpOnly: true,
            secure: true
        };
        
        return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {},
                "New token generated"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body; 
    
    validatePassword(oldPassword);
    validatePassword(newPassword);
    
    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from old password");
    }
    
    const user = await User.findById(req.user._id);
    
    const isPasswordCorrect = await user.isPasswordValid(oldPassword);
    if(!isPasswordCorrect) { 
        throw new ApiError(403, "Invalid old password");
    }
    
    user.password = newPassword;
    await user.save({ validateBeforeSave: false }); 
    
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const updateUserInfo = asyncHandler( async (req, res) => {
    const {fullname, username, email} = req.body;
    if(!fullname && !username && !email) {
        throw new ApiError(400, "All fields can't be empty");
    }
    
    const updatedInfo = {};
    if(fullname) {
        validateFullname(fullname);
        updatedInfo.fullname = fullname;
    }
    if(username) {
        validateUsername(username);
        updatedInfo.username = username;
    }
    if(email) {
        validateFullname(email);
        updatedInfo.email = email;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updatedInfo
        }, { new: true }
    ).select("-password -refreshToken -collections");
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedUser, 
            "User info updated"
        )
    );
})

const getCurrentUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Current user fetched"
        )
    );
});

const getUserCollections = asyncHandler( async (req, res) => {
    const { collections } = await User.findById(req.user._id);
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                length: collections.length,
                collections: collections
            },
            "User collections fetched"
        )
    );
});




export { 
    registerUser,
    loginUser,
    logoutUser,
    accessRefreshToken,
    changeCurrentPassword,
    updateUserInfo,
    getCurrentUser,
    getUserCollections
}
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


const generateAccessAndRefreshToken = async (user) => {
    try {
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
    const {refreshToken, accessToken} = await generateAccessAndRefreshToken(user);
    
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
    
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    
})

const updateUserInfo = asyncHandler( async (req, res) => {
      
})

const getCurrentUser = asyncHandler( async (req, res) => {
    
})

const getUserCollections = asyncHandler( async (req, res) => {
    
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
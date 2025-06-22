import { ApiError } from "./ApiError.js";

function validateFullname (fullname) {
    if (!fullname) {
        throw new ApiError(400, "Fullname is required");
    }
    
    if (fullname.trim().length < 2) {
        throw new ApiError(400, "Fullname must be at least 2 characters long");
    }
    
    if (fullname.trim().length > 50) {
        throw new ApiError(400, "Fullname cannot exceed 50 characters");
    }
};

function validateUsername (username) {
    if (!username) {
        throw new ApiError(400, "Username is required");
    }
    
    if (username.trim().length < 3) {
        throw new ApiError(400, "Username must be at least 3 characters long");
    }
    
    if (username.trim().length > 20) {
        throw new ApiError(400, "Username cannot exceed 20 characters");
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new ApiError(400, "Username can only contain letters, numbers, and underscores");
    }
};

function validateEmail (email) {
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please enter a valid email address");
    }
};

function validatePassword (password) {
    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }
};

export{validateFullname, validateUsername, validateEmail, validatePassword}
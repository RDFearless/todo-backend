import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"

const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        
        if(!token) {
            throw new ApiError(401, "Unauthorized");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const userId = decodedToken?.payload._id;
        const user = await User.findById(userId).select("-password -refresh");
        
        if(!user) {
            throw new ApiError(404, "User not found");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid token");
    }
});

export {verifyJWT}
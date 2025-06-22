import express from "express"
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    accessRefreshToken, 
    changeCurrentPassword, 
    updateUserInfo, 
    getCurrentUser, 
    getUserCollections 
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router;
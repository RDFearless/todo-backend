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
router.route("/refresh-token").post(accessRefreshToken)

// secured routes
router.use(verifyJWT);

router.route("/logout").post(logoutUser)
router.route("/change-password").patch(changeCurrentPassword)
router.route("/profile")
.get(getCurrentUser)
.patch(updateUserInfo)
router.route("/collections").get(getUserCollections)

export default router;
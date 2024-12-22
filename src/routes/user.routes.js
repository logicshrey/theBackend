import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { register, login, logout, updateUserDetails, updateAvatar, updateCoverImage, changePassword, getWatchHistory, addVideoToWatchHistory } from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router()

router.route("/register").post(upload.fields(
    [
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]
), register)

router.route("/login").post(login)

// Secured Routes

router.route("/logout").post(verifyJWT, logout)
router.route("/update-user-details").patch(verifyJWT, updateUserDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/update-coverimage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/change-password").patch(verifyJWT, changePassword)
router.route("/watch-history").get(verifyJWT,getWatchHistory)
router.route("/add-video-to-watch-history/:videoId").post(verifyJWT,addVideoToWatchHistory)

export default router
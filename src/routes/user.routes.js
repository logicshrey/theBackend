import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { register, login, logout } from "../controllers/user.controllers.js"
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

export default router
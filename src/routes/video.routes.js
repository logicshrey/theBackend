import { Router } from "express";
import { deleteVideo, editVideoDetails, getAllVideos, getVideoDetailsById, updateVideoViews, uploadVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

// Secured Routes

router.route("/upload-video").post(verifyJWT,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
   ]),
   uploadVideo
)

router.route("/delete-video/:videoId").post(verifyJWT,deleteVideo)
router.route("/edit-video-details/:videoId").patch(verifyJWT,editVideoDetails)
router.route("/get-video-by-id/:videoId").get(verifyJWT,getVideoDetailsById)
router.route("/get-all-videos").get(verifyJWT,getAllVideos)
router.route("/update-views/:videoId").patch(verifyJWT,updateVideoViews)

export default router
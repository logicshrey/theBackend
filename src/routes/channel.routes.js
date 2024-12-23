import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addSubscriber, getChannelInfo } from "../controllers/channel.controllers.js";

const router = Router()

router.route("/get-channel-info/:channelId").get(verifyJWT,getChannelInfo)
router.route("/add-subscriber/:channelId").post(verifyJWT,addSubscriber)

export default router
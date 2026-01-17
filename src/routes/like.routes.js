import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike,toggleCommentLike,toggleTweetLike } from "../controllers/like.controller.js";

const router=Router()
router.use(verifyJWT); //all routes below this middleware are secured

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

export default router;
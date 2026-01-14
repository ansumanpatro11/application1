import { publishVideo } from "../controllers/video.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router();
router.use(verifyJWT); //all routes below this middleware are secured
router.route("/publish").post(upload.fields([
    {name:'video',maxCount:1},{name:'thumbnail',maxCount:1}
]),publishVideo);

export default router;
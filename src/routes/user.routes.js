import { Router } from "express";
import { registerUser, login, logout, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route('/login').post(login)

// Secured Routes
router.route('/logout').get(verifyJWT, logout)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changePassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)
router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route('/channel/:username').get(verifyJWT, getUserChannelProfile)
// TODO: routes testing remaining
router.route('/history').get(verifyJWT, getWatchHistory)

export default router
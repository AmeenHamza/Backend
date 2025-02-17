import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const alreadyLiked = await Like.findOne({ video: videoId });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, { isLiked: false })
            )
    }

    const like = await Like.create({ video: videoId, likedBy: req.user?._id })

    if (!like) {
        throw new ApiError(500, "Something went wrong while like the video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: true })
        )

})

// TODO: Checking of route
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(400, "Comment Id is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment id")
    }

    const alreadyLiked = await Like.findById({ comment: commentId });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, { isLiked: false })
            )
    }

    const like = await Like.create({ comment: commentId, likedBy: req.user?._id })

    if (!like) {
        throw new ApiError(500, "Something went wrong while like the comment")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: true })
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const alreadyLiked = await Like.findById({ tweet: tweetId });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, { isLiked: false })
            )
    }

    const like = await Like.create({ tweet: tweetId, likedBy: req.user?._id })

    if (!like) {
        throw new ApiError(500, "Something went wrong while like the tweet")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: true })
        )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    // { INFO: This is not necessary
                    //     $unwind: "$ownerDetails",
                    // },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            // INFO: aese bhi kia jasakta h lekin usko destructure krna zyada behtr h
            // $project: {
            //     _id: 0,
            //     likedVideo: 1
            // }
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideosAggegate,
                "liked videos fetched successfully"
            )
        );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    console.log(userId);
    const pipeline = [];

    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"] //search only on title, desc
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // fetch videos only that are set isPublished as true
    pipeline.push({ $match: { isPublished: true } });

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    let thumbnailLocalPath;

    if (req.files) {
        if (Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            if (req.files.thumbnail[0].path) {
                thumbnailLocalPath = req.files.thumbnail[0].path;
            }
        }
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        thumbnailLocalPath = "";
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video) {
        throw new ApiError(400, "Video file is required");
    }

    const createdVideo = await Video.create({
        title,
        videoFile: {
            url: video?.secure_url,
            public_id: video?.public_id
        },
        thumbnail: {
            url: thumbnail?.secure_url,
            public_id: thumbnail?.public_id
        } || "",
        description,
        duration: video?.duration,
        owner: req.user?._id
    })

    const videoUploaded = await Video.findById(createdVideo._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res.status(201).json(
        new ApiResponse(200, createdVideo, "Video upload Successfully")
    )


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiResponse(400, "Video Id is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is not correct")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber"
                                        ]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            // TODO: update avatar.url
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id,
                                "$likes.likedBy"
                            ]
                        },
                        then: true,
                        else: false
                    }
                },
                commentsCount: {
                    $size: "$comments"
                },
                isComment: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?.id,
                                "$comments.owner"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: {
                    content: 1,
                    createdAt: 1,
                    owner: 1,
                    _id: 1
                },
                owner: 1,
                likesCount: 1,
                isLiked: 1,
                commentsCount: 1,
                isComment: 1
            }
        }
    ])

    if (!video) {
        throw new ApiError(500, "Failed to fetch video")
    }

    // Increment views if video fetched successfully
    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    })

    // Add this video to user watch history
    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: {
            watchHistory: videoId
        },
    },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, video[0], "Video details fetched successfully")
        )

})

const getVideoOwner = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const videoAggregation = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            coverImage: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                owner: 1
            }
        }
    ]);

    const videoWithOwner = videoAggregation[0];

    if (!videoWithOwner) {
        throw new ApiError(404, "Video not found");
    }

    const owner = videoWithOwner.owner;

    if (!owner._id.equals(req.user?._id)) {
        throw new ApiError(400, "Unauthorized owner");
    }

    return res.status(200).json(
        new ApiResponse(200, owner, "Owner fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    if (!title || !description) {
        throw new ApiError(400, "All fields are required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(400, "You can't edit this video as you are not the owner")
    }

    const thumbnailToDelete = video.thumbnail.public_id;

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading an thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description: description,
                thumbnail: {
                    url: thumbnail?.secure_url,
                    public_id: thumbnail?.public_id
                }
            }
        },
        {
            new: true
        }
    )

    if (!updateVideo) {
        throw new ApiError(500, "Failed to update video please try again")
    }

    if (updateVideo) {
        await deleteOnCloudinary(thumbnailToDelete);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "VideoId is missing")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Incorrect video id")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(400, "Video not found!");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedVideo, "Video deleted successfully")
    );

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video Id is missing");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Incorrect video id");
    }

    // First, find the video to get the current publish status
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }

    // Toggle the publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished // Use the status from the found video
            }
        },
        {
            new: true
        }
    );

    if (!updatedVideo) {
        throw new ApiError(400, "Failed to update publish status");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Publish status updated successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoOwner
}
import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const check = await Video.findById(videoId);

    if (!check) {
        throw new ApiError(400, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'comment',
                as: 'likes'
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                isLiked: 1
            }
        }
    ]);

    // Use the aggregatePaginate method for pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video id is missing")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Failed to add comment please try again")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment post successfully")
        )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
        throw new ApiError(400, "comment id is missing")
    }

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: content
        }
    },
        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(400, "No video found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "comment id is missing")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can delete their comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(500, "Something went wrong while deleting the comment")
    }

    if (!deletedComment) {
        throw new ApiError(400, "Comment not found!")
    }

    // INFO: delete all likes of this comment
    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, { commentId }, "Comment deleted successfully")
        );

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
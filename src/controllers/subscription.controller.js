import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params // channel id is also a user_id
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "Channel Id is required")
    }

    const checkChannel = await User.findById(channelId);

    if (!checkChannel) {
        throw new ApiError(400, "Channel not found!")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: checkChannel?._id,
        channel: channelId
    });

    if (isSubscribed) {
        await Subscription.deleteOne({
            subscriber: req.user?._id,
            channel: channelId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Unsubscribed successfull")
            )
    }

    const subscriber = await Subscription.create({ subscriber: req.user?._id, channel: channelId });

    if (!subscriber) {
        throw new ApiError(500, "Something went wrong while toggle subscription")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscriber, "User subscribed successfully")
        )
})

// controller to return subscriber list of a channel
// TODO: After adding more subscribers again check this api
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetched successfully"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannels",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos"
                        }
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos"
                            }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                subscribedChannels: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, channels, "Subscribed channels fetched successfully")
        )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
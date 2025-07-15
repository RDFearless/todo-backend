import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Collection } from "../models/collection.model.js"
import { User } from "../models/user.model.js"
import { Todo } from "../models/todo.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"

const isOwner = (req, collection) => {
    return String(collection.owner) === String(req.user._id)
}

const validateUserAndCollectionId = async (req, collectionId) => {
    if(!collectionId || !isValidObjectId(collectionId)) {
        throw new ApiError(400, "invalid collectionId");
    }
    
    const collection = await Collection.findById(collectionId);
    
    if(!collection) {
        throw new ApiError(404, "Collection not found");
    }
    
    // ownership check
    if(!isOwner(req, collection)) {
        throw new ApiError(403, "Unauthorized request");
    }
    
    return collection;
}

const createCollection = asyncHandler( async (req, res) => {
    const {name, description, color} = req.body;
    if(!name?.trim()) {
        throw new ApiError(400, "name can't be empty");
    }
    if(!description?.trim()) {
        throw new ApiError(400, "description can't be empty");
    }
    
    const user = req.user;
    
    const collectionExists = await Collection.exists({ name: name.trim() })
    if(collectionExists) {
        throw new ApiError(400, `Collection with name ${name} already exists`);
    }
    
    const collection = await Collection.create(
        {
            name: name.trim(),
            description: description.trim(),
            owner: user._id,
            color
        }
    );
    if(!collection) {
        throw new ApiError(500, "Internal server error while creating new collection");
    }
    
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            collection,
            "New collection created"
        )
    );
});

const getCollection = asyncHandler( async (req, res) => {
    const { collectionId } = req.params;
    if(!collectionId || !isValidObjectId(collectionId)) {
        throw new ApiError(400, "invalid collectionId");
    }    
    
    const collection = await Collection.findById(collectionId);
    if(!collection) {
        throw new ApiError(404, "collection not found");
    }
    
    // hiding private collections from other users
    if(collection.isPrivate && !isOwner(req, collection)) {
        throw new ApiError(403, "this collection is private");
    }
    
    // else, collection isNotPrivate || current user is owner 
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            collection,
            "Collection fetched"
        )
    );
});

const updateCollection = asyncHandler( async (req, res) => {
    const { collectionId } = req.params;
    await validateUserAndCollectionId(req, collectionId);
    
    const {name, description, color} = req.body;
    const updatedInfo = {};
    if(name) {
        updatedInfo.name = name.trim();
    }
    if(description) {
        updatedInfo.description = description.trim();
    }
    if(color) {
        updatedInfo.color = color;
    }
    
    const updatedCollection = await Collection.findByIdAndUpdate(
        collectionId,
        { $set: updatedInfo },
        { new: true }
    );
    if(!updatedCollection) {
        throw new ApiError(500, "Internal server error while updatimg collection information");
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedCollection,
            "Collection information updated"
        )
    );
});

const deleteCollection = asyncHandler( async (req, res) => {
    const { collectionId } = req.params;
    await validateUserAndCollectionId(req, collectionId);
    
    const deleteResponse = await Collection.deleteOne({ _id: collectionId });
    if(!deleteResponse.deletedCount) {
        throw new ApiError(500, "Internal server error while deleting collection");
    }
    
    // Delete all todos inside this collection
    try {
        await Todo.deleteMany({ parentCollection: collectionId });
    } catch (error) {
        console.error("Error deleting todos in collection:", error);
        throw new ApiError(500, "Internal server error while deleting todos in collection");
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { isDeleted: true },
            "Collection deleted"
        )
    );
});

const getCollectionsByUsername = asyncHandler( async (req, res) => {
    const { username } = req.query;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required in query");
    }
    const user = await User.findOne({ username: username.trim().toLowerCase() }).lean();
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    // Only return public collections of the user
    const collections = await Collection.find(
        { 
            owner: user._id, 
            isPrivate: false 
        }
    ).select("-isPrivate -owner").lean();
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                owner: username,
                totalCollections: collections.length,
                collections
            }, 
            `Collections for user ${username}`
        )
    );
});

const getLoggedInUserCollections = asyncHandler( async (req, res) => {
    const userId = req.user._id;
    const collections = await Collection.find({ owner: userId }).select("-owner");
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                owner: req.user.username,
                totalCollections: collections.length, 
                collections
            }, 
            "Collections for logged in user"
        )
    );
});

const togglePrivacyStatus = asyncHandler( async (req, res) => {
    const {collectionId} = req.params;
    const collection = await validateUserAndCollectionId(req, collectionId);
    
    const status = collection.isPrivate;
    
    await Collection.findByIdAndUpdate(
        collectionId,
        { $set: { isPrivate: !status } },
        { new: true }
    );
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isPrivate: !status},
            "Status Toggled"
        )
    );
});

export {
    createCollection,
    getCollection,
    updateCollection,
    deleteCollection,
    getCollectionsByUsername,
    getLoggedInUserCollections,
    togglePrivacyStatus
}
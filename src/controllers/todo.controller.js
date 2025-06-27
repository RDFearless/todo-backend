import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Collection } from "../models/collection.model.js"
import { Todo } from "../models/todo.model.js"
import { User } from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"

/**
 * Helper function to validate and check access permissions for a todo
 */
const validateTodoAccess = async (req, todoId, requireOwnership = true) => {
    // Validate todo ID
    if (!todoId || !isValidObjectId(todoId)) {
        throw new ApiError(400, "Invalid todo ID");
    }
    
    // Find the todo
    const todo = await Todo.findById(todoId);
    if (!todo) {
        throw new ApiError(404, "Todo not found");
    }
    
    // Check ownership if required
    if (requireOwnership && String(todo.createdBy) !== String(req.user._id)) {
        // Check if user has shared access
        const hasSharedAccess = todo.sharedAccess?.some(
            userId => String(userId) === String(req.user._id)
        );
        
        if (!hasSharedAccess) {
            throw new ApiError(403, "You don't have permission to access this todo");
        }
    }
    
    return todo;
};

/**
 * Helper function to validate collection access
 */
const validateCollectionAccess = async (req, collectionId) => {
    // Validate collection ID
    if (!collectionId || !isValidObjectId(collectionId)) {
        throw new ApiError(400, "Invalid collection ID");
    }
    
    // Find the collection
    const collection = await Collection.findById(collectionId);
    if (!collection) {
        throw new ApiError(404, "Collection not found");
    }
    
    // Check if user has access to this collection
    const isOwner = String(collection.owner) === String(req.user._id);
    
    if (!isOwner && collection.isPrivate) {
        throw new ApiError(403, "You don't have access to this collection");
    }
    
    return collection;
};

const createTodo = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;
    const { title, content } = req.body;
    
    // Validate input
    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }
    
    // Validate collection access
    const collection = await validateCollectionAccess(req, collectionId);
    
    // Check if todo with same title already exists in this collection
    const todoExists = await Todo.exists({
        title: title.trim(),
        parentCollection: collectionId,
        createdBy: req.user._id
    });
    
    if (todoExists) {
        throw new ApiError(400, "A todo with this title already exists in this collection");
    }
    
    // Create the todo
    const todo = await Todo.create({
        title: title.trim(),
        content: content?.trim() || "",
        parentCollection: collectionId,
        createdBy: req.user._id
    });
    
    if (!todo) {
        throw new ApiError(500, "Failed to create todo");
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                todo,
                "Todo created successfully"
            )
        );
});

const getTodosByCollection = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;
    const { completed } = req.query;
    
    // Validate collection access
    await validateCollectionAccess(req, collectionId);
    
    // Build query
    const query = { parentCollection: collectionId };
    
    // Filter by completion status if provided
    if (completed !== undefined) {
        query.completed = completed === "true";
    }
    
    // Find todos
    const todos = await Todo.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .populate("createdBy", "username fullname");
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    collectionId,
                    count: todos.length,
                    todos
                },
                "Todos retrieved successfully"
            )
        );
});

const getTodoById = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    
    // Validate and get todo with access check
    const todo = await validateTodoAccess(req, todoId, true);
    
    // Populate creator information
    const populatedTodo = await Todo.findById(todo._id)
        .populate("createdBy", "username fullname")
        .populate("parentCollection", "name");
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                populatedTodo,
                "Todo retrieved successfully"
            )
        );
});

const updateTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    const { title, content } = req.body;
    
    // Validate and get todo with access check
    const todo = await validateTodoAccess(req, todoId);
    
    // Build update object
    const updateData = {};
    
    if (title?.trim()) {
        updateData.title = title.trim();
        
        // Check if new title conflicts with existing todos
        if (title !== todo.title) {
            const todoExists = await Todo.exists({
                _id: { $ne: todoId }, // Not this todo
                title: title.trim(),
                parentCollection: todo.parentCollection,
                createdBy: req.user._id
            });
            
            if (todoExists) {
                throw new ApiError(400, "A todo with this title already exists in this collection");
            }
        }
    }
    
    if (content !== undefined) {
        updateData.content = content?.trim() || "";
    }
    
    // Update the todo
    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        { $set: updateData },
        { new: true }
    );
    
    if (!updatedTodo) {
        throw new ApiError(500, "Failed to update todo");
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTodo,
                "Todo updated successfully"
            )
        );
});

const deleteTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    
    // Validate and get todo with access check
    await validateTodoAccess(req, todoId, true);
    
    // Delete the todo
    const deleteResult = await Todo.deleteOne({ _id: todoId });
    
    if (!deleteResult.deletedCount) {
        throw new ApiError(500, "Failed to delete todo");
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deleted: true },
                "Todo deleted successfully"
            )
        );
});

const toggleTodoStatus = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    
    // Validate and get todo with access check
    const todo = await validateTodoAccess(req, todoId);
    
    // Toggle status
    const newStatus = !todo.completed;
    
    // Update the todo
    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        { 
            $set: { 
                completed: newStatus,
                completedAt: newStatus ? new Date() : null
            } 
        },
        { new: true }
    );
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTodo,
                `Todo marked as ${newStatus ? 'completed' : 'incomplete'}`
            )
        );
});

const shareTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    const { username } = req.body;
    
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }
    
    // Validate and get todo with access check (must be owner)
    const todo = await validateTodoAccess(req, todoId, true);
    
    // Find user to share with
    const userToShare = await User.findOne({ username: username.trim().toLowerCase() });
    
    if (!userToShare) {
        throw new ApiError(404, "User not found");
    }
    
    // Check if already shared
    if (todo.sharedAccess.includes(userToShare._id)) {
        throw new ApiError(400, "Todo already shared with this user");
    }
    
    // Add user to shared access
    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        { $addToSet: { sharedAccess: userToShare._id } },
        { new: true }
    );
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTodo,
                `Todo shared with ${username}`
            )
        );
});

const unshareTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    const { username } = req.body;
    
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }
    
    // Validate and get todo with access check (must be owner)
    const todo = await validateTodoAccess(req, todoId, true);
    
    // Find user to unshare
    const userToUnshare = await User.findOne({ username: username.trim().toLowerCase() });
    
    if (!userToUnshare) {
        throw new ApiError(404, "User not found");
    }
    
    // Check if unshared
    if (!todo.sharedAccess.includes(userToUnshare._id)) {
        throw new ApiError(400, "Todo already unshared with this user");
    }
    
    // Remove user from shared access
    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        { $pull: { sharedAccess: userToUnshare._id } },
        { new: true }
    );
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTodo,
                `Todo unshared with ${username}`
            )
        );
});

export {
    createTodo,
    getTodosByCollection,
    getTodoById,
    updateTodo,
    deleteTodo,
    toggleTodoStatus,
    shareTodo,
    unshareTodo
}
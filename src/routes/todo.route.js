import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { 
    createTodo, 
    deleteTodo,
    getTodoById, 
    getTodosByCollection, 
    shareTodo, 
    toggleTodoStatus, 
    unshareTodo, 
    updateTodo 
} from "../controllers/todo.controller.js";

const router = express.Router();


router.use(verifyJWT);

router.route("/:collectionId")
.post(createTodo)

router.route("/getTodos/:collectionId")
.get(getTodosByCollection)

router.route("/:todoId")
.get(getTodoById)
.put(updateTodo)
.delete(deleteTodo)

router.route("/:todoId/toggle").patch(toggleTodoStatus)

router.route("/:todoId/share").patch(shareTodo)
router.route("/:todoId/unshare").patch(unshareTodo)


export default router;
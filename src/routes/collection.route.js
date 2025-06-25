import express from "express"
import { 
    createCollection, 
    deleteCollection, 
    getCollection, 
    getCollectionsByUsername, 
    getLoggedInUserCollections,
    togglePrivacyStatus,
    updateCollection 
} from "../controllers/collection.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.use(verifyJWT); 

router.route("/user").get(getCollectionsByUsername)

router.route("/me")
.get(getLoggedInUserCollections)
.post(createCollection)

router.route("/me/:collectionId/privacy")
.patch(togglePrivacyStatus)

router.route("/me/:collectionId")
.put(updateCollection)
.delete(deleteCollection)

router.route("/:collectionId").get(getCollection)


export default router;
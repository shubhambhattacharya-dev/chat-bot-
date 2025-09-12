import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost  } from '../controllers/post.controller.js';
import {commentPost} from '../controllers/post.controller.js';
import { deletePost } from '../controllers/post.controller.js';
import { likeUnlikePost } from '../controllers/post.controller.js';
import { getAllPosts } from '../controllers/post.controller.js';


const router = express.Router();  

router.get("/all",protectRoute,getAllPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute,commentPost);
router.delete("/:id", protectRoute, deletePost);

export default router;  

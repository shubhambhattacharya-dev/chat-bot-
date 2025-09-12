import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost  } from '../controllers/post.controller.js';
import {commentPost} from '../controllers/post.controller.js';
import { deletePost } from '../controllers/post.controller.js';
import { likeUnlikePost } from '../controllers/post.controller.js';
import { getAllPosts } from '../controllers/post.controller.js';
import { getLikedPosts } from '../controllers/post.controller.js';
import { getFollowingPosts } from '../controllers/post.controller.js';
import { userPosts } from '../controllers/post.controller.js';


const router = express.Router();  


router.get("/all",protectRoute,getAllPosts);
router.get("/likes/:id" ,protectRoute,getLikedPosts);
router.get("/following",protectRoute,getFollowingPosts);
router.get("/user/:username",protectRoute,userPosts);

router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute,commentPost);
router.delete("/:id", protectRoute, deletePost);

export default router;  

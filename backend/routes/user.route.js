import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile } from '../controllers/user.controller.js';
import { followUnfollowUser } from '../controllers/user.controller.js';
import { getSuggestedUsers } from '../controllers/user.controller.js';
import { updateUser } from '../controllers/user.controller.js';
import { getFollowers } from '../controllers/user.controller.js';
import { getFollowing } from '../controllers/user.controller.js';

const router=express.Router();
router.get('/profile/:username',protectRoute,getUserProfile);
router.get('/suggestion',protectRoute,getSuggestedUsers);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/follow/:id',protectRoute,followUnfollowUser);
router.post('/update',protectRoute,updateUser);
router.get('/followers/:username', protectRoute, getFollowers);
router.get('/following/:username', protectRoute, getFollowing);

export default router;


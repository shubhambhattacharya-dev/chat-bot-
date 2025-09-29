import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { createNotification } from './notofication.controller.js';

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!text && !img) {
            return res.status(400).json({ error: "Post can't be empty" });
        }

        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        });
        await newPost.save();

        return res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in createPost controller:", error);
    }
}

export const deletePost = async(req,res)=>{
    try {
        const post =await Post.findById(req.params.id);
        if(!post){
            return  res.status(404).json({error:"Post not  found"})

        }
        if(post.user.toString() !==req.user._id.toString()){
            return res.status(403).json({error:"You are not authorized to delete this post"})
        }
        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Post deleted successfully"})
    } catch (error) {
        console.log("Error in deletePost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const commentPost=async(req,res)=>{
    try {
        const {text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id;
       if(!text){
        return res.status(400).json({error:"Text field is required"})
       }
       const post=await Post.findById(postId);
       if(!post){
        return res.status(404).json({error:"Post not found"})
       }
      const comment={user:userId,text};
      post.comments.push(comment);
      await post.save();

      await createNotification({ from: userId, to: post.user, type: "comment", post: postId });

      return res.status(200).json({message:"Comment added successfully"})
    } catch (error) {
        console.log("Error in commentPost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const likeUnlikePost=async(req,res)=>{
    try {
        const userId =req.user._id;
        const {id:postId}=req.params;
        console.log("Like request received - UserId:", userId.toString(), "PostId:", postId);
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        const userLikedPost=post.likes.some(id => id.equals(userId));
        console.log("Like check - UserId:", userId.toString(), "Post likes:", post.likes.map(id => id.toString()), "Already liked:", userLikedPost);
        if(userLikedPost){
            // Remove like
            post.likes = post.likes.filter(id => !id.equals(userId));
            await post.save();
            await User.updateOne({_id:userId},{$pull:{likedPosts:postId}});
            console.log("Unliked - New likes:", post.likes.map(id => id.toString()));
            res.status(200).json({message:"Post unliked successfully", likes: post.likes})

        }else{
            // Add like
            post.likes.push(userId);
            await post.save();
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}});
            console.log("Liked - New likes:", post.likes.map(id => id.toString()));

            await createNotification({ from: userId, to: post.user, type: "like", post: postId });
           return res.status(200).json({ message: "Post liked successfully & notification sent", likes: post.likes });

        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const getAllPosts=async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        if(posts.length===0){
            return res.status(200).json([]);
        }
        return res.status(200).json({posts})
    } catch (error) {
        console.log("Error in getAllPosts controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }
}

export const getLikedPosts=async(req,res)=>{
     const userId=req.params.id;
  try {
   const user=await User.findById(userId);
   if(!user){
    return res.status(404).json({error:"User not found"})
   }
    const likedPosts=await Post.find({likes:{$in:[userId]}}).sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"comments.user",
        select:"-password"
    })
    if(likedPosts.length===0){
        return res.status(200).json([]);
    }
    return res.status(200).json({likedPosts})
  } catch (error) {
    console.log("Error in getLikedPosts controller:", error);
    res.status(500).json({ error: "Internal Server Error" });

  }
}

export const getFollowingPosts=async (req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
       const following=user.following;

       const feedPosts=await Post.find({user:{$in:following}}).sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"

       }).populate({
        path:"comments.user",
        select:"-password"
       })
       if(feedPosts.length===0){
        return res.status(200).json([]);
       }
       return res.status(200).json({feedPosts})
    } catch (error) {
        console.log("Error in getFollowingPosts controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const userPosts=async(req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username});
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        const posts=await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        if(posts.length===0){
            return res.status(200).json([]);
        }
        return res.status(200).json({posts})
    } catch (error) {
        console.log( "Error in userPosts controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }
}

export const repostPost=async(req,res)=>{
    try {
        const userId =req.user._id;
        const {id:postId}=req.params;
        console.log("Repost request received - UserId:", userId.toString(), "PostId:", postId);
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        const userRepostedPost=post.reposts.some(id => id.equals(userId));
        console.log("Repost check - UserId:", userId.toString(), "Post reposts:", post.reposts.map(id => id.toString()), "Already reposted:", userRepostedPost);
        if(userRepostedPost){
            // Remove repost
            post.reposts = post.reposts.filter(id => !id.equals(userId));
            await post.save();
            console.log("Unreposted - New reposts:", post.reposts.map(id => id.toString()));
            res.status(200).json({message:"Post unreposted successfully", reposts: post.reposts})
        }else{
            // Add repost
            post.reposts.push(userId);
            await post.save();
            console.log("Reposted - New reposts:", post.reposts.map(id => id.toString()));

            await createNotification({ from: userId, to: post.user, type: "repost", post: postId });
            res.status(200).json({message:"Post reposted successfully", reposts: post.reposts})
        }
    } catch (error) {
        console.log("Error in repostPost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const bookmarkPost=async(req,res)=>{
    try {
        const userId =req.user._id;
        const {id:postId}=req.params;
        console.log("Bookmark request received - UserId:", userId.toString(), "PostId:", postId);
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        const userBookmarkedPost=post.bookmarks.some(id => id.equals(userId));
        console.log("Bookmark check - UserId:", userId.toString(), "Post bookmarks:", post.bookmarks.map(id => id.toString()), "Already bookmarked:", userBookmarkedPost);
        if(userBookmarkedPost){
            // Remove bookmark
            post.bookmarks = post.bookmarks.filter(id => !id.equals(userId));
            await post.save();
            console.log("Unbookmarked - New bookmarks:", post.bookmarks.map(id => id.toString()));
            res.status(200).json({message:"Post unbookmarked successfully", bookmarks: post.bookmarks})
        }else{
            // Add bookmark
            post.bookmarks.push(userId);
            await post.save();
            console.log("Bookmarked - New bookmarks:", post.bookmarks.map(id => id.toString()));

            await createNotification({ from: userId, to: post.user, type: "bookmark", post: postId });
            res.status(200).json({message:"Post bookmarked successfully", bookmarks: post.bookmarks})
        }
    } catch (error) {
        console.log("Error in bookmarkPost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const reportPost=async(req,res)=>{
    try {
        const userId =req.user._id;
        const {id:postId}=req.params;
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }

        await createNotification({ from: userId, to: post.user, type: "report", post: postId });
        res.status(200).json({message:"Post reported successfully"})
    } catch (error) {
        console.log("Error in reportPost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }

}

export const getRepostedPosts=async(req,res)=>{
     const userId=req.params.id;
  try {
   const user=await User.findById(userId);
   if(!user){
    return res.status(404).json({error:"User not found"})
   }
    const repostedPosts=await Post.find({reposts:{$in:[userId]}}).sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"comments.user",
        select:"-password"
    })
    if(repostedPosts.length===0){
        return res.status(200).json([]);
    }
    return res.status(200).json({repostedPosts})
  } catch (error) {
    console.log("Error in getRepostedPosts controller:", error);
    res.status(500).json({ error: "Internal Server Error" });

  }
}

export const getBookmarkedPosts=async(req,res)=>{
     const userId=req.params.id;
  try {
   const user=await User.findById(userId);
   if(!user){
    return res.status(404).json({error:"User not found"})
   }
    const bookmarkedPosts=await Post.find({bookmarks:{$in:[userId]}}).sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"comments.user",
        select:"-password"
    })
    if(bookmarkedPosts.length===0){
        return res.status(200).json([]);
    }
    return res.status(200).json({bookmarkedPosts})
  } catch (error) {
    console.log("Error in getBookmarkedPosts controller:", error);
    res.status(500).json({ error: "Internal Server Error" });

  }
}

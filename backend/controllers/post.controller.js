import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';
import Notification from '../models/notification.model.js';

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
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        const userLikedPost=post.likes.includes(userId);
        if(userLikedPost){
            await post.updateOne({_id:postId},{$pull:{likes:userId}});
            res.status(200).json({message:"Post unliked successfully"})

        }else{

            post.likes.push(userId);
            await post.save();
          

            const notification=new Notification({
                from:userId,
                to:post.user,
                type:"like"
            });
            await notification.save();
           return res.status(200).json({ message: "Post liked successfully & notification sent" });

        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error);
        res.status(500).json({ error: "Internal Server Error" });
        
    }
    
}

export const getAllPosts=async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt:-1});
        if(posts.length===0){
            return res.status(200).json([]);
        }
        return res.status(200).json({posts})
    } catch (error) {
        console.log("Error in getAllPosts controller:", error);
        res.status(500).json({ error: "Internal Server Error" });
        
    }
}
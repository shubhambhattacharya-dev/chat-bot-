import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";


export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  console.log("getUserProfile: looking for username:", username);
  try {
    const user = await User.findOne({ username }).select("-password");
    console.log("getUserProfile: DB query result:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" }); // use consistent key: error
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;


    //tha prevent user from following/unfollowing themselves

    if(id===req.user._id.toString()){
      return res.status(400).json({error:"You can't follow/unfollow yourself"});
    }

  
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

     


    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

  

   
    const isFollowing = currentUser.following.some(
      (followersId) => followersId.toString() === id
    );

    if (isFollowing) {
 
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
    
      
      await User.findByIdAndUpdate(id, { $addToSet: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: id } });
      //notification logic here
     const newNotification = new Notification({
  type: "follow",
  from: req.user._id,
  to: userToModify._id,
});

      await newNotification.save();
      //todo return notification in response
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the list of users I follow
    const usersFollowByMe = await User.findById(userId).select("following");

    // Get 10 random users excluding myself
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }   // if userId is ObjectId, this is fine
        }
      },
      { $sample: { size: 10 } }
    ]);

    // Filter out users I'm already following
    const followingList = usersFollowByMe?.following || [];
    const filteredUsers = users.filter(
      (user) => !followingList.includes(user._id)
    );

    // Pick only 4 suggestions
    const suggestUser = filteredUsers.slice(0, 4);

    // Remove password field from response
    suggestUser.forEach((user) => {
      user.password = undefined; // or delete user.password;
    });

    return res.status(200).json(suggestUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;

  
  let { profileImg, coverImg } = req.body;   

  try {
    const userId = req.user._id; 
    let user = await User.findById(userId);   
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) { 
      return res.status(400).json({ error: "Both current and new password are required to change password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split(".")[0]); 
      }
      // upload to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profileImg); 
      profileImg = uploadResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split(".")[0]); 
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg); 
      coverImg = uploadResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message }); 
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate("followers", "-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user.followers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate("following", "-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user.following);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

import User from "../models/user.model.js";

// Get user profile by username
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

// Follow / Unfollow user by ID
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch both users
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    // If either user does not exist
    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self follow/unfollow
    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow/unfollow yourself" });
    }

    // Check if current user already follows the target user
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

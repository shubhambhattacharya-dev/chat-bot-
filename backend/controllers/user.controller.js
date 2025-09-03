import User from "../models/user.model.js";

export const getUserProfile=async(req,res)=>{
    const {username}=req.params;
      console.log("getUserProfile: looking for username:", username);
    try {
        
        const user=await User.findOne({username}).select("-password");
           console.log("getUserProfile: DB query result:", user);   


        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile:", error);
        return res.status(500).json({error:error.message});
        
    }

}
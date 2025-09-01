import User from '../models/user.model.js';
import { generateTokenandSetCookie} from '../lib/utils/generateToken.js';
import bcrypt from 'bcryptjs';

//signup controller

export const signup=async(req,res)=>{
   try {
    const {fullName,username,email,password}=req.body;

    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({error:"Invalid email format"});
    }

    const existingUsers=await User.findOne({username});
    if(existingUsers){
        return res.status(400).json({error:"Username already exists"});
    }
    
    const existingEmail=await User.findOne({email});
    if(existingEmail){
        return res.status(400).json({error:"Email already exists"});
    }

   if(password.length<6){
  return res.status(400).json({error:"password must be at least 6 characters long"});
}

  //hashpassword
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);

  const newUser=new User({
    fullName,
    username,
    email,
    password:hashedPassword,
  })
   await newUser.save();

  if(newUser){
    generateTokenandSetCookie(newUser._id,res);
   
    res.status(201).json({
        _id:newUser._id,
        fullName:newUser.fullName,
        username:newUser.username,
        email:newUser.email,
        followers:newUser.followers,
        following:newUser.following,
        profileImg:newUser.profileImg,
        coverImg:newUser.coverImg,

    })
  }else{
    res.status(400).json({error:"Invalid user data"});
  }
  
    
   } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({error:"Internal Server error"});
    
   }
}

//login controller

export const login=async(req,res)=>{
   try {
    const {username,password}=req.body;
    const user=await User.findOne({username});
    const ispasswordCorrect=await bcrypt.compare(password,user?.password ||"");
    if(!user || !ispasswordCorrect){
  return res.status(400).json({error:"Invalid username or password"});
}


    generateTokenandSetCookie(user._id,res);
    res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        username:user.username,
        email:user.email,
        followers:user.followers,
        following:user.following,
        profileImg:user.profileImg,
        coverImg:user.coverImg,

    })


    
   } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({error:"Internal Server error"});
    
   }
}

export const logout=async(req,res)=>{
   try {
    
   } catch (error) {
    
   }
}
import jwt from "jsonwebtoken";

export const  generateTokenandSetCookie=(userId,res)=>{

    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'15d',
    });
    res.cookie("jwt",token,{
        maxAge:15*24*60*60*1000, //15 days
        httpOnly:true,//xss attack se bachega jish ko javascript access nhi kr skta hai , only server can access it , ish ko cross site scripting attack se bachaega
        sameSite:"strict", //csrf attack se bachega , cross site request forgery attack se bachega
        secure:process.env.NODE_ENV==="production", //https me hi cookie bheje , production me hi https use krna hai
    })
}
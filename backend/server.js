import express from 'express'
import dotenv from 'dotenv'
import connectMongoDB from '../backend/db/connectMongoDB.js'
import authRoutes from './routes/auth.routes.js'


dotenv.config();

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const port =process.env.PORT || 5000 ;

app.use('/api/auth',authRoutes);

(async()=>{

try {
    await connectMongoDB();
    console.log("Connected to MongoDB");
    app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
   
})
} catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
    
}
})();



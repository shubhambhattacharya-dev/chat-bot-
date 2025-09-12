import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectMongoDB from '../backend/db/connectMongoDB.js';
import { v2 as cloudinary } from 'cloudinary';   

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js'; 

dotenv.config();

cloudinary.config({          
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

(async () => {
    try {
        await connectMongoDB();
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
})();

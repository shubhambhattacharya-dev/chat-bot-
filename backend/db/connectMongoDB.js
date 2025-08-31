import mongoose from "mongoose";

const connctcMongoDB = async () => {
    try {
        const conn=await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
        
    }


}

export default connctcMongoDB;
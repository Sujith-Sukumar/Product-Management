import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        await mongoose.connect('mongodb+srv://sujithkallingalwork:jA9eYvIRyD9ztF8M@cluster0.klvzeyj.mongodb.net/product-management?retryWrites=true&w=majority&appName=Cluster0')
        console.log('mongoDB conected');
        
    } catch (error) {
            console.error(error.message);

    }
}
export default connectDB;
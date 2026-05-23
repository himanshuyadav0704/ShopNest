const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // process.env.MONGO_URI aapki .env file se aayega
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected Successfully`);

 }
  catch (error) {
        console.error(`MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Error aane par server ko band karne ke liye
    }
};

module.exports = connectDB;
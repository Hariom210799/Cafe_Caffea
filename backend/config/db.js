import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("autoIndex", false);  // 🚀 prevents index freeze

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "CafeCaffea",
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

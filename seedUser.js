import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/BlueBlock";

const seedUser = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");

    // Remove existing test user
    await User.deleteOne({ email: "chirag1@example.com" });

    // Create new test user using Mongoose so pre-save triggers
    const user = await User.create({
      name: "Test User",
      email: "chirag1@example.com",
      password: "password123", // pre-save will hash this
      walletAddress: "0x1234567890abcdef",
    });

    console.log("✅ Test user created successfully");
    console.log("Use this to log in:");
    console.log({ email: user.email, password: "password123" });

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    process.exit(1);
  }
};

seedUser();

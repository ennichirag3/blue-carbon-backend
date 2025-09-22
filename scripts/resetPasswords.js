import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const resetPasswords = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/BlueBlock";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find();
    console.log(`Found ${users.length} users`);

    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash("password123", salt);
      await user.save();
      console.log(`✅ Password reset for: ${user.email}`);
    }

    console.log("✅ All passwords reset to 'password123'");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting passwords:", err);
    process.exit(1);
  }
};

resetPasswords();

import mongoose from "mongoose";

const mrvSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  carbonVerified: { type: Number, required: true },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("MRV", mrvSchema);

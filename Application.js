import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: ["Wishlist", "Applied", "Interview", "Offer", "Rejected"], default: "Applied" },
  appliedDate: { type: Date, default: Date.now },
  location: { type: String, trim: true, maxlength: 120, default: "" },
  jobUrl: { type: String, trim: true, maxlength: 500, default: "" },
  notes: { type: String, trim: true, maxlength: 3000, default: "" }
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);

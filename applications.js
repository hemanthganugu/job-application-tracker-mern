import { Router } from "express";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const allowedStatuses = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];
const editableFields = ["company", "role", "status", "appliedDate", "location", "jobUrl", "notes"];

function cleanPayload(body) {
  const payload = {};
  for (const key of editableFields) if (body[key] !== undefined) payload[key] = body[key];
  return payload;
}

router.get("/", async (req, res, next) => {
  try {
    const filter = { user: req.userId };
    if (req.query.status && allowedStatuses.includes(req.query.status)) filter.status = req.query.status;
    const applications = await Application.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(applications);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);
    if (!String(payload.company || "").trim() || !String(payload.role || "").trim()) {
      return res.status(400).json({ message: "Company and role are required." });
    }
    if (payload.status && !allowedStatuses.includes(payload.status)) {
      return res.status(400).json({ message: "Invalid application status." });
    }
    const application = await Application.create({ ...payload, user: req.userId });
    res.status(201).json(application);
  } catch (err) { next(err); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid application ID." });
    const payload = cleanPayload(req.body);
    if (payload.status && !allowedStatuses.includes(payload.status)) return res.status(400).json({ message: "Invalid application status." });
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, payload,
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found." });
    res.json(application);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid application ID." });
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!application) return res.status(404).json({ message: "Application not found." });
    res.json({ message: "Application deleted." });
  } catch (err) { next(err); }
});

export default router;

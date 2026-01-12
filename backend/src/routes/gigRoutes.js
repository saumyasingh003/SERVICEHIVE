import express from "express";
import {
  getGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs,
} from "../controllers/gigController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getGigs);
router.get("/:id", getGigById);

// Protected routes
router.post("/", protect, createGig);
router.put("/:id", protect, updateGig);
router.delete("/:id", protect, deleteGig);
router.get("/user/my-gigs", protect, getMyGigs);

export default router;

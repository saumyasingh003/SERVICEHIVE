import express from "express";
import {
  createBid,
  getBidsForGig,
  hireBid,
  getMyBids,
} from "../controllers/bidController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createBid);


router.get("/my-bids", getMyBids);


router.get("/:gigId", getBidsForGig);


router.patch("/:bidId/hire", hireBid);

export default router;

import mongoose from "mongoose";
import Bid from "../models/Bid.js";
import Gig from "../models/Gig.js";

/**
 * @desc    Submit a bid for a gig
 * @route   POST /api/bids
 * @access  Private
 */
export const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists
    const gig = await Gig.findById(gigId).populate("ownerId", "name email");
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Check if gig is still open
    if (gig.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This gig is no longer accepting bids",
      });
    }

    // Prevent owner from bidding on their own gig
    if (gig.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot bid on your own gig",
      });
    }

    // Check if user has already bid on this gig
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a bid for this gig",
      });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price,
    });

    await bid.populate("freelancerId", "name email");
    await bid.populate("gigId", "title");

    // 🔔 REAL-TIME NOTIFICATION: Notify gig owner about new bid
    const io = req.app.get("io");
    if (io) {
      io.to(gig.ownerId._id.toString()).emit("newBid", {
        type: "new_bid",
        message: `New bid received on "${gig.title}"`,
        title: "New Bid",
        bid: {
          _id: bid._id,
          price: bid.price,
          freelancerName: req.user.name,
          gigTitle: gig.title,
        },
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      bid,
    });
  } catch (error) {
    console.error("Create bid error:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a bid for this gig",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error submitting bid",
    });
  }
};

/**
 * @desc    Get all bids for a specific gig (Owner only)
 * @route   GET /api/bids/:gigId
 * @access  Private
 */
export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Check if user is the owner of the gig
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view bids for this gig",
      });
    }

    const bids = await Bid.find({ gigId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error) {
    console.error("Get bids error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching bids",
    });
  }
};

/**
 * @desc    Hire a freelancer (Accept a bid) with TRANSACTION for race condition prevention
 * @route   PATCH /api/bids/:bidId/hire
 * @access  Private (Gig owner only)
 *
 * BONUS 1: TRANSACTIONAL INTEGRITY (Race Conditions)
 * ===================================================
 * This implementation uses MongoDB Transactions to ensure that if two people
 * (e.g., two admins of a project) click "Hire" on different freelancers at the
 * exact same time, the system only allows one to be hired and prevents the other.
 *
 * How it works:
 * 1. Start a MongoDB session with transaction
 * 2. All read/write operations use the same session
 * 3. Before updating, we check that the gig status is still "open"
 * 4. If another transaction already changed the status, ours will fail
 * 5. MongoDB's write conflict detection ensures atomicity
 * 6. On success: commit transaction
 * 7. On any failure: abort transaction (rollback all changes)
 */
export const hireBid = async (req, res) => {
  // Start a MongoDB session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find the bid with session lock
    const bid = await Bid.findById(bidId)
      .populate("freelancerId", "name email")
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    // Find the gig with session lock - CRITICAL for race condition prevention
    const gig = await Gig.findById(bid.gigId)
      .populate("ownerId", "name email")
      .session(session);

    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Check if user is the owner of the gig
    if (gig.ownerId._id.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Not authorized to hire for this gig",
      });
    }

    // RACE CONDITION CHECK: Verify gig is still open
    // If another transaction already changed this, ours will fail
    if (gig.status !== "open") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "This gig has already been assigned to another freelancer",
      });
    }

    // Check if bid is still pending
    if (bid.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "This bid is no longer pending",
      });
    }

    // ============================================
    // ATOMIC UPDATE OPERATIONS (All or Nothing)
    // ============================================

    // 1. Update the gig status to 'assigned' and set hired freelancer
    const gigUpdateResult = await Gig.findOneAndUpdate(
      {
        _id: gig._id,
        status: "open", // Double-check condition for atomic update
      },
      {
        status: "assigned",
        hiredFreelancerId: bid.freelancerId._id,
      },
      {
        session,
        new: true,
      }
    );

    // If update failed (gig was already assigned by another transaction)
    if (!gigUpdateResult) {
      await session.abortTransaction();
      return res.status(409).json({
        // 409 Conflict
        success: false,
        message:
          "Race condition detected: This gig was just assigned by another request",
      });
    }

    // 2. Update the chosen bid status to 'hired'
    await Bid.findByIdAndUpdate(bidId, { status: "hired" }, { session });

    // 3. Reject all other bids for this gig
    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
      },
      { status: "rejected" },
      { session }
    );

    // Commit the transaction - all operations succeed together
    await session.commitTransaction();

    // Fetch updated data for response
    const updatedBid = await Bid.findById(bidId)
      .populate("freelancerId", "name email")
      .populate("gigId", "title status");

    // 🔔 REAL-TIME NOTIFICATION: Notify freelancer about being hired
    const io = req.app.get("io");
    if (io) {
      // Notify the hired freelancer
      io.to(bid.freelancerId._id.toString()).emit("hired", {
        type: "hired",
        message: `Congratulations! You have been hired for "${gig.title}"!`,
        title: "🎉 You're Hired!",
        gig: {
          _id: gig._id,
          title: gig.title,
          budget: gig.budget,
          ownerName: gig.ownerId.name,
        },
        bid: {
          _id: bid._id,
          price: bid.price,
        },
        timestamp: new Date(),
      });

      // Notify other bidders that they were not selected
      const rejectedBids = await Bid.find({
        gigId: gig._id,
        _id: { $ne: bidId },
      }).populate("freelancerId", "_id");

      rejectedBids.forEach((rejectedBid) => {
        io.to(rejectedBid.freelancerId._id.toString()).emit("bidRejected", {
          type: "bid_rejected",
          message: `Your bid on "${gig.title}" was not selected`,
          title: "Bid Update",
          gigTitle: gig.title,
          timestamp: new Date(),
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Freelancer hired successfully!",
      bid: updatedBid,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Hire bid error:", error.message);

    // Handle write conflict errors specifically
    if (error.code === 112 || error.codeName === "WriteConflict") {
      return res.status(409).json({
        success: false,
        message: "Another hiring operation is in progress. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during hiring process",
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get bids made by current user
 * @route   GET /api/bids/my-bids
 * @access  Private
 */
export const getMyBids = async (req, res) => {
  try {
    console.log("📊 getMyBids called for user:", req.user._id);

    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate("gigId", "title description budget status ownerId")
      .populate({
        path: "gigId",
        populate: {
          path: "ownerId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    console.log("📊 Found bids:", bids.length);

    res.status(200).json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error) {
    console.error("Get my bids error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching your bids",
    });
  }
};

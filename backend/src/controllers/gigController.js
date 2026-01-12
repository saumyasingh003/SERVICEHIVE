import Gig from "../models/Gig.js";

/**
 * @desc    Get all open gigs (with optional search)
 * @route   GET /gigs
 * @access  Public
 */
export const getGigs = async (req, res) => {
  try {
    const { search, status } = req.query;

    // Build query
    let query = {};

    // Filter by status (default to 'open' for public feed)
    if (status) {
      query.status = status;
    }

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const gigs = await Gig.find(query)
      .populate("ownerId", "name email")
      .populate("hiredFreelancerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    console.error("Get gigs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching gigs",
    });
  }
};

/**
 * @desc    Get single gig by ID
 * @route   GET /gigs/:id
 * @access  Public
 */
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("ownerId", "name email")
      .populate("hiredFreelancerId", "name email");

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    res.status(200).json({
      success: true,
      gig,
    });
  } catch (error) {
    console.error("Get gig by ID error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching gig",
    });
  }
};

/**
 * @desc    Create a new gig
 * @route   POST /gigs
 * @access  Private
 */
export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id,
    });

    // Populate owner info before sending response
    await gig.populate("ownerId", "name email");

    res.status(201).json({
      success: true,
      message: "Gig created successfully",
      gig,
    });
  } catch (error) {
    console.error("Create gig error:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating gig",
    });
  }
};

/**
 * @desc    Update a gig
 * @route   PUT /gigs/:id
 * @access  Private (Owner only)
 */
export const updateGig = async (req, res) => {
  try {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Check ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this gig",
      });
    }

    // Prevent updating if already assigned
    if (gig.status === "assigned") {
      return res.status(400).json({
        success: false,
        message: "Cannot update an assigned gig",
      });
    }

    const { title, description, budget } = req.body;

    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { title, description, budget },
      { new: true, runValidators: true }
    ).populate("ownerId", "name email");

    res.status(200).json({
      success: true,
      message: "Gig updated successfully",
      gig,
    });
  } catch (error) {
    console.error("Update gig error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error updating gig",
    });
  }
};

/**
 * @desc    Delete a gig
 * @route   DELETE /gigs/:id
 * @access  Private (Owner only)
 */
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Check ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this gig",
      });
    }

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });
  } catch (error) {
    console.error("Delete gig error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error deleting gig",
    });
  }
};

/**
 * @desc    Get gigs posted by current user
 * @route   GET /gigs/my-gigs
 * @access  Private
 */
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate("ownerId", "name email")
      .populate("hiredFreelancerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    console.error("Get my gigs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching your gigs",
    });
  }
};

import jwt from "jsonwebtoken";

/**
 * Generate JWT token and set it as an HttpOnly cookie
 * @param {Object} res - Express response object
 * @param {String} userId - User's MongoDB ObjectId
 */
export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

/**
 * Clear the JWT cookie (logout)
 * @param {Object} res - Express response object
 */
export const clearToken = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
};

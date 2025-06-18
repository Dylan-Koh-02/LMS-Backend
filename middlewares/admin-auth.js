const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { UnauthorizedError } = require("../utils/errors");
const { failure } = require("../utils/responses");

/**
 * @middleware Admin Authorization
 * @description Verifies JWT token, checks user existence and admin role before granting access.
 *
 * @param {string} req.headers.token - JWT token from the request header
 *
 * @sets {object} req.user - The authenticated user object, if authorized
 * 
 * @returns {void}
 * 
 * @throws {UnauthorizedError} If token is missing, invalid, user does not exist, or user is not an admin
 * @throws {Error} For any other unexpected errors
 */
module.exports = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      throw new UnauthorizedError("Authorization token is required.");
    }
    // Authenticate the token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Get userId from the decoded token
    const { userId } = decoded;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError("User not exists");
    }

    // Authenticate the user role
    if (user.role !== 100) {
      throw new UnauthorizedError("Not authorized as admin.");
    } // If authenticated, set userId in request object
    req.user = user;

    // next() is required to pass control to the next middleware
    next();
  } catch (error) {
    failure(res, error);
  }
};

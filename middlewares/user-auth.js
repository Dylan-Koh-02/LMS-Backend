const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
const { failure } = require('../utils/responses');

/**
 * @middleware User Authentication
 * @description Verifies JWT token and attaches the authenticated user's ID to the request object.
 *
 * @param {string} req.headers.token - JWT token from the request header
 *
 * @sets {string} req.userId - The authenticated user's ID
 * 
 * @returns {void}
 * 
 * @throws {UnauthorizedError} If token is missing or invalid
 * @throws {Error} For any other unexpected errors
 */
module.exports = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      throw new UnauthorizedError('Authorization token is required.')
    }

    // Authenticate the token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Get userId from the decoded token
    const { userId } = decoded;

    // If authenticated, set userId in request object
    req.userId = userId;

    // next() is required to pass control to the next middleware
    next();
  } catch (error) {
    failure(res, error);
  }
};


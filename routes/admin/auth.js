const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { Op } = require("sequelize");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * @route POST /admin/auth/sign_in
 * @description Authenticate an admin user using email or username and password, then return a JWT token.
 *
 * @body {string} login - Admin's email or username (required).
 * @body {string} password - Admin's password (required).
 *
 * @returns {Object} JSON response containing the authentication token.
 *  - token: JWT token valid for 30 days.
 *
 * @response 200 - Login successful and token returned.
 * @throws {BadRequestError} If login or password is missing.
 * @throws {NotFoundError} If the user does not exist.
 * @throws {UnauthorizedError} If password is incorrect or user is not authorized as admin.
 * @throws {Error} For any other unexpected errors.
 */
router.post("/sign_in", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login) {
      throw new BadRequestError("Email/Username is required.");
    }

    if (!password) {
      throw new BadRequestError("Password is required.");
    }

    const condition = {
      where: {
        [Op.or]: [{ email: login }, { username: login }],
      },
    };

    // Check if the user exists by email or username
    const user = await User.findOne(condition);
    if (!user) {
      throw new NotFoundError("User not exists. Login failed");
    }

    // Authenticate the password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Password is incorrect.");
    }

    if (user.role !== 100) {
      throw new UnauthorizedError("Not authorized to access.");
    }

    // Generate Token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.SECRET,
      { expiresIn: "30d" }
    );
    success(res, "Login successfully", { token });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

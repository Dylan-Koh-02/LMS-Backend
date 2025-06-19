const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../utils/errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

/**
 * @route POST /auth/sign_up
 * @description Register a new user account with email, username, nickname and password
 *
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.username - User's username
 * @param {string} req.body.nickname - User's nickname
 * @param {string} req.body.password - User's password
 *
 * @returns {Object} JSON response containing user details (excluding password):
 *  - user: {Object} User object with properties:
 *    - id: {number} User ID
 *    - username: {string} User's username
 *    - email: {string} User's email
 *    - sex: {number} User's gender
 *    - nickname: {string} User's nickname
 *    - company: {string} User's company
 *    - introduce: {string} User's introduction
 *    - avatar: {string} URL to user's avatar
 *    - role: {string} User's role
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *
 * @responsecode 201 - User created successfully
 * @throws {SequelizeValidationError} If email or username already exists
 * @throws {Error} For any other errors during creation
 */
router.post("/sign_up", async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      username: req.body.username,
      nickname: req.body.nickname,
      password: req.body.password,
      sex: 2,
      role: 0,
    };

    const user = await User.create(body); // Create User in database
    delete user.dataValues.password; // Exclude password from response

    success(res, "User is created successfully!", { user }, 201);
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route POST /auth/sign_in
 * @description Authenticate user by email or username and password, and return a JWT token.
 *
 * @param {string} req.body.login - User's email or username used for login
 * @param {string} req.body.password - User's password
 *
 * @returns {Object} JSON response with JWT token:
 * {
 *   token: string
 * }
 *
 * @responsecode 200 - Login successful, token returned
 * @throws {BadRequestError} If login or password is missing
 * @throws {NotFoundError} If user does not exist
 * @throws {UnauthorizedError} If password is incorrect
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

    // Check if user exists by email or username
    const user = await User.findOne(condition);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Authenticate Password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Wrong password.");
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.SECRET,
      { expiresIn: "30d" } // Expires in 30 days
    );
    success(res, "Login successfully!", { token });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

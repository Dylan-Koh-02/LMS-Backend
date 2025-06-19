const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const bcrypt = require("bcryptjs");

/**
 * @route GET /users/me
 * @description Retrieve information about the currently authenticated user.
 *
 * @returns {Object} JSON response containing user details
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
 * @response 200 - User information successfully retrieved.
 * @throws {Error} If there is an issue fetching the user information.
 */
router.get("/me", async function (req, res) {
  try {
    const user = await getUser(req);
    success(res, "User Information is returned", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /users/info
 * @description Update the current authenticated user's information.
 *
 * @param {string} [req.body.nickname] - User's nickname.
 * @param {string} [req.body.sex] - User's gender.
 * @param {string} [req.body.company] - User's company or organization.
 * @param {string} [req.body.introduce] - User's personal introduction or bio.
 * @param {string} [req.body.avatar] - URL or identifier for the user's avatar image.
 *
 * @returns {Object} JSON response containing user details
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
 * @response 200 - User information updated successfully.
 * @throws {Error} If an error occurs during the update process.
 */
router.put("/info", async function (req, res) {
  try {
    const body = {
      nickname: req.body.nickname,
      sex: req.body.sex,
      company: req.body.company,
      introduce: req.body.introduce,
      avatar: req.body.avatar,
    };

    const user = await getUser(req);
    await user.update(body);
    success(res, "User information updated.", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /users/account
 * @description Update the current authenticated user's account information, including email, username, and password.
 *
 * @param {string} [req.body.email] - New email address.
 * @param {string} [req.body.username] - New username.
 * @param {string} req.body.currentPassword - Current password (required for authentication).
 * @param {string} [req.body.password] - New password (optional).
 * @param {string} [req.body.passwordConfirmation] - Confirmation of the new password (must match `password`).
 *
 * @returns {Object} JSON response containing user details
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
 * @response 200 - Account updated successfully.
 * @throws {BadRequestError} If current password is missing, incorrect, or if new password and confirmation do not match.
 * @throws {Error} For any other errors during the update process.
 */
router.put("/account", async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      username: req.body.username,
      currentPassword: req.body.currentPassword,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation,
    };

    if (!body.currentPassword) {
      throw new BadRequestError("Current password is required.");
    }

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestError("Password and confirmation do not match.");
    }

    // With "true" parameter, can retrieve the password field (refer to the method below)
    const user = await getUser(req, true);

    // Authenticate current password
    const isPasswordValid = bcrypt.compareSync(
      body.currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestError("Current password is incorrect.");
    }

    await user.update(body);

    // Exclude password from the response
    delete user.dataValues.password;
    success(res, "Update successfully", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @function getUser
 * @description Public method to retrieve the current user by ID from the request, optionally including the password field.
 *
 * @param {import('express').Request} req - Express request object containing the authenticated user ID.
 * @param {boolean} [showPassword=false] - Whether to include the password field in the returned user object.
 * @returns {Promise<Model<any, TModelAttributes>>} The user model instance.
 * @throws {NotFoundError} If the user with the given ID is not found.
 */
async function getUser(req, showPassword = false) {
  const id = req.userId;

  let condition = {};
  if (!showPassword) {
    condition = {
      attributes: { exclude: ["password"] },
    };
  }

  const user = await User.findByPk(id, condition);
  if (!user) {
    throw new NotFoundError(`User with ID:${id} is not found.`);
  }

  return user;
}

module.exports = router;

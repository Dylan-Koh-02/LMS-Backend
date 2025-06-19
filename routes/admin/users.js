const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /
 * @description Retrieves paginated list of users with optional filtering
 *
 * @query {number} [currentPage=1] - Current page number (1-based)
 * @query {number} [pageSize=10] - Number of items per page
 * @query {string} [email] - Filter by exact email match
 * @query {string} [username] - Filter by exact username match
 * @query {string} [nickname] - Filter by partial nickname match (case-insensitive)
 * @query {string} [role] - Filter by exact role match
 *
 * @returns {Object} Response object containing users and pagination info
 *  - users: {Array<Object>} List of user objects
 *  - pagination: {Object} Pagination metadata
 *    - total: {number} Total number of matching users
 *    - currentPage: {number} Current page number
 *    - pageSize: {number} Number of items per page
 *
 * @response 200 - Users retrieved successfully
 * @throws {Error} For any other errors during retrieval
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;

    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      order: [["id", "DESC"]],
      offset: offset,
      limit: pageSize,
    };

    if (query.email) {
      condition.where = {
        email: {
          [Op.eq]: query.email,
        },
      };
    }

    if (query.username) {
      condition.where = {
        username: {
          [Op.eq]: query.username,
        },
      };
    }

    if (query.nickname) {
      condition.where = {
        nickname: {
          [Op.like]: `%${query.nickname}%`,
        },
      };
    }

    if (query.role) {
      condition.where = {
        role: {
          [Op.eq]: query.role,
        },
      };
    }

    const { count, rows } = await User.findAndCountAll(condition);
    success(res, "Query successful", {
      users: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route GET /:id
 * @description Retrieves user by ID
 *
 * @param {number} req.params.id  - User ID (path parameter)
 *
 * @returns {Object} JSON response containing user details
 *  - user: {Object} User object with properties:
 *    - id: {number} User ID
 *    - username: {string} User's username
 *    - password: {string} User's password (hashed)
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
 * @response 200 - User retrieved successfully
 * @throws {NotFoundError} If user with the specified ID is not found
 * @throws {Error} For any other errors during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const user = await getUser(req);

    success(res, "Query successful", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route POST /
 * @description Creates a new user account
 *
 * @param  {string} req.body.username - Unique username for the new account
 * @param  {string} req.body.email - User's email address
 * @param  {string} req.body.password - Account password
 * @param  {string} req.body.nickname - User's nickname
 * @param  {number} req.body.sex - User's gender
 * @param  {string} [req.body.avatar] - URL to user's avatar image
 * @param  {string} req.body.role - User role
 * @param  {string} [req.body.company] - User's company
 * @param  {string} [req.body.introduce] - User's introduction or bio
 *
 * @returns {Object} JSON response containing created user details
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
 * @throws {SequelizeValidationError} If required fields are missing or invalid or if unique constraints are violated
 * @throws {Error} For any other errors during creation
 */
router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const user = await User.create(body);
    success(res, "Query successful", { user }, 201);
  } catch (error) {
    failure(res, error);
    // res.json({errors: [error.message]})
    // res.json({ error })
  }
});

// router.delete("/:id", async function (req, res) {
//   try {
//     const user = await getUser(req);
//     await user.destroy();
//     success(res, "Delete successful");
//   } catch (error) {
//     failure(res, error);
//   }
// });

/**
 * @route PUT /:id
 * @description Updates an existing user by ID
 *
 * @param {number} req.params.id- ID of the user to update
 *
 * @param {string} [req.body.username] - New username
 * @param {string} [req.body.email] - New email address
 * @param {string} [req.body.password] - New password
 * @param {string} [req.body.avatar] - New avatar URL
 * @param {string} [req.body.role] - New user role
 * @param {string} [req.body.nickname] - New nickname
 * @param {number} [req.body.sex] - New sex
 * @param {string} [req.body.company] - New company
 * @param {string} [req.body.introduce] - New introduction
 *
 * @returns {Object} JSON response containing updated user details
 *  - user: {Object} User object with properties:
 *    - id: {number} User ID
 *    - username: {string} User's username
 *    - password: {string} User's password (hashed)
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
 * @response 200 - User updated successfully
 * @throws {NotFoundError} If user with specified ID is not found
 * @throws {SequelizeValidationError} If update data fails validation or violates unique constraints
 * @throws {Error} For any other errors during update
 */
router.put("/:id", async function (req, res) {
  try {
    const user = await getUser(req);

    const body = filterBody(req);
    await user.update(body);
    success(res, "Query successful", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @function getUser
 * @description Retrieves a user by ID from the database
 *
 * @param {import('express').Request} req - Express request object with user ID in params
 * @returns {Promise<User>} User model instance
 * @throws {NotFoundError} If no user exists with the given ID
 */
async function getUser(req) {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError(`ID: ${id} not found`);
  }

  return user;
}

/**
 * @function filterBody
 * @description Extracts whitelisted user properties from request body
 *
 * @param {import('express').Request} req - Express request object
 * @returns {Object} Filtered object containing allowed user properties
 */
function filterBody(req) {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    sex: req.body.sex,
    company: req.body.company,
    introduce: req.body.introduce,
    role: req.body.role,
    avatar: req.body.avatar,
  };
}

module.exports = router;

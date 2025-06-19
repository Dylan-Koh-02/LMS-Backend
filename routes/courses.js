const express = require("express");
const router = express.Router();
const { Course, Category, Chapter, User } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * @route GET /courses
 * @description Retrieve a paginated list of courses by category ID.
 *
 * @param {number} req.query.categoryId - The ID of the category to filter courses by (required)
 * @param {number} [req.query.currentPage=1] - The current page number for pagination (default is 1)
 * @param {number} [req.query.pageSize=10] - Number of courses per page (default is 10)
 *
 * @returns {Object} JSON response with courses list and pagination info:
 *  - courses: {Array<Object>}Array of course objects matching the filters.
 *    - id: {number} Course ID
 *    - name: {string} Course name
 *    - categoryId: {number} Category ID
 *    - userId: {number} User ID of the course creator
 *    - image: {string} Course image URL
 *    - recommended: {boolean} Whether the course is recommended
 *    - introductory: {boolean} Whether the course is introductory
 *    - content: {string} Course content
 *    - likesCount: {number} Number of likes
 *    - chaptersCount: {number} Number of chapters in the course
 *    - Category: {Object} Associated category data with properties:
 *      - id: {number} Category ID
 *      - name: {string} Category name
 *    - User: {Object} Associated user data with properties:
 *      - id: {number} User ID
 *      - username: {string} Username of the course creator
 *      - avatar: {string} Avatar URL of the course creator
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *  - pagination: {Object} Pagination metadata
 *    - total: {number} Total number of matching articles
 *    - currentPage: {number} Current page number
 *    - pageSize: {number} Number of items per page
 *
 * @responsecode 200 - Courses list returned successfully
 * @throws {Error} If categoryId is missing or course retrieval fails
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    if (!query.categoryId) {
      throw new Error("Category ID is required.");
    }

    const condition = {
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      where: { categoryId: query.categoryId },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    const { count, rows } = await Course.findAndCountAll(condition);
    success(res, "Query Successful.", {
      courses: rows,
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
 * @route GET /courses/:id
 * @description Retrieve detailed course information by ID, including its category, creator, and chapters.
 *
 * @param {string} req.params.id - The ID of the course to retrieve
 *
 * @returns {Object} JSON response with existing course details:
 *  - courses: {Object} Course objects matching the filters.
 *    - id: {number} Course ID
 *    - name: {string} Course name
 *    - categoryId: {number} Category ID
 *    - userId: {number} User ID of the course creator
 *    - image: {string} Course image URL
 *    - recommended: {boolean} Whether the course is recommended
 *    - introductory: {boolean} Whether the course is introductory
 *    - content: {string} Course content
 *    - likesCount: {number} Number of likes
 *    - chaptersCount: {number} Number of chapters in the course
 *    - category: {Object} Associated category data with properties:
 *      - id: {number} Category ID
 *      - name: {string} Category name
 *    - user: {Object} Associated user data with properties:
 *      - id: {number} User ID
 *      - username: {string} Username of the course creator
 *      - avatar: {string} Avatar URL of the course creator
 *    - chapters: {Array<Object>} List of chapters associated with the course
 *      - id: {number} Chapter ID
 *      - title: {string} Chapter title
 *      - rank: {number} Chapter rank
 *      - createdAt: {string} Creation timestamp
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Course found successfully
 * @throws {NotFoundError} If no course exists with the given ID
 * @throws {Error} If an error occurs during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const condition = {
      attributes: { exclude: ["CategoryId", "UserId"] },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Chapter,
          as: "chapters",
          attributes: ["id", "title", "rank", "createdAt"],
          order: [
            ["rank", "ASC"],
            ["id", "DESC"],
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar", "company"],
        },
      ],
    };

    const course = await Course.findByPk(id, condition);
    if (!course) {
      throw new NotFoundError(`Course with ID:${id} is not found.`);
    }

    success(res, "Course Details Found!", { course });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

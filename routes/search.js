const express = require("express");
const router = express.Router();
const { Course } = require("../models");
const { success, failure } = require("../utils/responses");
const { Op } = require("sequelize");

/**
 * @route GET /search
 * @description Search for courses by name with pagination support.
 *
 * @param {string} [req.query.name] - Partial course name to search for (optional)
 * @param {number} [req.query.currentPage=1] - Current page number for pagination (default is 1)
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
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *  - pagination: {Object} Pagination metadata
 *    - total: {number} Total number of matching articles
 *    - currentPage: {number} Current page number
 *    - pageSize: {number} Number of items per page
 *
 * @responsecode 200 - Search completed successfully
 * @throws {Error} If an error occurs during the search operation
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    if (query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`,
        },
      };
    }

    const { count, rows } = await Course.findAndCountAll(condition);
    success(res, "Search successfully", {
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

module.exports = router;

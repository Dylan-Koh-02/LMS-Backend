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
 * @returns {Object} JSON response with search results and pagination info:
 * {
 *   courses: Course[],
 *   pagination: {
 *     total: number,
 *     currentPage: number,
 *     pageSize: number
 *   }
 * }
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

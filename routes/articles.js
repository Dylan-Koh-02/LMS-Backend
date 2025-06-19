const express = require("express");
const router = express.Router();
const { Article } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");

/**
 * @route GET /articles
 * @description Get a paginated list of articles, excluding the content field.
 *
 * @param {number} [req.query.currentPage=1] - The current page number (default is 1)
 * @param {number} [req.query.pageSize=10] - Number of articles per page (default is 10)
 *
 * @returns {Object} Response object containing users and pagination info
 *  - articles: {Array<Object>} List of existing articles with properties:
 *    - id: {number} Article ID
 *    - title: {string} Article title
 *    - content: {string} Article content
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *  - pagination: {Object} Pagination metadata
 *    - total: {number} Total number of matching articles
 *    - currentPage: {number} Current page number
 *    - pageSize: {number} Number of items per page
 *
 * @responsecode 200 - Articles list returned successfully
 * @throws {Error} If an error occurs during fetching articles
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      attributes: { exclude: ["content"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    const { count, rows } = await Article.findAndCountAll(condition);
    success(res, "Articles List is successfully returned", {
      articles: rows,
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
 * @route GET /articles/:id
 * @description Get article details by ID.
 *
 * @param {string} req.params.id - The ID of the article to retrieve
 *
 * @returns {Object} Response object containing article details
 *  - articles: {Object} Existing article with properties:
 *    - id: {number} Article ID
 *    - title: {string} Article title
 *    - content: {string} Article content
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Article found successfully
 * @throws {NotFoundError} If no article exists with the given ID
 * @throws {Error} For any other errors during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      throw new NotFoundError(`Article with ID${id} is not found。`);
    }

    success(res, "Article Found", { article });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

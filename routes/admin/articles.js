const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /admin/article
 * @description Get a paginated list of articles, optionally filtered by title.
 *
 * @param {number} [req.query.currentPage=1] - The current page number
 * @param {number} [req.query.pageSize=10] - Number of articles per page
 * @param {string} [req.query.title] - Title keyword for filtering
 *
 * @returns {Object} Response object containing article list and pagination info
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
 * @responsecode 200 - Article retrieved successfully
 * @throws {Error} For any errors during retrieval
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

    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }

    const { count, rows } = await Article.findAndCountAll(condition);
    success(res, "Query successful", {
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
 * @route GET /admin/article/:id
 * @description Retrieve the details of a single article by its ID.
 *
 * @param {string} req.params.id - The ID of the article to retrieve
 *
 * @returns {Object} JSON response containing the article details:
 *   - articles: {Object} Existing article with properties:
 *     - id: {number} Article ID
 *     - title: {string} Article title
 *     - content: {string} Article content
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Article retrieved successfully
 * @throws {NotFoundError} If the article with the specified ID does not exist
 * @throws {Error} For any other errors during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);

    success(res, "Query successful", { article });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route POST /admin/article
 * @description Create a new article using the provided request body.
 *
 * @param {string} req.body.title - The title of the article
 * @param {string} [req.body.content] - The content of the article
 *
 * @returns {Object} JSON response containing the article details:
 *   - articles: {Object} Created article with properties:
 *     - id: {number} Article ID
 *     - title: {string} Article title
 *     - content: {string} Article content
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 201 - Article created successfully
 * @throws {SequelizeValidationError} If required fields are missing or invalid
 * @throws {Error} For any other errors during creation
 */
router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const article = await Article.create(body);
    success(res, "Query successful", { article }, 201);
  } catch (error) {
    failure(res, error);
    // res.json({errors: [error.message]})
    // res.json({ error })
  }
});

/**
 * @route DELETE /admin/article/:id
 * @description Delete an article by its ID.
 *
 * @param {string} req.params.id - The ID of the article to delete
 *
 * @returns {Object} JSON response indicating success:
 * {
 *   message: "Delete successful"
 * }
 *
 * @responsecode 200 - Article deleted successfully
 * @throws {NotFoundError} If no article is found with the given ID
 * @throws {Error} For any other errors during deletion
 * {
 *   message: "Delete successful"
 * }
 */
router.delete("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);
    await article.destroy();
    success(res, "Delete successful");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /admin/article/:id
 * @description Update an existing article by its ID with new title and/or content.
 *
 * @param {string} req.params.id - The ID of the article to update
 * @param {string} [req.body.title] - The new title of the article
 * @param {string} [req.body.content] - The new content of the article
 *
 * @returns {Object} JSON response containing the updated article:
 *   - articles: {Object} Updated article with properties:
 *     - id: {number} Article new ID
 *     - title: {string} Article new title
 *     - content: {string} Article new content
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Article updated successfully
 * @throws {NotFoundError} If the article with the specified ID does not exist
 * @throws {Error} For any other errors during update
 */
router.put("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);

    const body = filterBody(req);
    await article.update(body);
    success(res, "Query successful", { article });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @function getArticle
 * @description Retrieves an article by ID from the request path parameters.
 *
 * @param {import('express').Request} req - Express request object containing params.id
 *
 * @returns {Promise<Article>} Resolves with the found article
 * @throws {NotFoundError} If no article is found with the provided ID
 */
async function getArticle(req) {
  const { id } = req.params;
  const article = await Article.findByPk(id);

  if (!article) {
    throw new NotFoundError(`Article with ID:${id} is not found`);
  }

  return article;
}

/**
 * @function filterBody
 * @description Extracts whitelisted properties from request body
 *
 * @param {import('express').Request} req - Express request object
 * @returns {Object} Filtered object containing only title and content
 */
function filterBody(req) {
  return {
    title: req.body.title,
    content: req.body.content,
  };
}

module.exports = router;

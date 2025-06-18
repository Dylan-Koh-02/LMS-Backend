const express = require("express");
const router = express.Router();
const { Category, Course } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /admin/categories
 * @description Get a paginated list of categories, optionally filtered by name.
 *
 * @queryparam {number} [currentPage=1] - The current page number
 * @queryparam {number} [pageSize=10] - Number of categories per page
 * @queryparam {string} [name] - Optional name keyword for filtering categories
 *
 * @returns {Object} JSON response with category list and pagination info:
 *   - categories: {Array<Object>} List of existing categories with properties:
 *     - id: {number} Category ID
 *     - name: {string} Category name
 *     - rank: {number} Category rank
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *   - pagination: {Object} Pagination metadata
 *     - total: {number} Total number of matching articles
 *     - currentPage: {number} Current page number
 *     - pageSize: {number} Number of items per page
 *
 * @responsecode 200 - Categories retrieved successfully
 * @throws {Error} For any errors during retrieval
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;

    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      order: [
        ["rank", "ASC"],
        ["id", "ASC"],
      ],
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

    const { count, rows } = await Category.findAndCountAll(condition);
    success(res, "Query successful", {
      categories: rows,
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
 * @route GET /admin/categories/:id
 * @description Get a single category by its ID.
 *
 * @param {string} req.params.id - The ID of the category to retrieve.
 *
 * @returns {Object} JSON response with existing category details:
 *   - category: {Object} Category with properties:
 *     - id: {number} Category ID
 *     - name: {string} Category name
 *     - rank: {number} Category rank
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Category retrieved successfully
 * @throws {NotFoundError} If the category with given ID does not exist
 * @throws {Error} For any other errors during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const category = await getCategory(req);

    success(res, "Query successful", { category });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route POST /admin/categories
 * @description Create a new category using the provided request body.
 *
 * @body {string} name - The name of the category
 * @body {string} rank - The rank of the category
 *
 * @returns {Object} JSON response with category details:
 *   - categories: {Object} Created category with properties:
 *     - id: {number} Category ID
 *     - name: {string} Category name
 *     - rank: {number} Category rank
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
    const category = await Category.create(body);
    success(res, "Query successful", { category }, 201);
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route DELETE /admin/categories/:id
 * @description Delete an single category by its ID.
 *
 * @param {string} req.params.id - The ID of the category to delete
 *
 * @returns {Object} JSON response indicating success:
 * {
 *   message: "Delete successful"
 * }
 *
 * @responsecode 200 - Category deleted successfully
 * @throws {NotFoundError} If no category is found with the given ID
 * @throws {Error} For any other errors during deletion
 * {
 *   message: "Delete successful"
 * }
 */
router.delete("/:id", async function (req, res) {
  try {
    const category = await getCategory(req);
    const count = await Course.count({ where: { categoryId: req.params.id } });
    if (count > 0) {
      throw new Error("Delete failed, this category has courses.");
    }
    await category.destroy();
    success(res, "Delete successful");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /admin/categories/:id
 * @description Update a category by its ID.
 *
 * @param {string} req.params.id - The ID of the category to update.
 * @body {string} [name] - Updated name of the category
 * @body {number} [rank] - Updated rank/order of the category 
 *
 * @returns {Object} JSON response with updated category details:
 *   - categories: {Object} Category with properties:
 *     - id: {number} Category ID
 *     - name: {string} Category name
 *     - rank: {number} Category rank
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Category updated successfully
 * @throws {NotFoundError} If the category with given ID does not exist
 * @throws {Error} For any other errors during update
 */
router.put("/:id", async function (req, res) {
  try {
    const category = await getCategory(req);

    const body = filterBody(req);
    await category.update(body);
    success(res, "Query successful", { category });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @function getCategory
 * @description Retrieve a category by its ID from the database.
 *
 * @param {import('express').Request} req - Express request object containing params.id
 * @returns {Promise<Category>} The found category object
 * @throws {NotFoundError} If the category with given ID does not exist
 */
async function getCategory(req) {
  const { id } = req.params;
  // const condition = {
  //   include: [
  //     {
  //       model: Course,
  //       as: "courses",
  //     },
  //   ],
  // };

  const category = await Category.findByPk(id);
  if (!category) {
    throw new NotFoundError(`Category with ID:${id} is not found.`);
  }

  return category;
}

/**
 * @function filterBody
 * @description Extracts whitelisted properties from request body
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {Object} Filtered object containing only name and rank.
 */
function filterBody(req) {
  return {
    name: req.body.name,
    rank: req.body.rank,
  };
}

module.exports = router;

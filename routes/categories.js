const express = require("express");
const router = express.Router();
const { Category } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * @route GET /categories
 * @description Retrieve the full list of categories
 *
 * @returns {Object} JSON response with category list:
 *   - categories: {Array<Object>} List of existing categories with properties:
 *     - id: {number} Category ID
 *     - name: {string} Category name
 *     - rank: {number} Category rank
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Categories list returned successfully
 * @throws {Error} For any errors during retrieval
 */
router.get("/", async function (req, res, next) {
  try {
    const categories = await Category.findAll({
      order: [
        ["rank", "ASC"],
        ["id", "DESC"],
      ],
    });

    success(res, "Categories list is successfully returned", { categories });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

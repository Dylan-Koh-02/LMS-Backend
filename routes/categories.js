const express = require("express");
const router = express.Router();
const { Category } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * @route GET /categories
 * @description Retrieve the full list of categories, ordered by rank (ASC) and ID (DESC).
 *
 * @returns {Object} JSON response with categories list:
 * {
 *   categories: Category[]
 * }
 *
 * @responsecode 200 - Categories list returned successfully
 * @throws {Error} If fetching categories fails
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

const express = require("express");
const router = express.Router();
const { Category, Course } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

// Routing to create, read, update, and delete categories
// GET /admin/category - Get a list of categories with pagination and optional name filter
// GET /admin/category/:id - Get a specific category by ID
// POST /admin/category - Create a new category
// DELETE /admin/category/:id - Delete an category by ID
// PUT /admin/category/:id - Update an category by ID
// Middleware to handle category-related routes

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

router.get("/:id", async function (req, res) {
  try {
    const category = await getCategory(req);

    success(res, "Query successful", { category });
  } catch (error) {
    failure(res, error);
  }
});

router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const category = await Category.create(body);
    success(res, "Query successful", { category }, 201);
  } catch (error) {
    failure(res, error);
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const category = await getCategory(req);
    const count = await Course.count({ where: { categoryId: req.params.id } });
    if (count > 0) {
      throw new Error("当前分类有课程，无法删除。");
    }
    await category.destroy();
    success(res, "Delete successful");
  } catch (error) {
    failure(res, error);
  }
});

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

// Function to get an category by ID
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
    throw new NotFoundError(`ID: ${id}的分类未找到。`);
  }

  return category;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name, rank: *}}
 */
// Function to filter the request body for category creation or update
function filterBody(req) {
  return {
    name: req.body.name,
    rank: req.body.rank,
  };
}

module.exports = router;

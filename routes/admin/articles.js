const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, success, failure } = require("../../utils/response");

// Routing to create, read, update, and delete articles
// GET /admin/article - Get a list of articles with pagination and optional title filter
// GET /admin/article/:id - Get a specific article by ID
// POST /admin/article - Create a new article
// DELETE /admin/article/:id - Delete an article by ID
// PUT /admin/article/:id - Update an article by ID
// Middleware to handle article-related routes

router.get("/", async function (req, res) {
  try {
    const query = req.query;

    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
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
      pagination:{
        total: count,
        currentPage,
        pageSize,
      }
    })
  } catch (error) {
    failure(res, error);
  }
});

router.get("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);
    
    success(res, "Query successful", {article});
  } catch (error) {
    failure(res, error);
  }
});

router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const article = await Article.create(body); 
    success(res, "Query successful", {article},201);
  } catch (error) {
    failure(res, error);
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);
    await article.destroy();
    success(res,'Delete successful');
  } catch (error) {
    failure(res, error);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);

    const body = filterBody(req);
    await article.update(body);
    success(res, "Query successful", {article});
  } catch (error) {
    failure(res, error);
  }
});

// Function to get an article by ID
async function getArticle(req) {
  const { id } = req.params;
  const article = await Article.findByPk(id);

  if (!article) {
    throw new NotFoundError(`ID: ${id} not found`);
  }

  return article;
}

// Function to filter the request body for article creation or update
function filterBody(req) {
  return {
    title: req.body.title,
    content: req.body.content,
  };
}

module.exports = router;

const express = require("express");
const router = express.Router();
const { Chapter } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, success, failure } = require("../../utils/response");

// Routing to create, read, update, and delete chapters
// GET /admin/chapter - Get a list of chapters with pagination and optional title filter
// GET /admin/chapter/:id - Get a specific chapter by ID
// POST /admin/chapter - Create a new chapter
// DELETE /admin/chapter/:id - Delete an chapter by ID
// PUT /admin/chapter/:id - Update an chapter by ID
// Middleware to handle chapter-related routes

router.get("/", async function (req, res) {
  try {
    const query = req.query;

    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    if (!query.courseId) {
      throw new Error("Failed to get chapters, courseId is required");
    }

    const condition = {
      ...getCondition(),
      order: [
        ["rank", "ASC"],
        ["id", "ASC"],
      ],
      limit: pageSize,
      offset: offset,
    };

    condition.where = {
      courseId: {
        [Op.eq]: query.courseId,
      },
    };

    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }

    const { count, rows } = await Chapter.findAndCountAll(condition);
    success(res, "Query successful", {
      chapters: rows,
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
    const chapter = await getChapter(req);

    success(res, "Query successful", { chapter });
  } catch (error) {
    failure(res, error);
  }
});

router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const chapter = await Chapter.create(body);
    success(res, "Query successful", { chapter }, 201);
  } catch (error) {
    failure(res, error);
    // res.json({errors: [error.message]})
    // res.json({ error })
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const chapter = await getChapter(req);
    await chapter.destroy();
    success(res, "Delete successful");
  } catch (error) {
    failure(res, error);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const chapter = await getChapter(req);

    const body = filterBody(req);
    await chapter.update(body);
    success(res, "Query successful", { chapter });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ["CourseId"] },
    include: [
      {
        model: Course,
        as: "course",
        attributes: ["id", "name"],
      },
    ],
  };
}

// Function to get an chapter by ID
async function getChapter(req) {
  const { id } = req.params;
  const condition = getCondition();

  const chapter = await Chapter.findByPk(id, condition);

  if (!chapter) {
    throw new NotFoundError(`ID: ${id} not found`);
  }

  return chapter;
}

// Function to filter the request body for chapter creation or update
function filterBody(req) {
  return {
    courseId: req.body.courseId,
    title: req.body.title,
    content: req.body.content,
    video: req.body.video,
    rank: req.body.rank,
  };
}

module.exports = router;

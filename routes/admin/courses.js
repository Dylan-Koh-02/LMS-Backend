const express = require("express");
const router = express.Router();
const { Course, Category, User } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, success, failure } = require("../../utils/response");

// Routing to create, read, update, and delete courses
// GET /admin/course - Get a list of courses with pagination and optional title filter
// GET /admin/course/:id - Get a specific course by ID
// POST /admin/course - Create a new course
// DELETE /admin/course/:id - Delete an course by ID
// PUT /admin/course/:id - Update an course by ID
// Middleware to handle course-related routes

router.get("/", async function (req, res) {
  try {
    const query = req.query;

    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      ...getCondition(),
      order: [["id", "DESC"]],
      offset: offset,
      limit: pageSize,
    };

    if (query.categoryId) {
      condition.where = {
        categoryId: {
          [Op.eq]: query.categoryId,
        },
      };
    }

    if (query.userId) {
      condition.where = {
        userId: {
          [Op.eq]: query.userId,
        },
      };
    }

    if (query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`,
        },
      };
    }

    if (query.recommended) {
      condition.where = {
        recommended: {
          // 需要转布尔值
          [Op.eq]: query.recommended === "true",
        },
      };
    }

    if (query.introductory) {
      condition.where = {
        introductory: {
          [Op.eq]: query.introductory === "true",
        },
      };
    }

    const { count, rows } = await Course.findAndCountAll(condition);
    success(res, "Query successful", {
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

router.get("/:id", async function (req, res) {
  try {
    const course = await getCourse(req);

    success(res, "Query successful", { course });
  } catch (error) {
    failure(res, error);
  }
});

router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const course = await Course.create(body);
    success(res, "Query successful", { course }, 201);
  } catch (error) {
    failure(res, error);
    // res.json({errors: [error.message]})
    // res.json({ error })
  }
});

router.delete('/:id', async function (req, res) {
  try {
    const course = await getCourse(req);

    const count = await Chapter.count({ where: { courseId: req.params.id } });
    if (count > 0) {
      throw new Error('当前课程有章节，无法删除。');
    }

    await course.destroy();
    success(res, '删除课程成功。');
  } catch (error) {
    failure(res, error);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const course = await getCourse(req);

    const body = filterBody(req);
    await course.update(body);
    success(res, "Query successful", { course });
  } catch (error) {
    failure(res, error);
  }
});

function getCondition() {
  return {
    attributes: { exclude: ["CategoryId", "UserId"] },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "avatar"],
      },
    ],
  };
}

// Function to get an course by ID
async function getCourse(req) {
  const { id } = req.params;
  const condition = getCondition();

  const course = await Course.findByPk(id, condition);
  if (!course) {
    throw new NotFoundError(`ID: ${id}的课程未找到。`);
  }

  return course;
}

// Function to filter the request body for course creation or update
function filterBody(req) {
  return {
    categoryId: req.body.categoryId,
    userId: req.body.userId,
    name: req.body.name,
    image: req.body.image,
    recommended: req.body.recommended,
    introductory: req.body.introductory,
    content: req.body.content,
  };
}

module.exports = router;

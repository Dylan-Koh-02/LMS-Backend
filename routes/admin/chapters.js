const express = require("express");
const router = express.Router();
const { Chapter, Course } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /admin/chapters
 * @description Get a paginated list of chapters filtered by courseId and optionally by title.
 *
 * @param {string} req.query.courseId - The ID of the course to filter chapters (required).
 * @param {number} [req.query.currentPage=1] - The current page number for pagination.
 * @param {number} [req.query.pageSize=10] - Number of chapters per page.
 * @param {string} [req.query.title] - Optional title keyword for filtering chapters.
 *
 * @returns {Object} JSON response with chapters list and pagination info:
 *   - chapters: {Array<Object>} List of existing chapters with properties:
 *     - id: {number} Chapter ID
 *     - courseId: {string} Chapter ID
 *     - title: {number} Chapter rank
 *     - content: {string} Chapter content
 *     - video: {string} Video URL
 *     - rank: {number} Chapter rank
 *     - course: {Object} Associated course data with properties:
 *       - id: {number} Course ID
 *       - name: {string} Course name
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *   - pagination: {Object} Pagination metadata
 *     - total: {number} Total number of matching articles
 *     - currentPage: {number} Current page number
 *     - pageSize: {number} Number of items per page
 *
 * @responsecode 200 - Chapters retrieved successfully
 * @throws {Error} If courseId is not provided in the query.
 */
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

/**
 * @route GET /admin/chapters/:id
 * @description Retrieve a single chapter by its ID.
 *
 * @param {string} req.params.id - The ID of the chapter to retrieve.
 *
 * @returns {Object} JSON response with existing chapter details:
 *   - chapter: {Object} List of chapter with properties:
 *     - id: {number} Chapter ID
 *     - courseId: {string} Course ID
 *     - title: {number} Chapter rank
 *     - content: {string} Chapter content
 *     - video: {string} Video URL
 *     - rank: {number} Chapter rank
 *     - course: {Object} Associated course data with properties:
 *       - id: {number} Course ID
 *       - name: {string} Course name
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Chapter retrieved successfully
 * @throws {NotFoundError} If the chapter with the given ID does not exist.
 * @throws {Error} For any other errors during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const chapter = await getChapter(req);

    success(res, "Query successful", { chapter });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route POST /admin/chapters
 * @description Create a new chapter using the provided request body.
 *
 * @param {string} req.body.courseId - The name of the chapter
 * @param {string} req.body.title - The rank of the chapter
 * @param {string} [req.body.content] - The content of the chapter
 * @param {string} [req.body.video] - The video URL of the chapter
 * @param {number} req.body.rank - The rank of the chapter
 * 
 * @returns {Object} JSON response with created chapter details:
 *   - chapter: {Object} List of chapter with properties:
 *     - id: {number} Chapter ID
 *     - courseId: {string} Course ID
 *     - title: {number} Chapter rank
 *     - content: {string} Chapter content
 *     - video: {string} Video URL
 *     - rank: {number} Chapter rank
 *     - course: {Object} Associated course data with properties:
 *       - id: {number} Course ID
 *       - name: {string} Course name
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 *
 * @responsecode 201 - Chapter created successfully.
 * @throws {SequelizeValidationError} If required fields are missing or invalid
 * @throws {Error} If creation fails or validation errors occur.
 */
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

/**
 * @route DELETE /admin/chapters/:id
 * @description Delete a single chapter by its ID.
 *
 * @param {string} req.params.id - The ID of the chapter to delete.
 * 
 * @returns {Object} JSON response indicating success:
 * {
 *   message: "Delete successful"
 * }
 *
 * @responsecode 200 - Chapter deleted successfully
 * @throws {NotFoundError} If no chapter is found with the given ID
 * @throws {Error} For any other errors during deletion
 */
router.delete("/:id", async function (req, res) {
  try {
    const chapter = await getChapter(req);
    await chapter.destroy();
    success(res, "Delete successful");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /admin/chapters/:id
 * @description Update a single chapter by its ID.
 *
 * @param {string} req.params.id - The ID of the chapter to update.
 * @param {string} [req.body.courseId] - The name of the chapter
 * @param {string} [req.body.title] - The rank of the chapter
 * @param {string} [req.body.content] - The content of the chapter
 * @param {string} [req.body.video] - The video URL of the chapter
 * @param {number} [req.body.rank] - The rank of the chapter * 
 * 
 * @returns {Object} JSON response with updated chapter details:
 *   - chapter: {Object} List of chapter with properties:
 *     - id: {number} new Chapter ID
 *     - courseId: {string} new Course ID
 *     - title: {number} new Chapter rank
 *     - content: {string} new Chapter content
 *     - video: {string} new Video URL
 *     - rank: {number} new Chapter rank
 *     - course: {Object} Associated new course data with properties:
 *       - id: {number} Course ID
 *       - name: {string} Course name
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Chapter updated successfully
 * @throws {SequelizeValidationError} If required fields are missing or invalid
 * @throws {NotFoundError} If the chapter with the given ID does not exist.
 * @throws {Error} For any other errors during update
 */
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
 * @function getCondition
 * @description Returns Sequelize query options to associate chapters with their related courses.
 *
 * @returns {Object} Sequelize query condition including:
 *  - attributes: {Object} Excludes the foreign key "CourseId" from the result.
 *    - exclude: {Array<string>} List of attributes to exclude from the result.
 *  - include: {Array<Object>} Joins the Course model as "course" with selected attributes .
 *    - model: {Object} Model to include.
 *    - as: {string} Alias of model.
 *    - attributes: {Array<string>} List of attributes to select from the included model.
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

/**
 * @function getChapter
 * @description Retrieves a chapter by its ID, including its associated course information from the database.
 *
 * @param {import('express').Request} req - Express request object containing params.id
 * @returns {Promise<Chapter>} The chapter object including associated course data.
 * @throws {NotFoundError} If the chapter with the given ID does not exist.
 */
async function getChapter(req) {
  const { id } = req.params;
  const condition = getCondition();

  const chapter = await Chapter.findByPk(id, condition);

  if (!chapter) {
    throw new NotFoundError(`Chapter with ID:${id} not found`);
  }

  return chapter;
}

/**
 * @function filterBody
 * @description Extracts whitelisted properties from request body
 *
 * @param {import('express').Request} req - Express request object containing the body.
 * @returns {Object} Filtered object containing only the allowed fields.
 */
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

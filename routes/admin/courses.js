const express = require("express");
const router = express.Router();
const { Course, Category, User } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /
 * @description Get a paginated list of courses optionally filtered by categoryId, userID, name, recommended and introductory.
 *
 * @queryparam {number} [currentPage=1] - The current page number for pagination.
 * @queryparam {number} [pageSize=10] - Number of courses per page.
 * @queryparam {string} [categoryId] - Filter courses by category ID.
 * @queryparam {string} [userId] - Filter courses by user ID.
 * @queryparam {string} [name] - Partial match filter on course name.
 * @queryparam {string} [recommended] - Filter by recommended status ('true' or 'false').
 * @queryparam {string} [introductory] - Filter by introductory status ('true' or 'false').
 *
 * @param {import('express').Request} req - Express request object with query parameters.
 * @param {import('express').Response} res - Express response object.
 *
 * @returns {Object} JSON response with courses list and pagination info:
 *  - courses: {Array<Object>}Array of course objects matching the filters.
 *    - id: {number} Course ID
 *    - name: {string} Course name
 *    - categoryId: {number} Category ID
 *    - userId: {number} User ID of the course creator
 *    - image: {string} Course image URL
 *    - recommended: {boolean} Whether the course is recommended
 *    - introductory: {boolean} Whether the course is introductory
 *    - content: {string} Course content
 *    - likesCount: {number} Number of likes
 *    - Category: {Object} Associated category data with properties:
 *      - id: {number} Category ID
 *      - name: {string} Category name
 *    - User: {Object} Associated user data with properties:
 *      - id: {number} User ID
 *      - username: {string} Username of the course creator
 *      - avatar: {string} Avatar URL of the course creator
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *  - pagination: {Object} Pagination metadata
 *    - total: {number} Total number of matching articles
 *    - currentPage: {number} Current page number
 *    - pageSize: {number} Number of items per page
 *
 * @throws {Error} If any error occurs during query execution.
 */
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

/**
 * @route GET /:id
 * @description Get a single course by its ID.
 *
 * @param {string} req.params.id - The ID of the course to retrieve.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 *
 * @returns {Object} JSON response with existing course details:
 *  - courses: {Object} Course objects matching the filters.
 *    - id: {number} Course ID
 *    - name: {string} Course name
 *    - categoryId: {number} Category ID
 *    - userId: {number} User ID of the course creator
 *    - image: {string} Course image URL
 *    - recommended: {boolean} Whether the course is recommended
 *    - introductory: {boolean} Whether the course is introductory
 *    - content: {string} Course content
 *    - likesCount: {number} Number of likes
 *    - Category: {Object} Associated category data with properties:
 *      - id: {number} Category ID
 *      - name: {string} Category name
 *    - User: {Object} Associated user data with properties:
 *      - id: {number} User ID
 *      - username: {string} Username of the course creator
 *      - avatar: {string} Avatar URL of the course creator
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Course retrieved successfully
 * @throws {NotFoundError} If the course with the given ID does not exist.
 * @throws {Error} For any other errors during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const course = await getCourse(req);

    success(res, "Query successful", { course });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route POST /
 * @description Create a new course. The authenticated admin user will be set as the course owner.
 *
 * @body {string} categoryId - The ID of the category to which the course belongs.
 * @body {string} name - The name of the course.
 * @body {string} image - The URL of the course image.
 * @body {number} recommended - Whether the course is recommended (true or false).
 * @body {number} introductory - Whether the course is introductory (true or false).
 * @body {string} content - The content of the course.
 *
 * @returns {Object} JSON response with created course details:
 *  - courses: {Object} Course objects matching the filters.
 *    - id: {number} Course ID
 *    - name: {string} Course name
 *    - categoryId: {number} Category ID
 *    - userId: {number} User ID of the course creator
 *    - image: {string} Course image URL
 *    - recommended: {boolean} Whether the course is recommended
 *    - introductory: {boolean} Whether the course is introductory
 *    - content: {string} Course content
 *    - likesCount: {number} Number of likes
 *    - Category: {Object} Associated category data with properties:
 *      - id: {number} Category ID
 *      - name: {string} Category name
 *    - User: {Object} Associated user data with properties:
 *      - id: {number} User ID
 *      - username: {string} Username of the course creator
 *      - avatar: {string} Avatar URL of the course creator
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *
 * @throws Will call failure response if any error occurs during creation.
 */
router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    body.userId = req.user.id;
    const course = await Course.create(body);
    success(res, "Query successful", { course }, 201);
  } catch (error) {
    failure(res, error);
    // res.json({errors: [error.message]})
    // res.json({ error })
  }
});

/**
 * @route DELETE /:id
 * @description Delete a course by its ID if it has no associated chapters.
 *
 * @param {string} req.params.id - The ID of the course to delete.
 * 
 * @returns {Object} JSON response indicating success:
 * {
 *   message: "Delete successful"
 * }
 * 
 * @responsecode 200 - Course deleted successfully
 * @throws {NotFoundError} If no course is found with the given ID
 * @throws {Error} For any other errors during deletion
 */
router.delete("/:id", async function (req, res) {
  try {
    const course = await getCourse(req);

    const count = await Chapter.count({ where: { courseId: req.params.id } });
    if (count > 0) {
      throw new Error("Delete failed, the course has associated chapters.");
    }

    await course.destroy();
    success(res, "Successfully deleted course");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /:id
 * @description Update a course by its ID.
 *
 * @param {string} req.params.id - The ID of the course to update.
 * @param {import('express').Request} req - Express request object containing updated course data in the body.
 * @param {import('express').Response} res - Express response object.
 *
 * @throws {NotFoundError} If the course with the given ID does not exist.
 *
 * @returns {Object} JSON response with the updated course.
 */
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

/**
 * @function getCondition
 * @description Returns Sequelize query configuration for fetching data with associated models, excluding foreign keys.
 *
 * @returns {Object} Sequelize query condition including:
 *  - attributes: {Object} Excludes the foreign key "CategoryId" and "UserID" from the result.
 *    - exclude: {Array<string>} List of attributes to exclude from the result.
 *  - include: {Array<Object>} Joins the Category model as "course" and User model as "user" .
 *    - model: {Object} Model to include.
 *    - as: {string} Alias of model.
 *    - attributes: {Array<string>} List of attributes to select from the included model.
 */
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

/**
 * @function getCourse
 * @description Retrieves a course by ID including associated category and user details.
 *
 * @param {import('express').Request} req - Express request object containing course ID in params.
 * @returns {Promise<Model>} The course model instance with associations.
 * @throws {NotFoundError} If the course with the given ID is not found.
 */
async function getCourse(req) {
  const { id } = req.params;
  const condition = getCondition();

  const course = await Course.findByPk(id, condition);
  if (!course) {
    throw new NotFoundError(`Course with ID:${id} not exists.`);
  }

  return course;
}

/**
 * @function filterBody
 * @description Extracts whitelisted properties from request body
 *
 * @param {import('express').Request} req - Express request object.
 * @returns {Object} Filtered object containing only allowed course properties.
 */
function filterBody(req) {
  return {
    categoryId: req.body.categoryId,
    name: req.body.name,
    image: req.body.image,
    recommended: req.body.recommended,
    introductory: req.body.introductory,
    content: req.body.content,
  };
}

module.exports = router;

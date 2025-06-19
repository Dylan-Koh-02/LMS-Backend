const express = require("express");
const router = express.Router();
const { Course, Category, Chapter, User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");

/**
 * @route GET /chapters/:id
 * @description Get detailed information about a chapter by ID
 *
 * @param {string} req.params.id - The ID of the chapter to retrieve
 *
 * @returns {Object} JSON response with existing chapter details:
 *   - chapter: {Object} List of chapter with properties:
 *     - id: {number} Chapter ID
 *     - courseId: {string} Course ID
 *     - title: {number} Chapter rank
 *     - content: {string} Chapter content
 *     - video: {string} Video URL
 *     - rank: {number} Chapter rank
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *   - course: {Object} Associated course data with properties:
 *     - id: {number} Course ID
 *     - name: {string} Course name
 *     - userId: {number} User ID of the course creator
 *   - user: {Object} User data of the course creator with properties:
 *     - id: {number} User ID
 *     - username: {string} Username of the course creator
 *     - nickname: {string} Nickname of the course creator
 *     - avatar: {string} URL to the course creator's avatar
 *     - company: {string} Company of the course creator
 *   - chapters: {Array<Object>} List of all chapters in the course with properties:
 *     - id: {number} Chapter ID
 *     - courseId: {string} Course ID
 *     - title: {number} Chapter rank
 *     - video: {string} Video URL
 *     - rank: {number} Chapter rank
 *     - createdAt: {string} Creation timestamp
 *     - updatedAt: {string} Last update timestamp
 *
 * @responsecode 200 - Chapter and related data returned successfully
 * @throws {NotFoundError} If the chapter with the given ID is not found
 * @throws {Error} If any other error occurs while fetching data
 */
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    /**const condition = {
      attributes: { exclude: ['CourseId'] },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'nickname', 'avatar', 'company'],
            }
          ]
        }
      ]
    };

    const chapter = await Chapter.findByPk(id, condition);
    
    if (!chapter) {
      throw new NotFoundError(`Chapter with ID${ id } is not found。`)
    }

    // Get all chapters belongs to the same course
    const chapters = await Chapter.findAll({
      attributes: { exclude: ['CourseId', 'content'] },
      where: { courseId: chapter.courseId },
      order: [['rank', 'ASC'], ['id', 'DESC']]
    });*/

    const chapter = await Chapter.findByPk(id, {
      attributes: { exclude: ["CourseId"] },
    });

    if (!chapter) {
      throw new NotFoundError(`Chapter with ID${id} is not found。`);
    }

    // Get the course by chapter
    const course = await chapter.getCourse({
      attributes: ["id", "name", "userId"],
    });

    // Get Course creator information
    const user = await course.getUser({
      attributes: ["id", "username", "nickname", "avatar", "company"],
    });

    // Get all chapters belongs to the same course
    const chapters = await Chapter.findAll({
      attributes: { exclude: ["CourseId", "content"] },
      where: { courseId: chapter.courseId },
      order: [
        ["rank", "ASC"],
        ["id", "DESC"],
      ],
    });

    success(res, "Chapters are found", { chapter, course, user, chapters });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

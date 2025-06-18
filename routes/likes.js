const express = require("express");
const router = express.Router();
const { Course, Like, User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");

/**
 * @route GET /likes
 * @description Retrieve a paginated list of courses liked by the authenticated user.
 *
 * @param {number} [req.query.currentPage=1] - Current page number for pagination (default is 1)
 * @param {number} [req.query.pageSize=10] - Number of items per page (default is 10)
 *
 * @sets {string} req.userId - The authenticated user's ID (set by authentication middleware)
 *
 * @returns {Object} JSON response with liked courses and pagination info:
 * {
 *   courses: Course[],
 *   pagination: {
 *     total: number,
 *     currentPage: number,
 *     pageSize: number
 *   }
 * }
 *
 * @responsecode 200 - Liked courses returned successfully
 * @throws {Error} If user not found or retrieval fails
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    // Find User by ID from the request
    const user = await User.findByPk(req.userId);
    const courses = await user.getLikeCourses({
      joinTableAttributes: [],
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    });

    const count = await user.countLikeCourses();
    success(res, "Liked Courses are returned", {
      courses,
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
 * @route POST /likes
 * @description Like or unlike a course based on the user's current like status.
 *
 * @param {string} req.body.courseId - The ID of the course to like or unlike
 *
 * @sets {string} req.userId - The authenticated user's ID (set by authentication middleware)
 *
 * @returns {Object} JSON response with a success message:
 * {
 *   message: "Liked successfully." | "Unliked successfully."
 * }
 *
 * @responsecode 200 - Action completed successfully
 * @throws {NotFoundError} If the course does not exist
 * @throws {Error} If an error occurs during the like/unlike process
 */
router.post("/", async function (req, res) {
  try {
    const userId = req.userId;
    const { courseId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFoundError("Course not exists");
    }

    const like = await Like.findOne({
      where: {
        courseId,
        userId,
      },
    });
    if (!like) {
      await Like.create({ courseId, userId });
      await course.increment("likesCount");
      success(res, "Liked successfully.");
    } else {
      // If likes exists, cancel it and likesCount - 1
      await like.destroy();
      await course.decrement("likesCount");
      success(res, "Unliked successfully.");
    }
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

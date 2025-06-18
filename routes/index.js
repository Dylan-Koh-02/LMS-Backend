const express = require("express");
const router = express.Router();
const { Course, Category, User } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * @route GET /
 * @description Retrieve homepage content including recommended, most liked, and introductory courses.
 *
 * @returns {Object} JSON response with categorized course lists:
 * {
 *   recommendedCourses: Course[], // Courses marked as recommended
 *   likesCourses: Course[],       // Top liked courses
 *   introductoryCourses: Course[] // Courses marked as introductory
 * }
 *
 * @responsecode 200 - Homepage course lists returned successfully
 * @throws {Error} If an error occurs while fetching courses
 */
router.get("/", async function (req, res, next) {
  try {
    // Recommended Courses
    const recommendedCourses = await Course.findAll({
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar", "company"],
        },
      ],
      where: { recommended: true },
      order: [["id", "desc"]],
      limit: 10,
    });

    // 人气课程
    const likesCourses = await Course.findAll({
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      order: [
        ["likesCount", "desc"],
        ["id", "desc"],
      ],
      limit: 10,
    });

    const introductoryCourses = await Course.findAll({
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      where: { introductory: true },
      order: [["id", "desc"]],
      limit: 10,
    });

    success(res, "Recommended, Liked and Introductory Courses are returned", {
      recommendedCourses,
      likesCourses,
      introductoryCourses,
    });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

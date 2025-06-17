const express = require("express");
const router = express.Router();
const { Course, Like, User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");

/**
 * 查询用户点赞的课程
 * GET /likes
 */
router.get("/", async function (req, res) {
  try {
    // 通过课程查询点赞的用户
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    // 查询当前用户
    const user = await User.findByPk(req.userId);
    const courses = await user.getLikeCourses({
      joinTableAttributes: [],
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    });

    const count = await user.countLikeCourses();
    success(res, "查询用户点赞的课程成功。", {
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
 * 点赞、取消赞
 * POST /likes
 */
router.post("/", async function (req, res) {
  try {
    const userId = req.userId;
    const { courseId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFoundError("课程不存在。");
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
      success(res, "点赞成功。");
    } else {
      // 如果点赞过了，那就删除。并且课程的 likesCount - 1
      await like.destroy();
      await course.decrement("likesCount");
      success(res, "取消赞成功。");
    }
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

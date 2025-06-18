const express = require("express");
const router = express.Router();
const { Course, Category, Chapter, User } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * @route GET /courses
 * @description Retrieve a paginated list of courses by category ID.
 *
 * @param {number} req.query.categoryId - The ID of the category to filter courses by (required)
 * @param {number} [req.query.currentPage=1] - The current page number for pagination (default is 1)
 * @param {number} [req.query.pageSize=10] - Number of courses per page (default is 10)
 *
 * @returns {Object} JSON response with paginated list of courses:
 * {
 *   courses: Course[],
 *   pagination: {
 *     total: number,
 *     currentPage: number,
 *     pageSize: number
 *   }
 * }
 *
 * @responsecode 200 - Courses list returned successfully
 * @throws {Error} If categoryId is missing or course retrieval fails
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    if (!query.categoryId) {
      throw new Error("获取课程列表失败，分类ID不能为空。");
    }

    const condition = {
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      where: { categoryId: query.categoryId },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    const { count, rows } = await Course.findAndCountAll(condition);
    success(res, "查询课程列表成功。", {
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
 * @route GET /courses/:id
 * @description Retrieve detailed course information by ID, including its category, creator, and chapters.
 *
 * @param {string} req.params.id - The ID of the course to retrieve
 *
 * @returns {Object} JSON response with course details:
 * {
 *   course: {
 *     id: number,
 *     title: string,
 *     ...,
 *     category: {
 *       id: number,
 *       name: string
 *     },
 *     user: {
 *       id: number,
 *       username: string,
 *       nickname: string,
 *       avatar: string,
 *       company: string
 *     },
 *     chapters: [
 *       {
 *         id: number,
 *         title: string,
 *         rank: number,
 *         createdAt: string
 *       },
 *       ...
 *     ]
 *   }
 * }
 *
 * @responsecode 200 - Course found successfully
 * @throws {NotFoundError} If no course exists with the given ID
 * @throws {Error} If an error occurs during retrieval
 */
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const condition = {
      attributes: { exclude: ["CategoryId", "UserId"] },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Chapter,
          as: "chapters",
          attributes: ["id", "title", "rank", "createdAt"],
          order: [
            ["rank", "ASC"],
            ["id", "DESC"],
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar", "company"],
        },
      ],
    };

    const course = await Course.findByPk(id, condition);
    if (!course) {
      throw new NotFoundError(`Course with ID:${id} is not found.`);
    }

    success(res, "Course Details Found!", { course });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

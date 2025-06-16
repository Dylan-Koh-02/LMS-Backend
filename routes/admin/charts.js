const express = require("express");
const router = express.Router();
const { sequelize, User } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * 统计用户性别
 * GET /admin/charts/sex
 */
router.get("/sex", async function (req, res) {
  try {
    const [results] = await sequelize.query(
      "SELECT DATE_FORMAT(`createdAt`, '%Y-%m') AS `month`, COUNT(*) AS `value` FROM `Users` GROUP BY `month` ORDER BY `month` ASC"
    );

    const data = {
      months: [],
      values: [],
    };

    results.forEach((item) => {
      data.months.push(item.month);
      data.values.push(item.value);
    });

    // const results = await User.findAll({
    //   attributes: [
    //     [
    //       sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
    //       "month",
    //     ], // 使用 DATE_FORMAT 转换日期格式
    //     [sequelize.fn("COUNT", "*"), "value"], // 统计每个月的用户数量
    //   ],
    //   group: ["month"], // 按年月分组
    //   order: [["month", "ASC"]], // 按年月排序,
    //   raw: true,
    // });

    success(res, "查询每月用户数量成功。", { data });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

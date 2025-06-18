const express = require("express");
const router = express.Router();
const { sequelize} = require("../../models");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /admin/charts/sex
 * @description Retrieve monthly user registration counts, grouped by year and month.
 *
 * This route queries the database to count how many users were created in each month,
 * formatted as "YYYY-MM". The result is structured into two arrays:
 *  - months: array of month strings
 *  - values: array of user counts corresponding to each month
 *
 * @returns {Object} JSON response containing:
 *  - data: {
 *      months: string[], // e.g. ["2023-01", "2023-02", ...]
 *      values: number[]  // e.g. [15, 20, ...]
 *    }
 *
 * @throws {Error} If database query fails.
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

    /**
     * const results = await User.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ], // Use DATE_FORMAT Convert createdAt to "YYYY-MM" format
        [sequelize.fn("COUNT", "*"), "value"], // Count users per month
      ],
      group: ["month"], // Group by month
      order: [["month", "ASC"]], // Order by month ascending
      raw: true,
    }); 
    */
    
    success(res, "Query Successful", { data });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { Setting } = require("../../models");
const { NotFoundError, success, failure } = require("../../utils/response");

// Routing to create, read, update, and delete settings
// GET /admin/setting - Get a list of settings with pagination and optional title filter
// GET /admin/setting/:id - Get a specific setting by ID
// POST /admin/setting - Create a new setting
// DELETE /admin/setting/:id - Delete an setting by ID
// PUT /admin/setting/:id - Update an setting by ID
// Middleware to handle setting-related routes

router.get("/", async function (req, res) {
  try {
    const setting = await getSetting(req);

    success(res, "Query successful", { setting });
  } catch (error) {
    failure(res, error);
  }
});

router.put("/", async function (req, res) {
  try {
    const setting = await getSetting();

    const body = filterBody(req);
    await setting.update(body);
    success(res, "Query successful", { setting });
  } catch (error) {
    failure(res, error);
  }
});

// Function to get an setting by ID
async function getSetting() {
  const setting = await Setting.findOne();

  if (!setting) {
    throw new NotFoundError(`ID: ${id} not found`);
  }

  return setting;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{copyright: (string|*), icp: (string|string|DocumentFragment|*), name}}
 */
function filterBody(req) {
  return {
    name: req.body.name,
    icp: req.body.icp,
    copyright: req.body.copyright,
  };
}

module.exports = router;

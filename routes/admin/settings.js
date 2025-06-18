const express = require("express");
const router = express.Router();
const { Setting } = require("../../models");
const { NotFoundError } = require("../../utils/errors");
const { success, failure } = require("../../utils/responses");

/**
 * @route GET /
 * @description Retrieves current system settings including site name and copyright information.
 * 
 * @returns {Object} JSON response with system settings:
 *  - setting: {Object} System settings object with name and copyright
 *    - id: {number} Setting ID (Default is 1)
 *    - name: {string} Site or application name
 *    - copyright: {string} Copyright information
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 * 
 * @response 200 - Settings retrieved successfully
 * @throws {NotFoundError} If system settings are not found
 * @throws {Error} For any other errors during retrieval
 */
router.get("/", async function (req, res) {
  try {
    const setting = await getSetting(req);

    success(res, "Query successful", { setting });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * @route PUT /
 * @description Updates system settings
 *
 * @body {string} [name] - Site or application name
 * @body {string} [copyright] - Copyright information
 *
 * @returns {Object} JSON response with updated system settings details:
 *  - setting: {Object} Updated system settings object with name, icp, and copyright
 *    - id: {number} Setting ID (Default is 1)
 *    - name: {string} Site or application name
 *    - copyright: {string} Copyright information
 *    - createdAt: {string} Creation timestamp
 *    - updatedAt: {string} Last update timestamp
 *
 * @response 200 - Settings updated successfully
 * @throws {NotFoundError} If system settings are not found
 * @throws {Error} For any other errors during update
 */
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

/**
 * @function getSetting
 * @description Retrieve the only setting from the database.
 *
 * @throws {NotFoundError} If no setting is found.
 * @returns {Promise<setting>} The setting object.
 */
async function getSetting() {
  const setting = await Setting.findOne();

  if (!setting) {
    throw new NotFoundError('Setting not found.');
  }

  return setting;
}

/**
 * @function filterBody
 * @description Extracts whitelisted properties from request body
 *
 * @param {import('express').Request} req req - Express request object containing the body.
 * @returns {Object} An object containing only the whitelisted fields.
 */
function filterBody(req) {
  return {
    name: req.body.name,
    copyright: req.body.copyright,
  };
}

module.exports = router;

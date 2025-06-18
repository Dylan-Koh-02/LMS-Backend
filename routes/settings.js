const express = require('express');
const router = express.Router();
const { Setting } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { success, failure } = require('../utils/responses');

/**
 * @route GET /settings
 * @description Retrieve the current system settings.
 *
 * @returns {Object} JSON response containing the system settings.
 *  - setting: Object representing the system settings.
 *
 * @response 200 - Settings successfully retrieved.
 * @throws {NotFoundError} If no settings are found in the database.
 * @throws {Error} For any other unexpected errors.
 */
router.get('/', async function (req, res) {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      throw new NotFoundError('Settings not found. Please contact administrator.');
    }

    success(res, 'Settings are returned', { setting });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;


/**
 * All responses use success(...) or failure(...) to ensure consistency
 */

function success(res, message, data = {}, code = 200) {
  res.status(code).json({
    status: true,
    message,
    data,
  });
}

function failure(res, error) {
  if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((e) => e.message);
    return res.status(400).json({
      status: false,
      message: "Validation error",
      errors,
    });
  }

  if (error.name === "NotFoundError") {
    return res.status(404).json({
      status: false,
      message: "Resource not exists",
      errors: [error.message],
    });
  }

  if (error.name === "BadRequestError") {
    return res.status(400).json({
      status: false,
      message: "Wrong Request Parameters",
      errors: [error.message],
    });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      status: false,
      message: "Verification failed",
      errors: [error.message],
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: false,
      message: "Verification failed",
      errors: ["Wrong Token"],
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      status: false,
      message: "Verification failed",
      errors: ["Expired Token"],
    });
  }

  res.status(500).json({
    status: false,
    message: "Internal server error",
    error: [error.message],
  });
}

module.exports = {
  success,
  failure,
};

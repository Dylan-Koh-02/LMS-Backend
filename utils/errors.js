/**
 * @class BadRequestError
 * Customized 400 error class
 */
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
  }
}

/**
 * @class UnauthorizedError
 * Customized 401 error class
 */
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * @class NotFoundError
 * Customized 404 error class
 */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  NotFoundError
}

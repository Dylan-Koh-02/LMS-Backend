const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, success, failure } = require("../../utils/response");

// Routing to create, read, update, and delete users
// GET /admin/user - Get a list of users with pagination and optional title filter
// GET /admin/user/:id - Get a specific user by ID
// POST /admin/user - Create a new user
// DELETE /admin/user/:id - Delete an user by ID
// PUT /admin/user/:id - Update an user by ID
// Middleware to handle user-related routes

router.get("/", async function (req, res) {
  try {
    const query = req.query;

    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      order: [["id", "DESC"]],
      offset: offset,
      limit: pageSize,
    };

    if (query.email) {
      condition.where = {
        email: {
          [Op.eq]: query.email,
        },
      };
    }

    if (query.username) {
      condition.where = {
        username: {
          [Op.eq]: query.username,
        },
      };
    }

    if (query.nickname) {
      condition.where = {
        nickname: {
          [Op.like]: `%${query.nickname}%`,
        },
      };
    }

    if (query.role) { 
      condition.where = {
        role: {
          [Op.eq]: query.role,
        },
      };
    }

    const { count, rows } = await User.findAndCountAll(condition);
    success(res, "Query successful", {
      users: rows,
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

router.get("/:id", async function (req, res) {
  try {
    const user = await getUser(req);

    success(res, "Query successful", { user });
  } catch (error) {
    failure(res, error);
  }
});

router.post("/", async function (req, res) {
  try {
    const body = filterBody(req);
    const user = await User.create(body);
    success(res, "Query successful", { user }, 201);
  } catch (error) {
    failure(res, error);
    // res.json({errors: [error.message]})
    // res.json({ error })
  }
});

// router.delete("/:id", async function (req, res) {
//   try {
//     const user = await getUser(req);
//     await user.destroy();
//     success(res, "Delete successful");
//   } catch (error) {
//     failure(res, error);
//   }
// });

router.put("/:id", async function (req, res) {
  try {
    const user = await getUser(req);

    const body = filterBody(req);
    await user.update(body);
    success(res, "Query successful", { user });
  } catch (error) {
    failure(res, error);
  }
});

// Function to get an user by ID
async function getUser(req) {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError(`ID: ${id} not found`);
  }

  return user;
}

// Function to filter the request body for user creation or update
function filterBody(req) {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    sex: req.body.sex,
    company: req.body.company,
    introduce: req.body.introduce,
    role: req.body.role,
    avatar: req.body.avatar,
  };
}

module.exports = router;

"use strict";

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require("bcryptjs");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "admin@gmail.com",
          username: "admin",
          password: bcrypt.hashSync("123123", 10),
          nickname: "超厉害的管理员",
          sex: 2,
          role: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user1@gmail.com",
          username: "user1",
          password: bcrypt.hashSync("123123", 10),
          nickname: "普通用户1",
          sex: 0,
          role: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user2@gmail.com",
          username: "user2",
          password: bcrypt.hashSync("123123", 10),
          nickname: "普通用户2",
          sex: 0,
          role: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user3@gmail.com",
          username: "user3",
          password: bcrypt.hashSync("123123", 10),
          nickname: "普通用户3",
          sex: 1,
          role: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

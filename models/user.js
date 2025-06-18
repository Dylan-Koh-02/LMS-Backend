"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.hasMany(models.Course, { as: "courses" });
      models.User.belongsToMany(models.Course, {
        through: models.Like,
        foreignKey: "userId",
        as: "likeCourses",
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Email is required." },
          notEmpty: { msg: "Email cannot be empty." },
          isEmail: { msg: "Format is wrong." },
          async isUnique(value) {
            const user = await User.findOne({ where: { email: value } });
            if (user) {
              throw new Error("Email exists. Please use another one.");
            }
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Username is required." },
          notEmpty: { msg: "Username is required." },
          len: { args: [2, 45], msg: "Length of username must be between 2 ~ 45 characters." },
          async isUnique(value) {
            const user = await User.findOne({ where: { username: value } });
            if (user) {
              throw new Error("Username exists. Please use another one.");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          // Check if value is provided
          if (!value) {
            throw new Error("Password is required.");
          }

          // Check length of password
          if (value.length < 6 || value.length > 45) {
            throw new Error("Length of password must be between 2 ~ 45 characters.");
          }

          // If all checks pass, hash the password
          this.setDataValue("password", bcrypt.hashSync(value, 10));
        },
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Nickname is required." },
          notEmpty: { msg: "Nickname cannot be empty." },
          len: { args: [2, 45], msg: "Nickname must be between 2 ~ 45 characters." },
        },
      },
      sex: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          notNull: { msg: "Sex is required." },
          notEmpty: { msg: "Sex cannot be empty." },
          isIn: {
            args: [[0, 1, 2]],
            msg: "The value of sex must be 0(male) or 1(female) or 2(no selection).",
          },
        },
      },
      company: DataTypes.STRING,
      introduce: DataTypes.TEXT,
      role: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          notNull: { msg: "Role is required." },
          notEmpty: { msg: "Role cannot be empty." },
          isIn: {
            args: [[0, 100]],
            msg: "The value of role must be 0(normal user) or 100(administrator).",
          },
        },
      },
      avatar: {
        type: DataTypes.STRING,
        validate: {
          isUrl: { msg: "URL is incorrect." },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};

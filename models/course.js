"use strict";
const { Model } = require("sequelize");
const moment = require("moment");
moment.locale("zh-cn");

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Course.belongsTo(models.Category, { as: "category" });
      models.Course.belongsTo(models.User, { as: "user" });
      models.Course.hasMany(models.Chapter, { as: "chapters" });
      models.Course.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: "courseId",
        as: "likeUsers",
      });
    }
  }
  Course.init(
    {
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Category ID is required." },
          notEmpty: { msg: "Category ID cannot be empty." },
          async isPresent(value) {
            const category = await sequelize.models.Category.findByPk(value);
            if (!category) {
              throw new Error(`Course with ID:${value} not exists.`);
            }
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required." },
          notEmpty: { msg: "User ID is required." },
          async isPresent(value) {
            const user = await sequelize.models.User.findByPk(value);
            if (!user) {
              throw new Error(`User with ID:${value} not exists.`);
            }
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Name is required." },
          notEmpty: { msg: "Name cannot be empty." },
          len: { args: [2, 45], msg: "Length of name must be between 2 ~ 45 characters." },
        },
      },
      image: {
        type: DataTypes.STRING,
        validate: {
          isUrl: { msg: "URL is incorrect." },
        },
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        validate: {
          isIn: {
            args: [[true, false]],
            msg: "The value of recommended must be true(recommended) or false(not recommended).",
          },
        },
      },
      introductory: {
        type: DataTypes.BOOLEAN,
        validate: {
          isIn: {
            args: [[true, false]],
            msg: "The value of introductory must be true(introductory) or false(not introductory).",
          },
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("createdAt")).format("LL"); //format("YYYY-MM-DD HH:mm:ss")
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("updatedAt")).format("LL");
        },
      },

      content: DataTypes.TEXT,
      likesCount: DataTypes.INTEGER,
      chaptersCount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Course",
    }
  );
  return Course;
};

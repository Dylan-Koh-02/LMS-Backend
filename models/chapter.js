"use strict";
const { Model } = require("sequelize");
const moment = require("moment");
moment.locale("zh-cn");
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Chapter.belongsTo(models.Course, { as: "course" });
    }
  }
  Chapter.init(
    {
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Course ID is required." },
          notEmpty: { msg: "Course ID cannot be empty." },
          async isPresent(value) {
            const course = await sequelize.models.Course.findByPk(value);
            if (!course) {
              throw new Error(`Course with ID:${value} is not found.`);
            }
          },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required." },
          notEmpty: { msg: "Title cannot be empty" },
          len: { args: [2, 45], msg: "Length of title must be between 2 ~ 45 characters." },
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("createdAt")).format("LL");
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("updatedAt")).format("LL");
        },
      },

      content: DataTypes.TEXT,
      video: {
        type: DataTypes.STRING,
        validate: {
          isUrl: { msg: "URL is incorrect." },
        },
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Rank is required." },
          notEmpty: { msg: "Rank cannot be empty." },
          isInt: { msg: "Rank must be integer" },
          isPositive(value) {
            if (value <= 0) {
              throw new Error("Rank must be a positive integer.");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Chapter",
    }
  );
  return Chapter;
};

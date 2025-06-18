"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Category.hasMany(models.Course, { as: "courses" });
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Name is required." },
          notEmpty: { msg: "Name cannot be empty." },
          len: { args: [2, 45], msg: "Length of name must be between 2 ~ 45 characters." },
          async isUnique(value) {
            const category = await Category.findOne({ where: { name: value } });
            if (category) {
              throw new Error("Name exists. Consider another name.");
            }
          },
        },
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Rank is required." },
          notEmpty: { msg: "Rank cannot be emnpty." },
          isInt: { msg: "Rank must be a integer." },
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
      modelName: "Category",
    }
  );
  return Category;
};

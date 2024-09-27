"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.hasMany(models.Chapter, {
        foreignKey: "courseid",
      });
      Course.belongsTo(models.User, {
        foreignKey: "facultyid",
      });
      Course.hasMany(models.Enrollment, {
        foreignKey: "courseid",
      });
      Course.hasOne(models.Report, {
        foreignKey: "courseid",
      });
    }
    static findAvailableCourse() {
      return this.findAll();
    }
  }
  Course.init(
    {
      coursename: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Course",
    }
  );
  return Course;
};

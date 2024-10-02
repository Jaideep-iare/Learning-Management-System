"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Enrollment.belongsTo(models.User, {
        foreignKey: "studentid",
      });
      Enrollment.belongsTo(models.Course, {
        foreignKey: "courseid",
      });
    }
    static findEnrolledCourses(loggedInUser) {
      return Enrollment.findAll({
        where: {
          studentid: loggedInUser.id,
        },
        include: [
          {
            model: sequelize.models.Course, // Include course details
            include: [
              {
                model: sequelize.models.User, // Include author details
                as: "faculty", //  alias association
                attributes: ["name"], // Fetch only the author's name
              },
            ],
          },
        ],
      });
    }
  }
  Enrollment.init(
    {
      status: {
        type: DataTypes.STRING,
        defaultValue: "enrolled", // Default status when enrolling
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // Initial progress
      },
      courseid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      studentid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Enrollment",
    }
  );
  return Enrollment;
};

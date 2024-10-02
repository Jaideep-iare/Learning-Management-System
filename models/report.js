"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.Course, {
        foreignKey: "courseid",
      });
    }
  }
  Report.init(
    {
      totalstudents: DataTypes.INTEGER,
      completedstudents: DataTypes.INTEGER,
      courseid: {
        type: DataTypes.INTEGER,
        allowNull: false, // Make sure that each course is assigned to a faculty
        references: {
          model: "Courses", // Assumes that the user model is stored in the 'Users' table
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Report",
    }
  );
  return Report;
};

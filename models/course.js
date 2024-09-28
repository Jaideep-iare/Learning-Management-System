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
        as: 'faculty', // Alias for User model
      });
      Course.hasMany(models.Enrollment, {
        foreignKey: "courseid",
      });
      Course.hasOne(models.Report, {
        foreignKey: "courseid",
      });
    }

    static findAvailableCourse() {
      return this.findAll({
         include: {
            model: sequelize.models.User, // Include User (faculty) model
            as: 'faculty', // The alias we defined earlier
            attributes: ['name'] // Only include faculty's name
         }
      });
   }
   

    static async findFacultyCourse(loggedInUser) {
      try {
          return await this.findAll({
              where: {
                  facultyid: loggedInUser.id
              }
          }) || []; // If no records, return an empty array
      } catch (error) {
          console.error("Error fetching faculty courses:", error);
          return [];
      }
  }
  
  }
  Course.init(
    {
      coursename: {
        type : DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false, 
      },
      facultyid:{
        type: DataTypes.INTEGER,
      allowNull: false, // Make sure that each course is assigned to a faculty
      references: {
        model: 'Users', // Assumes that the user model is stored in the 'Users' table
        key: 'id',
      },
      }
    },
    {
      sequelize,
      modelName: "Course",
    }
  );
  return Course;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      User.hasMany(models.Course, {
        as: "courses", //alias
        foreignKey: "facultyid",
      });
      User.hasMany(models.Enrollment, {
        foreignKey: "studentid",
      });
      User.hasMany(models.Progress, {
        foreignKey: "studentid",
      });
    }
    static findFacultyNameById(availableCourses) {
      return this.findAll({
        where: {
          id: availableCourses.facultyid,
        },
      });
    }
    static updatePassword(userid, password) {
      return this.update(
        { password: password }, // Update the password field
        { where: { id: userid } } // Specify the condition (where clause)
      );
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Name is required" },
          notEmpty: { msg: "Name cannot be empty" },
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notNull: { msg: "email is required" },
          isEmail: { msg: "Must be a valid email" },
          notEmpty: { msg: "Email cannot be empty" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "password is required" },
          notEmpty: { msg: "password cannot be empty" },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Role is required" },
          notEmpty: { msg: "Role cannot be empty" },
          isIn: {
            args: [["student", "faculty"]],
            msg: "Role must be either 'student' or 'faculty'",
          },
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

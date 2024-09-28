'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chapter.hasMany(models.Page, {
        foreignKey: 'chapterid'
      });
      Chapter.belongsTo(models.Course, {
        foreignKey: 'courseid'
      });
    }

    static getChapters(courseId){
      return Chapter.findAll({ where: { courseid: courseId } });
    }

  }
  Chapter.init({
    chaptername: {
      type : DataTypes.STRING,
      allowNull: false,
    },
    chapterdescription: {
      type: DataTypes.TEXT,
      allowNull: false, 
    },
    courseid:{
      type: DataTypes.INTEGER,
       allowNull: false, // Make sure that each course is assigned to a faculty
      references: {
      model: 'Courses', // Assumes that the user model is stored in the 'Users' table
      key: 'id',
    },
    }
  }, {
    sequelize,
    modelName: 'Chapter',
  });
  return Chapter;
};
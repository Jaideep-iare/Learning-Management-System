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
    chaptername: DataTypes.STRING,
    chapterdescription: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Chapter',
  });
  return Chapter;
};
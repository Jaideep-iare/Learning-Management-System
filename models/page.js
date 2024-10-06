"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Page.belongsTo(models.Chapter, {
        foreignKey: "chapterid",
      });
      Page.hasMany(models.Progress, {
        foreignKey: "pageid",
      });
      Page.hasMany(models.Progress, { foreignKey: "pageid" });
    }

    static getProgressPagesByUserId(allChaptersIdsForCourse, userId) {
      return this.findAll({
        where: {
          chapterid: allChaptersIdsForCourse,
        },
        include: [
          {
            model: sequelize.models.Progress,
            required: false, // Left join (show pages even if no progress)
            where: { studentid: userId }, // Get progress for the logged-in student
            attributes: ["iscompleted"], // Only fetch the iscompleted field
          },
        ],
        order: [
          ['id', 'ASC'], // Order by pageid in ascending order
        ],
      });
    }
    
    static getPagesByChapterIds(chapterids) {
      return this.findAll({
        where: { chapterid: chapterids },
        attributes: ["id", "chapterid"], // Select page 'id' and associated 'chapterid'
      });
    }
    static getPages(getChaptersByCourse) {
      return this.findAll({
        where: {
          chapterid: getChaptersByCourse.map((chapter) => chapter.id),
        },
      });
    }

    static getPagesCountByChapterIds(allChaptersIdsForCourse) {
      return Page.count({
        where: {
          chapterid: allChaptersIdsForCourse,
        },
      });
    }
  }
  Page.init(
    {
      pagename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      chapterid: {
        type: DataTypes.INTEGER,
        allowNull: false, // Make sure that each course is assigned to a faculty
        references: {
          model: "Chapters", // Assumes that the user model is stored in the 'Users' table
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Page",
    }
  );
  return Page;
};

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
    }

    static getPages(getChaptersByCourse) {
      return this.findAll({
        where: {
          chapterid: getChaptersByCourse.map((ch) => ch.id),
        },
      });
    }
  }
  Page.init(
    {
      pagename: DataTypes.STRING,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Page",
    }
  );
  return Page;
};

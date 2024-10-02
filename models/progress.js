"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Progress.belongsTo(models.User, {
        foreignKey: "studentid",
      });
      Progress.belongsTo(models.Page, {
        foreignKey: "pageid",
      });
    }
    static getCompletedPagesCount(
      allPagesIdsForCourse,
      studentid,
      iscompleted
    ) {
      return this.count({
        where: {
          pageid: allPagesIdsForCourse,
          studentid,
          iscompleted,
        },
      });
    }
  }
  Progress.init(
    {
      iscompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      studentid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Assumes that the User model is stored in the 'Users' table
          key: "id",
        },
      },
      pageid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Pages", // Assumes that the Page model is stored in the 'Pages' table
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Progress",
      indexes: [
        {
          unique: true,
          fields: ["studentid", "pageid"], // Composite unique => both studentid and pageid as a pair should be unique for upsert
        },
      ],
    }
  );
  return Progress;
};

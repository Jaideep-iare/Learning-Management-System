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
  }
  Progress.init(
    {
      iscompleted: DataTypes.BOOLEAN,
      studentid:{
        type: DataTypes.INTEGER,
         allowNull: false, // Make sure that each course is assigned to a faculty
        references: {
        model: 'Users', // Assumes that the user model is stored in the 'Users' table
        key: 'id',
      },
      },
      pageid:{
        type: DataTypes.INTEGER,
         allowNull: false, // Make sure that each course is assigned to a faculty
        references: {
        model: 'Pages', // Assumes that the user model is stored in the 'Users' table
        key: 'id',
      },
      }
    },
    {
      sequelize,
      modelName: "Progress",
    }
  );
  return Progress;
};

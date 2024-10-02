"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Progresses", "studentid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addColumn("Progresses", "pageid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    //add constraints
    await queryInterface.addConstraint("Progresses", {
      fields: ["studentid"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
    });
    await queryInterface.addConstraint("Progresses", {
      fields: ["pageid"],
      type: "foreign key",
      references: {
        table: "Pages",
        field: "id",
      },
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Progresses", "studentid");
    await queryInterface.removeColumn("Progresses", "pageid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

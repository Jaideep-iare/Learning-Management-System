"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //add column
    await queryInterface.addColumn("Chapters", "courseid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("Chapters", {
      fields: ["courseid"],
      type: "foreign key",
      references: {
        table: "Courses",
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
    await queryInterface.removeColumn("Chapters", "courseid");
  },
  /**
   * Add reverting commands here.
   *
   * Example:
   * await queryInterface.dropTable('users');
   */
};

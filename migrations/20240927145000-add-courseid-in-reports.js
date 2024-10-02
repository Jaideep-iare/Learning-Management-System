"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //add columns
    await queryInterface.addColumn("Reports", "courseid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    //add constraint
    await queryInterface.addConstraint("Reports", {
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
    //remove column
    await queryInterface.removeColumn("Reports", "courseid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

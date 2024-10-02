"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //add rows
    await queryInterface.addColumn("Enrollments", "studentid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addColumn("Enrollments", "courseid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    //add foreignkeys
    await queryInterface.addConstraint("Enrollments", {
      fields: ["studentid"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
    });
    await queryInterface.addConstraint("Enrollments", {
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
    await queryInterface.removeColumn("Enrollments", "studentid");
    await queryInterface.removeColumn("Enrollments", "courseid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

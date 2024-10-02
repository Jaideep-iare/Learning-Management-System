"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    //reflect on chapters when course gets deleted

    // Remove the existing foreign key constraint that was done without delete cascade
    await queryInterface.removeConstraint(
      "Chapters",
      "Chapters_courseid_Courses_fk"
    );

    // Add the foreign key constraint again with `onDelete: 'CASCADE'`
    await queryInterface.addConstraint("Chapters", {
      fields: ["courseid"],
      type: "foreign key",
      name: "Chapters_courseid_Courses_fk", // Optional: Explicitly naming the constraint
      references: {
        table: "Courses",
        field: "id",
      },
      onDelete: "CASCADE", // Add cascade on delete
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface) {
    // If rolling back the migration, remove the column
    await queryInterface.removeConstraint(
      "Chapters",
      "Chapters_courseid_Courses_fk"
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

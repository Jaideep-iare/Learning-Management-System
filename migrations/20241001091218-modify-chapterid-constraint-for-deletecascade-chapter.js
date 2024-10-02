"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Remove the existing foreign key constraint that was done without delete cascade
    await queryInterface.removeConstraint(
      "Pages",
      "Pages_chapterid_Chapters_fk"
    );

    // Add the foreign key constraint again with `onDelete: 'CASCADE'`
    await queryInterface.addConstraint("Pages", {
      fields: ["chapterid"],
      type: "foreign key",
      name: "Pages_chapterid_Chapters_fk", // Optional: Explicitly naming the constraint
      references: {
        table: "Chapters",
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
    await queryInterface.removeColumn("Pages", "chapterid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //add column
    await queryInterface.addColumn("Pages", "chapterid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    //make as foreign key
    await queryInterface.addConstraint("Pages", {
      fields: ["chapterid"],
      type: "foreign key",
      references: {
        table: "Chapters",
        field: "id",
      },
    });

    // Add the foreign key constraint with cascade on delete
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
    //if to rollback the particular migration then this will execute:
    await queryInterface.removeColumn("Pages", "chapterid");
  },
  /**
   * Add reverting commands here.
   *
   * Example:
   * await queryInterface.dropTable('users');
   */
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pages", "chapterid");
    await queryInterface.addColumn("Pages", "chapterid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    // Add the foreign key constraint with cascade on delete
    await queryInterface.addConstraint("Pages", {
      fields: ["chapterid"],
      type: "foreign key",
      name: "Pages_chapterid_Chapters_fk", // Explicitly name the constraint
      references: {
        table: "Chapters",
        field: "id",
      },
      onDelete: "CASCADE", // Add cascade on delete
      onUpdate: "CASCADE",
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface) {
    await queryInterface.removeColumn("Pages", "chapterid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
     // Add unique constraint to studentid and pageid columns
     await queryInterface.addConstraint('Progresses', {
      fields: ['studentid', 'pageid'],
      type: 'unique',
      name: 'unique_student_page' // Name of the unique constraint
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface) {
    // Remove unique constraint if needed
    await queryInterface.removeConstraint('Progresses', 'unique_student_page');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

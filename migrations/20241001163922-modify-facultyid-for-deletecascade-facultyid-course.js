'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {

    //reflect in all tables when user i.e faculty is removed from Users by chance


    // Remove the existing foreign key constraint that was done without delete cascade
    await queryInterface.removeConstraint('Courses', 'Courses_facultyid_Users_fk');

    // Add the foreign key constraint again with `onDelete: 'CASCADE'`
    await queryInterface.addConstraint('Courses', {
      fields: ['facultyid'],
      type: 'foreign key',
      name: 'Courses_facultyid_Users_fk',  // Optional: Explicitly naming the constraint
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',  // Add cascade on delete
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface) {
    // If rolling back the migration, remove the column
    await queryInterface.removeColumn('Courses', 'facultyid');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

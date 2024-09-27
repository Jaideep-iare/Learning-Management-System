'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // add column
    await queryInterface.addColumn('Courses','facultyid',{
      type:Sequelize.DataTypes.INTEGER
    });
    //make foreign key
    await queryInterface.addConstraint('Courses',{
      fields:['facultyid'],
      type: 'foreign key',
      references: {
        table: 'Users',
        field: 'id',
    }
  });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface) {
    // Remove column
    await queryInterface.removeColumn('Courses', 'facultyid');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

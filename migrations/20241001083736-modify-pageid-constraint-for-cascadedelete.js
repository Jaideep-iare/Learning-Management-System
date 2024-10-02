'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Remove the existing foreign key constraint that was done without delete cascade
    await queryInterface.removeConstraint('Progresses', 'Progresses_pageid_Pages_fk');

    // Add the foreign key constraint again with `onDelete: 'CASCADE'`
    await queryInterface.addConstraint('Progresses', {
      fields: ['pageid'],
      type: 'foreign key',
      name: 'Progresses_pageid_Pages_fk', // You need to reuse the same name if it matters
      references: {
        table: 'Pages',
        field: 'id',
      },
      onDelete: 'CASCADE', // Enable cascading delete
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface) {
    // In the down migration, remove the constraint with `onDelete: 'CASCADE'`
    await queryInterface.removeConstraint('Progresses', 'Progresses_pageid_Pages_fk');

    // Add the old constraint back (without onDelete)
    await queryInterface.addConstraint('Progresses', {
      fields: ['pageid'],
      type: 'foreign key',
      name: 'Progresses_pageid_Pages_fk', // Re-add the original constraint without cascade
      references: {
        table: 'Pages',
        field: 'id',
      },
      onDelete: 'NO ACTION', // You can adjust this based on what the previous behavior was
    });
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

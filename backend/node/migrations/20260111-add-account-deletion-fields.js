/**
 * Agrega campos faltantes para solicitudes de eliminacion de cuenta
 * - scheduled_deletion_date (DATEONLY)
 * - cancelled_at (DATE)
 * - completed_at (DATE)
 * - metadata (JSON)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('account_deletion_request', 'scheduled_deletion_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Fecha programada para completar la eliminacion'
    });

    await queryInterface.addColumn('account_deletion_request', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de cancelacion (self-service)'
    });

    await queryInterface.addColumn('account_deletion_request', 'completed_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha en que la eliminacion se completo'
    });

    await queryInterface.addColumn('account_deletion_request', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Datos adicionales de la solicitud'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('account_deletion_request', 'metadata');
    await queryInterface.removeColumn('account_deletion_request', 'completed_at');
    await queryInterface.removeColumn('account_deletion_request', 'cancelled_at');
    await queryInterface.removeColumn('account_deletion_request', 'scheduled_deletion_date');
  }
};

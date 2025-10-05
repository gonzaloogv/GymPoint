'use strict';

/**
 * MigraciÃ³n: Crear tabla de agregados diarios de recompensas por gimnasio
 * 
 * Tabla: reward_gym_stats_daily
 * PropÃ³sito: Almacenar estadÃ­sticas diarias consolidadas para mejorar performance
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('ðŸ”„ Creando tabla reward_gym_stats_daily...\n');
      
      await queryInterface.createTable('reward_gym_stats_daily', {
        day: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          primaryKey: true
        },
        gym_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        claims: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        redeemed: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        revoked: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        tokens_spent: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        tokens_refunded: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      console.log('âœ… Tabla reward_gym_stats_daily creada');
      
      // Crear Ã­ndice para consultas por rango de fechas
      await queryInterface.addIndex('reward_gym_stats_daily', ['day'], {
        name: 'idx_reward_gym_stats_day',
        transaction
      });
      
      await queryInterface.addIndex('reward_gym_stats_daily', ['gym_id', 'day'], {
        name: 'idx_reward_gym_stats_gym_day',
        transaction
      });
      
      console.log('âœ… Ãndices creados');
      
      await transaction.commit();
      console.log('\nâœ… MigraciÃ³n completada con Ã©xito\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('âŒ Error en migraciÃ³n:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.dropTable('reward_gym_stats_daily', { transaction });
      
      await transaction.commit();
      console.log('âœ… Rollback completado');
      
    } catch (error) {
      await transaction.rollback();
      console.error('âŒ Error en rollback:', error.message);
      throw error;
    }
  }
};



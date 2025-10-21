'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Verificando y agregando columnas de snapshot...\n');
      
      const [rewardColumns] = await queryInterface.sequelize.query(
        "SHOW COLUMNS FROM reward",
        { transaction }
      );
      
      const rewardColumnNames = rewardColumns.map(c => c.Field);
      
      if (!rewardColumnNames.includes('provider')) {
        await queryInterface.addColumn('reward', 'provider', {
          type: Sequelize.ENUM('system', 'gym'),
          allowNull: false,
          defaultValue: 'system'
        }, { transaction });
        console.log('✅ Columna provider agregada a reward');
      }
      
      if (!rewardColumnNames.includes('id_gym')) {
        await queryInterface.addColumn('reward', 'id_gym', {
          type: Sequelize.BIGINT,
          allowNull: true
        }, { transaction });
        console.log('✅ Columna id_gym agregada a reward');
      }
      
      if (!rewardColumnNames.includes('fulfillment_type')) {
        await queryInterface.addColumn('reward', 'fulfillment_type', {
          type: Sequelize.ENUM('auto', 'manual'),
          allowNull: false,
          defaultValue: 'auto'
        }, { transaction });
        console.log('✅ Columna fulfillment_type agregada a reward');
      }
      
      const [claimedColumns] = await queryInterface.sequelize.query(
        "SHOW COLUMNS FROM claimed_reward",
        { transaction }
      );
      
      const claimedColumnNames = claimedColumns.map(c => c.Field);
      
      if (!claimedColumnNames.includes('provider_snapshot')) {
        await queryInterface.addColumn('claimed_reward', 'provider_snapshot', {
          type: Sequelize.ENUM('system', 'gym'),
          allowNull: true
        }, { transaction });
        console.log('✅ Columna provider_snapshot agregada');
      }
      
      if (!claimedColumnNames.includes('gym_id_snapshot')) {
        await queryInterface.addColumn('claimed_reward', 'gym_id_snapshot', {
          type: Sequelize.BIGINT,
          allowNull: true
        }, { transaction });
        console.log('✅ Columna gym_id_snapshot agregada');
      }
      
      const statusColumn = claimedColumns.find(c => c.Field === 'status');
      if (statusColumn && statusColumn.Type.includes('tinyint')) {
        console.log('🔄 Migrando status de BOOLEAN a ENUM...');
        
        await queryInterface.addColumn('claimed_reward', 'status_enum', {
          type: Sequelize.ENUM('pending', 'redeemed', 'revoked'),
          allowNull: true
        }, { transaction });
        
        await queryInterface.sequelize.query(
          "UPDATE claimed_reward SET status_enum = CASE WHEN status = 1 THEN 'redeemed' WHEN status = 0 THEN 'pending' ELSE 'pending' END",
          { transaction }
        );
        
        await queryInterface.changeColumn('claimed_reward', 'status_enum', {
          type: Sequelize.ENUM('pending', 'redeemed', 'revoked'),
          allowNull: false
        }, { transaction });
        
        await queryInterface.removeColumn('claimed_reward', 'status', { transaction });
        await queryInterface.renameColumn('claimed_reward', 'status_enum', 'status', { transaction });
        
        console.log('✅ status migrado a ENUM');
      }
      
      console.log('🔄 Ejecutando backfill...');
      await queryInterface.sequelize.query(
        "UPDATE claimed_reward cr JOIN reward r ON cr.id_reward = r.id_reward SET cr.provider_snapshot = COALESCE(cr.provider_snapshot, r.provider), cr.gym_id_snapshot = COALESCE(cr.gym_id_snapshot, r.id_gym) WHERE cr.provider_snapshot IS NULL OR cr.gym_id_snapshot IS NULL",
        { transaction }
      );
      console.log('✅ Backfill completado');
      
      console.log('🔄 Creando índices...');
      
      const [indexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM claimed_reward",
        { transaction }
      );
      
      const indexNames = indexes.map(i => i.Key_name);
      
      if (!indexNames.includes('idx_claimed_reward_gym_date')) {
        await queryInterface.addIndex('claimed_reward', ['gym_id_snapshot', 'claimed_date'], {
          name: 'idx_claimed_reward_gym_date',
          transaction
        });
      }
      
      if (!indexNames.includes('idx_claimed_reward_stats')) {
        await queryInterface.addIndex('claimed_reward', ['id_reward', 'status', 'claimed_date'], {
          name: 'idx_claimed_reward_stats',
          transaction
        });
      }
      
      const [rewardIndexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM reward",
        { transaction }
      );
      
      const rewardIndexNames = rewardIndexes.map(i => i.Key_name);
      
      if (!rewardIndexNames.includes('idx_reward_gym_provider')) {
        await queryInterface.addIndex('reward', ['id_gym', 'provider'], {
          name: 'idx_reward_gym_provider',
          transaction
        });
      }
      
      const [transIndexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM transaction",
        { transaction }
      );
      
      const transIndexNames = transIndexes.map(i => i.Key_name);
      
      if (!transIndexNames.includes('idx_transaction_reward_date')) {
        await queryInterface.addIndex('transaction', ['id_reward', 'date'], {
          name: 'idx_transaction_reward_date',
          transaction
        });
      }
      
      console.log('✅ Índices creados');
      
      await transaction.commit();
      console.log('\n✅ Migración completada con éxito\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.removeIndex('claimed_reward', 'idx_claimed_reward_gym_date', { transaction }).catch(() => {});
      await queryInterface.removeIndex('claimed_reward', 'idx_claimed_reward_stats', { transaction }).catch(() => {});
      await queryInterface.removeIndex('reward', 'idx_reward_gym_provider', { transaction }).catch(() => {});
      await queryInterface.removeIndex('transaction', 'idx_transaction_reward_date', { transaction }).catch(() => {});
      
      await queryInterface.removeColumn('claimed_reward', 'provider_snapshot', { transaction }).catch(() => {});
      await queryInterface.removeColumn('claimed_reward', 'gym_id_snapshot', { transaction }).catch(() => {});
      
      await queryInterface.removeColumn('reward', 'fulfillment_type', { transaction }).catch(() => {});
      await queryInterface.removeColumn('reward', 'id_gym', { transaction }).catch(() => {});
      await queryInterface.removeColumn('reward', 'provider', { transaction }).catch(() => {});
      
      await transaction.commit();
      console.log('✅ Rollback completado');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error.message);
      throw error;
    }
  }
};

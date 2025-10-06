'use strict';

/**
 * Migración: Índices críticos y campos de auditoría
 *
 * Agrega índices de performance y campos created_at/updated_at faltantes
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando índices críticos y campos de auditoría...\n');

      // ============================================================
      // FASE 1: Índices en token_ledger
      // ============================================================
      console.log('📌 FASE 1: Índices en token_ledger...');

      const tokenLedgerIndexes = await queryInterface.showIndex('token_ledger');
      const tokenLedgerIndexNames = tokenLedgerIndexes.map(idx => idx.name);

      if (!tokenLedgerIndexNames.includes('idx_ledger_user_date')) {
        console.log('   → Creando idx_ledger_user_date...');
        await queryInterface.addIndex('token_ledger', ['id_user_profile', 'created_at'], {
          name: 'idx_ledger_user_date',
          transaction
        });
      }

      if (!tokenLedgerIndexNames.includes('idx_ledger_ref')) {
        console.log('   → Creando idx_ledger_ref...');
        await queryInterface.addIndex('token_ledger', ['ref_type', 'ref_id'], {
          name: 'idx_ledger_ref',
          transaction
        });
      }

      if (!tokenLedgerIndexNames.includes('idx_ledger_reason')) {
        console.log('   → Creando idx_ledger_reason...');
        await queryInterface.addIndex('token_ledger', ['reason'], {
          name: 'idx_ledger_reason',
          transaction
        });
      }

      // ============================================================
      // FASE 2: Índices en assistance
      // ============================================================
      console.log('\n📌 FASE 2: Índices en assistance...');

      const assistanceIndexes = await queryInterface.showIndex('assistance');
      const assistanceIndexNames = assistanceIndexes.map(idx => idx.name);

      if (!assistanceIndexNames.includes('idx_assistance_user_date')) {
        console.log('   → Creando idx_assistance_user_date...');
        await queryInterface.addIndex('assistance', ['id_user', 'date'], {
          name: 'idx_assistance_user_date',
          transaction
        });
      }

      if (!assistanceIndexNames.includes('idx_assistance_gym_date')) {
        console.log('   → Creando idx_assistance_gym_date...');
        await queryInterface.addIndex('assistance', ['id_gym', 'date'], {
          name: 'idx_assistance_gym_date',
          transaction
        });
      }

      // ============================================================
      // FASE 3: Índices en frequency y streak
      // ============================================================
      console.log('\n📌 FASE 3: Índices en frequency y streak...');

      const frequencyIndexes = await queryInterface.showIndex('frequency');
      const frequencyIndexNames = frequencyIndexes.map(idx => idx.name);

      if (!frequencyIndexNames.includes('idx_frequency_user')) {
        console.log('   → Creando idx_frequency_user...');
        await queryInterface.addIndex('frequency', ['id_user'], {
          name: 'idx_frequency_user',
          transaction
        });
      }

      const streakIndexes = await queryInterface.showIndex('streak');
      const streakIndexNames = streakIndexes.map(idx => idx.name);

      if (!streakIndexNames.includes('idx_streak_user')) {
        console.log('   → Creando idx_streak_user...');
        await queryInterface.addIndex('streak', ['id_user'], {
          name: 'idx_streak_user',
          transaction
        });
      }

      // ============================================================
      // FASE 4: Índice geoespacial en gym
      // ============================================================
      console.log('\n📌 FASE 4: Índice en gym para búsqueda geoespacial...');

      const gymIndexes = await queryInterface.showIndex('gym');
      const gymIndexNames = gymIndexes.map(idx => idx.name);

      if (!gymIndexNames.includes('idx_gym_location')) {
        console.log('   → Creando idx_gym_location...');
        await queryInterface.addIndex('gym', ['latitude', 'longitude'], {
          name: 'idx_gym_location',
          transaction
        });
      }

      // ============================================================
      // FASE 5: Campos de auditoría
      // ============================================================
      console.log('\n📌 FASE 5: Agregando campos de auditoría...');

      // Verificar y agregar created_at a frequency
      const frequencyColumns = await queryInterface.describeTable('frequency');
      if (!frequencyColumns.created_at) {
        console.log('   → Agregando created_at a frequency...');
        await queryInterface.addColumn('frequency', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      // Verificar y agregar created_at/updated_at a streak
      const streakColumns = await queryInterface.describeTable('streak');
      if (!streakColumns.created_at) {
        console.log('   → Agregando created_at a streak...');
        await queryInterface.addColumn('streak', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      if (!streakColumns.updated_at) {
        console.log('   → Agregando updated_at a streak...');
        await queryInterface.addColumn('streak', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }

      // Verificar y agregar created_at a assistance
      const assistanceColumns = await queryInterface.describeTable('assistance');
      if (!assistanceColumns.created_at) {
        console.log('   → Agregando created_at a assistance...');
        await queryInterface.addColumn('assistance', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      await transaction.commit();
      console.log('\n✅ Índices críticos y campos de auditoría agregados exitosamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔄 Revirtiendo índices y campos de auditoría...\n');

      // Eliminar campos de auditoría
      await queryInterface.removeColumn('assistance', 'created_at', { transaction });
      await queryInterface.removeColumn('streak', 'updated_at', { transaction });
      await queryInterface.removeColumn('streak', 'created_at', { transaction });
      await queryInterface.removeColumn('frequency', 'created_at', { transaction });

      // Eliminar índices
      await queryInterface.removeIndex('gym', 'idx_gym_location', { transaction });
      await queryInterface.removeIndex('streak', 'idx_streak_user', { transaction });
      await queryInterface.removeIndex('frequency', 'idx_frequency_user', { transaction });
      await queryInterface.removeIndex('assistance', 'idx_assistance_gym_date', { transaction });
      await queryInterface.removeIndex('assistance', 'idx_assistance_user_date', { transaction });
      await queryInterface.removeIndex('token_ledger', 'idx_ledger_reason', { transaction });
      await queryInterface.removeIndex('token_ledger', 'idx_ledger_ref', { transaction });
      await queryInterface.removeIndex('token_ledger', 'idx_ledger_user_date', { transaction });

      await transaction.commit();
      console.log('\n✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR AL REVERTIR:', error.message);
      throw error;
    }
  }
};

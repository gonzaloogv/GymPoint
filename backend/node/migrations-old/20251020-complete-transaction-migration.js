'use strict';

/**
 * Completar migración transaction → token_ledger
 *
 * Esta migración:
 * 1. Verifica si token_ledger tiene datos
 * 2. Limpia transactions huérfanas (usuarios no existentes)
 * 3. Migra los datos de transaction a token_ledger
 * 4. Elimina la tabla transaction legacy
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Completando migración transaction → token_ledger...\n');

      // 1. Verificar si token_ledger tiene datos
      const [ledgerCount] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM token_ledger',
        { transaction }
      );

      if (ledgerCount[0].count > 0) {
        console.log('⚠️  token_ledger ya tiene datos, saltando migración...');
        await transaction.commit();
        return;
      }

      // 2. Verificar si la tabla transaction existe
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('transaction')) {
        console.log('⚠️  Tabla transaction no existe, saltando migración...');
        await transaction.commit();
        return;
      }

      // 3. Limpiar transactions huérfanas (usuarios que no existen en user_profiles)
      console.log('   → Limpiando transactions huérfanas...');
      const [deleteResult] = await queryInterface.sequelize.query(
        `DELETE FROM transaction
         WHERE id_user NOT IN (SELECT id_user_profile FROM user_profiles)`,
        { transaction }
      );
      console.log(`   ✓ ${deleteResult.affectedRows || 0} registros huérfanos eliminados`);

      // 4. Contar registros a migrar
      const [transactionCount] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM transaction',
        { transaction }
      );
      console.log(`   → Registros a migrar: ${transactionCount[0].count}`);

      if (transactionCount[0].count === 0) {
        console.log('   ⚠️  No hay registros para migrar');
        await queryInterface.dropTable('transaction', { transaction });
        await transaction.commit();
        console.log('\n✅ Tabla transaction eliminada (sin datos)\n');
        return;
      }

      // 5. Migrar datos desde transaction a token_ledger
      console.log('   → Migrando datos desde transaction...');
      await queryInterface.sequelize.query(
        `INSERT INTO token_ledger
         (id_user_profile, delta, reason, ref_type, ref_id, balance_after, created_at)
         SELECT
           t.id_user,
           CASE
             WHEN t.movement_type = 'GANANCIA' THEN t.amount
             WHEN t.movement_type = 'GASTO' THEN -t.amount
             ELSE 0
           END as delta,
           COALESCE(t.motive,
             CASE
               WHEN t.movement_type = 'GANANCIA' THEN 'LEGACY_GAIN'
               ELSE 'LEGACY_SPEND'
             END
           ) as reason,
           CASE
             WHEN t.id_reward IS NOT NULL THEN 'claimed_reward'
             ELSE NULL
           END as ref_type,
           t.id_reward as ref_id,
           t.result_balance as balance_after,
           TIMESTAMP(t.date) as created_at
         FROM transaction t
         WHERE t.id_user IN (SELECT id_user_profile FROM user_profiles)
         ORDER BY t.id_transaction ASC`,
        { transaction }
      );

      // 6. Verificar que se migraron correctamente
      const [migratedCount] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM token_ledger',
        { transaction }
      );
      console.log(`   ✓ ${migratedCount[0].count} registros migrados exitosamente`);

      // 7. Eliminar tabla transaction
      console.log('   → Eliminando tabla transaction...');
      await queryInterface.dropTable('transaction', { transaction });

      await transaction.commit();
      console.log('\n✅ Migración completada exitosamente');
      console.log('✅ Tabla transaction eliminada');
      console.log(`✅ ${migratedCount[0].count} registros migrados a token_ledger\n`);

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔄 Revirtiendo migración token_ledger → transaction...\n');

      // Recrear transaction desde token_ledger
      console.log('   → Recreando tabla transaction...');
      await queryInterface.createTable('transaction', {
        id_transaction: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        id_user: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        movement_type: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        id_reward: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        result_balance: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        motive: {
          type: Sequelize.STRING(255),
          allowNull: true
        }
      }, { transaction });

      // Agregar índices
      await queryInterface.addIndex('transaction', ['id_reward', 'date'], {
        name: 'idx_transaction_reward_date',
        transaction
      });

      await queryInterface.addConstraint('transaction', {
        fields: ['id_reward'],
        type: 'foreign key',
        name: 'fk_transaction_reward',
        references: {
          table: 'reward',
          field: 'id_reward'
        },
        onDelete: 'SET NULL',
        transaction
      });

      // Migrar datos de vuelta
      console.log('   → Migrando datos de token_ledger a transaction...');
      await queryInterface.sequelize.query(
        `INSERT INTO transaction
         (id_user, movement_type, amount, date, id_reward, result_balance, motive)
         SELECT
           id_user_profile,
           CASE WHEN delta > 0 THEN 'GANANCIA' ELSE 'GASTO' END,
           ABS(delta),
           DATE(created_at),
           CASE WHEN ref_type = 'claimed_reward' THEN ref_id ELSE NULL END,
           balance_after,
           reason
         FROM token_ledger
         ORDER BY id_ledger ASC`,
        { transaction }
      );

      // Eliminar registros de token_ledger
      console.log('   → Limpiando token_ledger...');
      await queryInterface.sequelize.query(
        'DELETE FROM token_ledger WHERE ref_type = "claimed_reward" OR reason LIKE "LEGACY_%"',
        { transaction }
      );

      await transaction.commit();
      console.log('\n✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR AL REVERTIR:', error.message);
      throw error;
    }
  }
};

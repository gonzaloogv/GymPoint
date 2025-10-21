'use strict';

/**
 * Migración: transaction → token_ledger
 *
 * Convierte la tabla transaction legacy a token_ledger completo
 * según especificación de CLAUDE.md
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Migrando transaction → token_ledger...\n');

      // Verificar si token_ledger ya existe
      const tables = await queryInterface.showAllTables();
      if (tables.includes('token_ledger')) {
        console.log('⚠️  token_ledger ya existe, saltando creación...');
        await transaction.commit();
        return;
      }

      // 1. Crear tabla token_ledger
      console.log('   → Creando tabla token_ledger...');
      await queryInterface.createTable('token_ledger', {
        id_ledger: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        delta: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Positivo=ganancia, negativo=gasto'
        },
        reason: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, WEEKLY_BONUS, etc.'
        },
        ref_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'assistance, claimed_reward, routine, etc.'
        },
        ref_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          comment: 'ID del registro relacionado'
        },
        balance_after: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Balance después de aplicar delta'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 2. Limpiar transactions huérfanas (usuarios que no existen en user_profiles)
      console.log('   → Limpiando transactions huérfanas...');
      await queryInterface.sequelize.query(
        `DELETE FROM transaction
         WHERE id_user NOT IN (SELECT id_user_profile FROM user_profiles)`,
        { transaction }
      );

      // 3. Migrar datos desde transaction
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
         ORDER BY t.id_transaction ASC`,
        { transaction }
      );

      // 4. Eliminar tabla transaction antigua
      console.log('   → Eliminando tabla transaction antigua...');
      await queryInterface.dropTable('transaction', { transaction });

      await transaction.commit();
      console.log('\n✅ Migración transaction → token_ledger completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔄 Revirtiendo migración token_ledger → transaction...\n');

      // Recrear transaction desde token_ledger
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

      await queryInterface.dropTable('token_ledger', { transaction });

      await transaction.commit();
      console.log('\n✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR AL REVERTIR:', error.message);
      throw error;
    }
  }
};

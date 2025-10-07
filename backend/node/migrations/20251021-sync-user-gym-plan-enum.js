'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Sincronizando user_gym.plan: VARCHAR → ENUM...\n');

      // 1. Verificar datos actuales
      const [rows] = await queryInterface.sequelize.query(
        'SELECT DISTINCT plan FROM user_gym WHERE plan IS NOT NULL',
        { transaction }
      );

      console.log('   → Valores actuales de plan:', rows.map(r => r.plan));

      // 2. Mapear valores antiguos a ENUM
      // Asumiendo que los planes antiguos eran tipos de membresía, los mapeamos a MENSUAL
      const mapping = {
        'completo': 'MENSUAL',
        'musculacion': 'MENSUAL',
        'mensual': 'MENSUAL',
        'semanal': 'SEMANAL',
        'anual': 'ANUAL'
      };

      for (const [oldValue, newValue] of Object.entries(mapping)) {
        const [updateResult] = await queryInterface.sequelize.query(
          `UPDATE user_gym SET plan = :newValue WHERE LOWER(plan) = :oldValue`,
          {
            replacements: { oldValue, newValue },
            transaction
          }
        );
        if (updateResult.affectedRows > 0) {
          console.log(`   ✓ Actualizado "${oldValue}" → "${newValue}" (${updateResult.affectedRows} registros)`);
        }
      }

      // 3. Verificar que no queden valores inválidos
      const [invalidRows] = await queryInterface.sequelize.query(
        `SELECT DISTINCT plan FROM user_gym
         WHERE plan IS NOT NULL
         AND plan NOT IN ('MENSUAL', 'SEMANAL', 'ANUAL')`,
        { transaction }
      );

      if (invalidRows.length > 0) {
        console.warn('   ⚠️  Valores no mapeados encontrados:', invalidRows.map(r => r.plan));
        console.warn('   → Estableciendo valores no mapeados a MENSUAL por defecto');

        await queryInterface.sequelize.query(
          `UPDATE user_gym SET plan = 'MENSUAL'
           WHERE plan IS NOT NULL
           AND plan NOT IN ('MENSUAL', 'SEMANAL', 'ANUAL')`,
          { transaction }
        );
      }

      // 4. Cambiar tipo de columna a ENUM
      console.log('   → Cambiando tipo de columna a ENUM...');

      await queryInterface.changeColumn('user_gym', 'plan', {
        type: Sequelize.ENUM('MENSUAL', 'SEMANAL', 'ANUAL'),
        allowNull: false,
        defaultValue: 'MENSUAL'
      }, { transaction });

      await transaction.commit();
      console.log('\n✅ Sincronización completada exitosamente');
      console.log('✅ user_gym.plan ahora es ENUM(\'MENSUAL\', \'SEMANAL\', \'ANUAL\')\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔄 Revirtiendo sincronización de user_gym.plan...\n');

      // Revertir a VARCHAR
      await queryInterface.changeColumn('user_gym', 'plan', {
        type: Sequelize.STRING(250),
        allowNull: true
      }, { transaction });

      await transaction.commit();
      console.log('\n✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR EN REVERSIÓN:', error.message);
      throw error;
    }
  }
};

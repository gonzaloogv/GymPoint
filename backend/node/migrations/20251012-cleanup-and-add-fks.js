'use strict';

/**
 * Migración: Limpieza de Datos Huérfanos + Foreign Keys Completas
 *
 * Esta migración resuelve los problemas de integridad de datos y agrega todas las FKs faltantes:
 *
 * LIMPIEZA:
 * 1. Elimina assistance que usa streak huérfano
 * 2. Elimina streak con id_frequency inexistente
 * 3. Elimina frequency del admin (que no tiene user_profile)
 * 4. Recrea frequency y streak válidos para el usuario
 *
 * FOREIGN KEYS:
 * 5. frequency.id_user → user_profiles
 * 6. progress.id_user → user_profiles
 * 7. streak.id_frequency → frequency
 * 8. streak.id_user → user_profiles
 * 9. gym_payment.id_user → user_profiles
 * 10. user_profiles.id_streak → streak
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Iniciando limpieza de datos y agregado de FKs...\n');

      // ========================================
      // FASE 1: LIMPIEZA DE DATOS HUÉRFANOS
      // ========================================
      console.log('📋 FASE 1: Limpieza de datos huérfanos\n');

      // 1. Limpiar user_profiles.id_streak huérfano
      console.log('  1️⃣ Limpiando user_profiles.id_streak...');
      await queryInterface.sequelize.query(
        `UPDATE user_profiles up
         LEFT JOIN streak s ON up.id_streak = s.id_streak
         SET up.id_streak = NULL
         WHERE up.id_streak IS NOT NULL AND s.id_streak IS NULL`,
        { transaction }
      );
      console.log('     ✅ Referencias huérfanas eliminadas\n');

      // 2. Eliminar assistance que usa streak con frequency inexistente
      console.log('  2️⃣ Eliminando assistance con streak huérfano...');
      const [assistanceToDelete] = await queryInterface.sequelize.query(
        `SELECT a.id_assistance FROM assistance a
         JOIN streak s ON a.id_streak = s.id_streak
         LEFT JOIN frequency f ON s.id_frequency = f.id_frequency
         WHERE f.id_frequency IS NULL`,
        { transaction }
      );

      if (assistanceToDelete.length > 0) {
        const idsToDelete = assistanceToDelete.map(row => row.id_assistance).join(',');
        await queryInterface.sequelize.query(
          `DELETE FROM assistance WHERE id_assistance IN (${idsToDelete})`,
          { transaction }
        );
        console.log(`     ✅ ${assistanceToDelete.length} assistance eliminados\n`);
      } else {
        console.log('     ⏭️  No hay assistance huérfanos\n');
      }

      // 3. Limpiar referencias a streak huérfano desde tabla user antigua
      console.log('  3️⃣ Limpiando referencias desde tabla user...');
      await queryInterface.sequelize.query(
        `UPDATE user u
         LEFT JOIN streak s ON u.id_streak = s.id_streak
         SET u.id_streak = NULL
         WHERE u.id_streak IS NOT NULL AND s.id_streak IS NULL`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE user u
         JOIN streak s ON u.id_streak = s.id_streak
         LEFT JOIN frequency f ON s.id_frequency = f.id_frequency
         SET u.id_streak = NULL
         WHERE f.id_frequency IS NULL`,
        { transaction }
      );
      console.log('     ✅ Referencias limpiadas\n');

      // 4. Eliminar streak huérfanos (con frequency inexistente)
      console.log('  4️⃣ Eliminando streaks con frequency inexistente...');
      const [orphanStreaks] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM streak s
         LEFT JOIN frequency f ON s.id_frequency = f.id_frequency
         WHERE f.id_frequency IS NULL`,
        { transaction }
      );

      if (orphanStreaks[0].count > 0) {
        await queryInterface.sequelize.query(
          `DELETE FROM streak WHERE id_frequency NOT IN (SELECT id_frequency FROM frequency)`,
          { transaction }
        );
        console.log(`     ✅ ${orphanStreaks[0].count} streaks huérfanos eliminados\n`);
      } else {
        console.log('     ⏭️  No hay streaks huérfanos\n');
      }

      // 5. Eliminar frequency de admins (que no tienen user_profile)
      console.log('  5️⃣ Eliminando frequency de admins...');
      const [adminFreq] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM frequency f
         LEFT JOIN user_profiles up ON f.id_user = up.id_user_profile
         WHERE up.id_user_profile IS NULL`,
        { transaction }
      );

      if (adminFreq[0].count > 0) {
        // Primero eliminar streaks que usan esas frequencies
        await queryInterface.sequelize.query(
          `DELETE FROM streak WHERE id_frequency IN (
            SELECT id_frequency FROM frequency WHERE id_user NOT IN (SELECT id_user_profile FROM user_profiles)
          )`,
          { transaction }
        );

        await queryInterface.sequelize.query(
          `DELETE FROM frequency WHERE id_user NOT IN (SELECT id_user_profile FROM user_profiles)`,
          { transaction }
        );
        console.log(`     ✅ ${adminFreq[0].count} frequency de admins eliminados\n`);
      } else {
        console.log('     ⏭️  No hay frequency de admins\n');
      }

      // 6. Verificar/crear frequency para usuario válido
      console.log('  6️⃣ Verificando frequency para usuario...');
      const [[userProfile]] = await queryInterface.sequelize.query(
        `SELECT id_user_profile FROM user_profiles LIMIT 1`,
        { transaction }
      );

      if (userProfile) {
        const [[existingFreq]] = await queryInterface.sequelize.query(
          `SELECT id_frequency FROM frequency WHERE id_user = ?`,
          { replacements: [userProfile.id_user_profile], transaction }
        );

        let frequencyId;
        if (!existingFreq) {
          const [result] = await queryInterface.sequelize.query(
            `INSERT INTO frequency (achieved_goal, id_user, goal, assist)
             VALUES (0, ?, 3, 0)`,
            { replacements: [userProfile.id_user_profile], transaction }
          );
          frequencyId = result;
          console.log(`     ✅ Frequency creado (ID: ${frequencyId})\n`);
        } else {
          frequencyId = existingFreq.id_frequency;
          console.log(`     ⏭️  Frequency ya existe (ID: ${frequencyId})\n`);
        }

        // 7. Verificar/crear streak para usuario
        console.log('  7️⃣ Verificando streak para usuario...');
        const [[existingStreak]] = await queryInterface.sequelize.query(
          `SELECT id_streak FROM streak WHERE id_user = ?`,
          { replacements: [userProfile.id_user_profile], transaction }
        );

        let streakId;
        if (!existingStreak) {
          const [result] = await queryInterface.sequelize.query(
            `INSERT INTO streak (id_user, value, id_frequency, last_value, recovery_items)
             VALUES (?, 0, ?, 0, 0)`,
            { replacements: [userProfile.id_user_profile, frequencyId], transaction }
          );
          streakId = result;
          console.log(`     ✅ Streak creado (ID: ${streakId})\n`);
        } else {
          streakId = existingStreak.id_streak;
          console.log(`     ⏭️  Streak ya existe (ID: ${streakId})\n`);
        }

        // 8. Actualizar user_profiles.id_streak
        console.log('  8️⃣ Actualizando user_profiles.id_streak...');
        await queryInterface.sequelize.query(
          `UPDATE user_profiles SET id_streak = ? WHERE id_user_profile = ? AND id_streak IS NULL`,
          { replacements: [streakId, userProfile.id_user_profile], transaction }
        );
        console.log('     ✅ user_profiles.id_streak actualizado\n');
      }

      // ========================================
      // FASE 2: AGREGAR FOREIGN KEYS
      // ========================================
      console.log('📋 FASE 2: Agregando Foreign Keys\n');

      // FK 1: frequency.id_user → user_profiles
      console.log('  1️⃣ frequency.id_user → user_profiles');
      const [freqFk] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = 'frequency' AND COLUMN_NAME = 'id_user'
           AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      if (freqFk.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE frequency
           ADD CONSTRAINT fk_frequency_user_profile
           FOREIGN KEY (id_user) REFERENCES user_profiles(id_user_profile)
           ON DELETE CASCADE ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('     ✅ FK agregada\n');
      } else {
        console.log('     ⏭️  Ya existe\n');
      }

      // FK 2: progress.id_user → user_profiles
      console.log('  2️⃣ progress.id_user → user_profiles');
      const [progFk] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = 'progress' AND COLUMN_NAME = 'id_user'
           AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      if (progFk.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE progress
           ADD CONSTRAINT fk_progress_user_profile
           FOREIGN KEY (id_user) REFERENCES user_profiles(id_user_profile)
           ON DELETE CASCADE ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('     ✅ FK agregada\n');
      } else {
        console.log('     ⏭️  Ya existe\n');
      }

      // FK 3: streak.id_frequency → frequency
      console.log('  3️⃣ streak.id_frequency → frequency');
      const [streakFreqFk] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = 'streak' AND COLUMN_NAME = 'id_frequency'
           AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      if (streakFreqFk.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE streak
           ADD CONSTRAINT fk_streak_frequency
           FOREIGN KEY (id_frequency) REFERENCES frequency(id_frequency)
           ON DELETE CASCADE ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('     ✅ FK agregada\n');
      } else {
        console.log('     ⏭️  Ya existe\n');
      }

      // FK 4: streak.id_user → user_profiles
      console.log('  4️⃣ streak.id_user → user_profiles');
      const [streakUserFk] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = 'streak' AND COLUMN_NAME = 'id_user'
           AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      if (streakUserFk.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE streak
           ADD CONSTRAINT fk_streak_user_profile
           FOREIGN KEY (id_user) REFERENCES user_profiles(id_user_profile)
           ON DELETE CASCADE ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('     ✅ FK agregada\n');
      } else {
        console.log('     ⏭️  Ya existe\n');
      }

      // FK 5: gym_payment.id_user → user_profiles
      console.log('  5️⃣ gym_payment.id_user → user_profiles');
      const [paymentFk] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = 'gym_payment' AND COLUMN_NAME = 'id_user'
           AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      if (paymentFk.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE gym_payment
           ADD CONSTRAINT fk_gym_payment_user_profile
           FOREIGN KEY (id_user) REFERENCES user_profiles(id_user_profile)
           ON DELETE CASCADE ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('     ✅ FK agregada\n');
      } else {
        console.log('     ⏭️  Ya existe\n');
      }

      // FK 6: user_profiles.id_streak → streak
      console.log('  6️⃣ user_profiles.id_streak → streak');

      // Limpiar referencias huérfanas una última vez
      await queryInterface.sequelize.query(
        `UPDATE user_profiles up
         LEFT JOIN streak s ON up.id_streak = s.id_streak
         SET up.id_streak = NULL
         WHERE up.id_streak IS NOT NULL AND s.id_streak IS NULL`,
        { transaction }
      );

      const [userStreakFk] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'id_streak'
           AND TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      if (userStreakFk.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE user_profiles
           ADD CONSTRAINT fk_user_profile_streak
           FOREIGN KEY (id_streak) REFERENCES streak(id_streak)
           ON DELETE SET NULL ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('     ✅ FK agregada\n');
      } else {
        console.log('     ⏭️  Ya existe\n');
      }

      await transaction.commit();

      console.log('========================================');
      console.log('✅ MIGRACIÓN COMPLETADA');
      console.log('========================================');
      console.log('✅ Datos huérfanos eliminados');
      console.log('✅ Datos válidos recreados');
      console.log('✅ Todas las Foreign Keys agregadas');
      console.log('✅ Integridad referencial completa');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error en migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Revirtiendo migración...\n');

      const fks = [
        { table: 'frequency', constraint: 'fk_frequency_user_profile' },
        { table: 'progress', constraint: 'fk_progress_user_profile' },
        { table: 'streak', constraint: 'fk_streak_frequency' },
        { table: 'streak', constraint: 'fk_streak_user_profile' },
        { table: 'gym_payment', constraint: 'fk_gym_payment_user_profile' },
        { table: 'user_profiles', constraint: 'fk_user_profile_streak' }
      ];

      for (const fk of fks) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${fk.table}\` DROP FOREIGN KEY \`${fk.constraint}\``,
            { transaction }
          );
          console.log(`  ✅ ${fk.table}.${fk.constraint} eliminada`);
        } catch (error) {
          console.log(`  ⏭️  ${fk.table}.${fk.constraint} no existe`);
        }
      }

      await transaction.commit();
      console.log('\n✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al revertir:', error);
      throw error;
    }
  }
};

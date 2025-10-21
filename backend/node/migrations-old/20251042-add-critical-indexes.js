'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const qi = queryInterface;

    const ensureIndex = async ({ table, name, fields }) => {
      const [rows] = await qi.sequelize.query(
        `SELECT COUNT(*) AS cnt
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table
           AND INDEX_NAME = :name`,
        { replacements: { table, name } }
      );
      if (Number(rows[0]?.cnt || 0) === 0) {
        await qi.addIndex(table, {
          name,
          fields,
          using: 'BTREE'
        });
      }
    };

    // 1) user_body_metrics(id_user_profile, measured_at)
    await ensureIndex({
      table: 'user_body_metrics',
      name: 'idx_user_body_metrics_user_date',
      fields: ['id_user_profile', 'measured_at']
    });

    // 2) assistance(id_gym, date)
    await ensureIndex({
      table: 'assistance',
      name: 'idx_assistance_gym_date',
      fields: ['id_gym', 'date']
    });

    // 3) user_gym(id_user, active)
    await ensureIndex({
      table: 'user_gym',
      name: 'idx_user_gym_user_active',
      fields: ['id_user', 'active']
    });

    // 4) user_favorite_gym(id_gym)
    await ensureIndex({
      table: 'user_favorite_gym',
      name: 'idx_favorite_gym',
      fields: ['id_gym']
    });
  },

  down: async (queryInterface, Sequelize) => {
    const qi = queryInterface;

    const dropIfExists = async (table, name) => {
      const [rows] = await qi.sequelize.query(
        `SELECT COUNT(*) AS cnt
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table
           AND INDEX_NAME = :name`,
        { replacements: { table, name } }
      );
      if (Number(rows[0]?.cnt || 0) > 0) {
        await qi.removeIndex(table, name);
      }
    };

    await dropIfExists('user_body_metrics', 'idx_user_body_metrics_user_date');
    await dropIfExists('assistance', 'idx_assistance_gym_date');
    await dropIfExists('user_gym', 'idx_user_gym_user_active');
    await dropIfExists('user_favorite_gym', 'idx_favorite_gym');
  }
};


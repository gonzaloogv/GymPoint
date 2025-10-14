'use strict';

module.exports = {
  up: async (queryInterface) => {
    const qi = queryInterface;

    // 1) Detect current FK names that reference legacy `user` table
    const [fkRows] = await qi.sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME = 'user';
    `);

    // Helper: drop FK if exists
    const dropFk = async (table, constraint) => {
      await qi.sequelize.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraint}\``);
    };

    // 2) For assistance and claimed_reward, switch FK to user_profiles
    for (const row of fkRows) {
      if (row.TABLE_NAME === 'assistance' && row.COLUMN_NAME === 'id_user') {
        // Drop old FK
        await dropFk('assistance', row.CONSTRAINT_NAME);
        // Add new FK to user_profiles
        await qi.sequelize.query(`
          ALTER TABLE \`assistance\`
          ADD CONSTRAINT \`fk_assistance_user_profile\`
          FOREIGN KEY (\`id_user\`)
          REFERENCES \`user_profiles\` (\`id_user_profile\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE;
        `);
      }
      if (row.TABLE_NAME === 'claimed_reward' && row.COLUMN_NAME === 'id_user') {
        // Drop old FK
        await dropFk('claimed_reward', row.CONSTRAINT_NAME);
        // Add new FK to user_profiles
        await qi.sequelize.query(`
          ALTER TABLE \`claimed_reward\`
          ADD CONSTRAINT \`fk_claimed_reward_user_profile\`
          FOREIGN KEY (\`id_user\`)
          REFERENCES \`user_profiles\` (\`id_user_profile\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE;
        `);
      }
    }

    // 3) Re-check remaining FKs to legacy `user`
    const [remaining] = await qi.sequelize.query(`
      SELECT COUNT(*) AS cnt
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME = 'user';
    `);

    // 4) Drop legacy table `user` only if no FKs remain
    if (Number(remaining[0].cnt) === 0) {
      // Optional: keep data snapshot as backup table before drop
      // await qi.sequelize.query('CREATE TABLE user_backup AS SELECT * FROM `user`;');
      await qi.sequelize.query('DROP TABLE IF EXISTS `user`;');
    }
  },

  down: async () => {
    // No automatic rollback. Restoring legacy `user` would require snapshot/backup.
    // Keep migration as one-way cleanup.
  }
};


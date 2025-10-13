'use strict';

const getExistingRows = async (queryInterface, query, replacements = {}) => {
  const [results] = await queryInterface.sequelize.query(query, { replacements });
  return results;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    // GYM fields
    await queryInterface.addColumn('gym', 'whatsapp', {
      type: DataTypes.STRING(20),
      allowNull: true,
      after: 'phone'
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'instagram', {
      type: DataTypes.STRING(100),
      allowNull: true,
      after: 'social_media'
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'facebook', {
      type: DataTypes.STRING(100),
      allowNull: true,
      after: 'instagram'
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'google_maps_url', {
      type: DataTypes.STRING(500),
      allowNull: true,
      after: 'longitude'
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'max_capacity', {
      type: DataTypes.INTEGER,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'area_sqm', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'verified', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }).catch(() => {});

    await queryInterface.addColumn('gym', 'featured', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }).catch(() => {});

    // USER PROFILES
    await queryInterface.addColumn('user_profiles', 'premium_since', {
      type: DataTypes.DATEONLY,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('user_profiles', 'premium_expires', {
      type: DataTypes.DATEONLY,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('user_profiles', 'onboarding_completed', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }).catch(() => {});

    await queryInterface.addColumn('user_profiles', 'preferred_language', {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'es'
    }).catch(() => {});

    await queryInterface.addColumn('user_profiles', 'timezone', {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'America/Argentina/Buenos_Aires'
    }).catch(() => {});

    // ASSISTANCE
    await queryInterface.addColumn('assistance', 'check_in_time', {
      type: DataTypes.TIME,
      allowNull: true,
      after: 'hour'
    }).catch(() => {});

    await queryInterface.addColumn('assistance', 'check_out_time', {
      type: DataTypes.TIME,
      allowNull: true,
      after: 'check_in_time'
    }).catch(() => {});

    await queryInterface.sequelize.query(`
      ALTER TABLE assistance
      ADD COLUMN IF NOT EXISTS duration_minutes INT GENERATED ALWAYS AS (
        CASE
          WHEN check_out_time IS NOT NULL AND check_in_time IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)
          ELSE NULL
        END
      ) STORED
    `).catch(() => {});

    await queryInterface.addColumn('assistance', 'verified', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }).catch(() => {});

    // TOKEN LEDGER
    await queryInterface.addColumn('token_ledger', 'metadata', {
      type: DataTypes.JSON,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('token_ledger', 'expires_at', {
      type: DataTypes.DATE,
      allowNull: true
    }).catch(() => {});

    // FREQUENCY
    await queryInterface.addColumn('frequency', 'week_start_date', {
      type: DataTypes.DATEONLY,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('frequency', 'week_number', {
      type: DataTypes.TINYINT,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('frequency', 'year', {
      type: DataTypes.SMALLINT,
      allowNull: true
    }).catch(() => {});

    // Populate new frequency columns for existing rows
    await queryInterface.sequelize.query(`
      UPDATE frequency
      SET
        week_start_date = IFNULL(week_start_date, DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY)),
        week_number = WEEK(IFNULL(week_start_date, DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY)), 1),
        year = YEAR(IFNULL(week_start_date, DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY)))
    `);

    // Ensure week_start_date is not null going forward
    await queryInterface.changeColumn('frequency', 'week_start_date', {
      type: DataTypes.DATEONLY,
      allowNull: false
    }).catch(() => {});

    await queryInterface.changeColumn('frequency', 'week_number', {
      type: DataTypes.TINYINT,
      allowNull: false
    }).catch(() => {});

    await queryInterface.changeColumn('frequency', 'year', {
      type: DataTypes.SMALLINT,
      allowNull: false
    }).catch(() => {});

    const frequencyDuplicates = await getExistingRows(queryInterface, `
      SELECT id_user, year, week_number, COUNT(*) as total
      FROM frequency
      GROUP BY id_user, year, week_number
      HAVING total > 1
    `);

    if (frequencyDuplicates.length === 0) {
      await queryInterface.addConstraint('frequency', {
        type: 'unique',
        fields: ['id_user', 'year', 'week_number'],
        name: 'unique_frequency_user_week'
      }).catch(() => {});
    }

    // Assistance unique constraint if data allows
    const assistanceDuplicates = await getExistingRows(queryInterface, `
      SELECT id_user, id_gym, date, COUNT(*) as total
      FROM assistance
      GROUP BY id_user, id_gym, date
      HAVING total > 1
    `);

    if (assistanceDuplicates.length === 0) {
      await queryInterface.addConstraint('assistance', {
        type: 'unique',
        fields: ['id_user', 'id_gym', 'date'],
        name: 'unique_assistance_user_gym_date'
      }).catch(() => {});
    }
  },

  down: async (queryInterface) => {
    const dropColumn = async (table, column) => {
      await queryInterface.removeColumn(table, column).catch(() => {});
    };

    await dropColumn('gym', 'whatsapp');
    await dropColumn('gym', 'instagram');
    await dropColumn('gym', 'facebook');
    await dropColumn('gym', 'google_maps_url');
    await dropColumn('gym', 'max_capacity');
    await dropColumn('gym', 'area_sqm');
    await dropColumn('gym', 'verified');
    await dropColumn('gym', 'featured');

    await dropColumn('user_profiles', 'premium_since');
    await dropColumn('user_profiles', 'premium_expires');
    await dropColumn('user_profiles', 'onboarding_completed');
    await dropColumn('user_profiles', 'preferred_language');
    await dropColumn('user_profiles', 'timezone');

    await queryInterface.removeConstraint('assistance', 'unique_assistance_user_gym_date').catch(() => {});
    await dropColumn('assistance', 'check_in_time');
    await dropColumn('assistance', 'check_out_time');
    await queryInterface.sequelize.query('ALTER TABLE assistance DROP COLUMN IF EXISTS duration_minutes').catch(() => {});
    await dropColumn('assistance', 'verified');

    await dropColumn('token_ledger', 'metadata');
    await dropColumn('token_ledger', 'expires_at');

    await queryInterface.removeConstraint('frequency', 'unique_frequency_user_week').catch(() => {});
    await dropColumn('frequency', 'week_start_date');
    await dropColumn('frequency', 'week_number');
    await dropColumn('frequency', 'year');
  }
};


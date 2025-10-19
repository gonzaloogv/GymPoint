const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallengeSettings = sequelize.define('DailyChallengeSettings', {
  id_config: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1
  },
  auto_rotation_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  rotation_cron: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '1 0 * * *'
  }
}, {
  tableName: 'daily_challenge_settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

DailyChallengeSettings.getSingleton = async () => {
  const [config] = await DailyChallengeSettings.findOrCreate({
    where: { id_config: 1 },
    defaults: {
      id_config: 1,
      auto_rotation_enabled: true,
      rotation_cron: '1 0 * * *'
    }
  });
  return config;
};

module.exports = DailyChallengeSettings;


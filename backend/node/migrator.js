const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const sequelize = require('./config/database');

/**
 * Configuración de Umzug para migraciones automáticas
 * Las migraciones se ejecutan en orden alfabético desde /migrations
 */
const migrator = new Umzug({
  migrations: {
    glob: ['migrations/*.js', { cwd: __dirname }],
    resolve: ({ name, path: filepath, context }) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const migration = require(filepath);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ 
    sequelize,
    tableName: 'SequelizeMeta',
  }),
  logger: console,
});

module.exports = migrator;


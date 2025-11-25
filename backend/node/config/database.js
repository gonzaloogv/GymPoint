const { Sequelize } = require('sequelize');
require('dotenv').config();

const benchmark = String(process.env.SQL_BENCHMARK || '').toLowerCase();
const BENCH_ENABLED = benchmark === '1' || benchmark === 'true';
const SLOW_QUERY_MS = parseInt(process.env.SLOW_QUERY_MS || '200', 10);

function slowQueryLogger(sql, timing) {
  try {
    if (typeof timing === 'number' && timing >= SLOW_QUERY_MS) {
      const snippet = String(sql || '').slice(0, 1000);
      // Formato breve para logs en prod
      console.log(`[SQL ${timing}ms] ${snippet}`);
    }
  } catch (_) { /* noop */ }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: BENCH_ENABLED ? slowQueryLogger : false,
    benchmark: BENCH_ENABLED
  }
);

module.exports = sequelize;

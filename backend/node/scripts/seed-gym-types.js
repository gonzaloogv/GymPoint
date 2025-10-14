'use strict';

require('dotenv').config();

const sequelize = require('../config/database');
const { GymType } = require('../models');

const DEFAULT_TYPES = [
  'boxeo',
  'completo',
  'crossfit',
  'exclusivo',
  'express',
  'femenino',
  'powerlifting'
];

async function seedGymTypes() {
  await sequelize.authenticate();
  console.log('[SEED GYM TYPES] Conectado a la BD');

  let created = 0;
  for (const name of DEFAULT_TYPES) {
    const [row, wasCreated] = await GymType.findOrCreate({
      where: { name },
      defaults: { name }
    });
    if (wasCreated) created += 1;
  }

  console.log(`[SEED GYM TYPES] Tipos creados: ${created} / ${DEFAULT_TYPES.length}`);
}

seedGymTypes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[SEED GYM TYPES] Error:', err.message);
    process.exit(1);
  });


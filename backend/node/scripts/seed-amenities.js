'use strict';

require('dotenv').config();

const sequelize = require('../config/database');
const { GymAmenity } = require('../models');

const DEFAULT_AMENITIES = [
  { name: 'WiFi', category: 'FACILITY', icon: 'wifi' },
  { name: 'Estacionamiento', category: 'FACILITY', icon: 'parking' },
  { name: 'Lockers', category: 'FACILITY', icon: 'locker' },
  { name: 'Duchas', category: 'FACILITY', icon: 'shower' },
  { name: 'Aire acondicionado', category: 'FACILITY', icon: 'ac' },
  { name: 'Clases grupales', category: 'SERVICE', icon: 'class' },
  { name: 'Personal trainer', category: 'SERVICE', icon: 'trainer' },
  { name: 'Agua/Dispensers', category: 'EXTRA', icon: 'water' },
  { name: '24/7', category: 'EXTRA', icon: '24-7' },
  { name: 'Sanitización', category: 'SAFETY', icon: 'sanitize' }
];

async function seedAmenities() {
  await sequelize.authenticate();
  console.log('[SEED AMENITIES] Conectado a la BD');

  let created = 0;
  for (const amenity of DEFAULT_AMENITIES) {
    const [row, wasCreated] = await GymAmenity.findOrCreate({
      where: { name: amenity.name },
      defaults: amenity
    });
    if (wasCreated) created += 1;
  }

  console.log(`[SEED AMENITIES] Amenidades creadas: ${created} / ${DEFAULT_AMENITIES.length}`);
}

seedAmenities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[SEED AMENITIES] Error:', err.message);
    process.exit(1);
  });


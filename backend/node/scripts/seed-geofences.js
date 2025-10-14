/*
  Seed: Gym Geofences
  - Crea configuraciones de geofence para todos los gimnasios que no tengan una
  - Valores por defecto: radius=150m, enabled=true, min_stay=30 min
*/

require('dotenv').config();

const sequelize = require('../config/database');
const { runMigrations } = require('../migrate');
const { Gym, GymGeofence } = require('../models');

async function main() {
  try {
    console.log('Conectando a la BD...');
    await sequelize.authenticate();
    console.log('OK');

    // Asegurar migraciones
    await runMigrations();

    const gyms = await Gym.findAll({ attributes: ['id_gym', 'name', 'latitude', 'longitude'] });
    console.log(`Gimnasios encontrados: ${gyms.length}`);

    let created = 0;
    for (const g of gyms) {
      const existing = await GymGeofence.findOne({ where: { id_gym: g.id_gym } });
      if (existing) continue;
      await GymGeofence.create({
        id_gym: g.id_gym,
        radius_meters: 150,
        auto_checkin_enabled: true,
        min_stay_minutes: 30
      });
      created += 1;
    }

    const total = await GymGeofence.count();
    console.log(`Geofences creados: ${created}. Total configurados: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('Error en seed de geofences:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}


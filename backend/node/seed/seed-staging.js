/*
  Seed de Staging - Fase 3.1
  - Ejecuta migraciones
  - Inserta 3 desafíos diarios (hoy y próximos 2 días) si faltan
  - Inserta 5 rutinas plantilla con al menos 1 ejercicio si faltan
*/

require('dotenv').config();

const sequelize = require('../config/database');
const { runMigrations } = require('../migrate');
const templateService = require('../services/template-service');
const {
  Exercise,
  Routine,
  DailyChallenge
} = require('../models');

function dateOnlyUTC(offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function ensureBaseExercise() {
  const any = await Exercise.findOne();
  if (any) return any;
  console.log('No hay ejercicios; creando ejercicio base del sistema');
  return await Exercise.create({ exercise_name: 'Push Ups', muscular_group: 'CHEST', created_by: null });
}

async function seedTemplates() {
  const current = await Routine.count({ where: { is_template: true } });
  if (current >= 5) {
    console.log(`Ya existen ${current} plantillas. Saltando seed de rutinas.`);
    return;
  }

  const baseEx = await ensureBaseExercise();
  const exId = baseEx.id_exercise;

  const templates = [
    { routine_name: 'Full Body Beginner', description: 'Cuerpo completo para iniciar', recommended_for: 'BEGINNER', template_order: 1 },
    { routine_name: 'Push Pull Legs', description: 'Dividida en 3 días', recommended_for: 'INTERMEDIATE', template_order: 2 },
    { routine_name: 'HIIT 30min', description: 'Cardio intenso 30 minutos', recommended_for: 'INTERMEDIATE', template_order: 3 },
    { routine_name: 'Flexibilidad', description: 'Estiramientos básicos', recommended_for: 'BEGINNER', template_order: 4 },
    { routine_name: 'Upper Lower', description: 'Split superior/inferior', recommended_for: 'ADVANCED', template_order: 5 }
  ];

  for (const t of templates) {
    const exists = await Routine.findOne({ where: { routine_name: t.routine_name, is_template: true } });
    if (exists) continue;
    await templateService.createTemplate({
      routine_name: t.routine_name,
      description: t.description,
      recommended_for: t.recommended_for,
      template_order: t.template_order,
      exercises: [
        { id_exercise: exId, series: 3, reps: 12, order: 1 }
      ]
    });
    console.log(`Plantilla creada: ${t.routine_name}`);
  }
}

async function seedDailyChallenges() {
  const challenges = [
    { date: dateOnlyUTC(0), title: 'Suma 30 minutos', description: 'Entrena al menos 30 minutos', challenge_type: 'MINUTES', target_value: 30, target_unit: 'min', tokens_reward: 10 },
    { date: dateOnlyUTC(1), title: '5 ejercicios', description: 'Completa 5 ejercicios', challenge_type: 'EXERCISES', target_value: 5, target_unit: 'ex', tokens_reward: 12 },
    { date: dateOnlyUTC(2), title: 'Asiste al gimnasio', description: 'Registra 1 asistencia', challenge_type: 'FREQUENCY', target_value: 1, target_unit: 'asist', tokens_reward: 10 }
  ];

  for (const c of challenges) {
    const exists = await DailyChallenge.findOne({ where: { challenge_date: c.date } });
    if (exists) continue;
    await DailyChallenge.create({
      challenge_date: c.date,
      title: c.title,
      description: c.description,
      challenge_type: c.challenge_type,
      target_value: c.target_value,
      target_unit: c.target_unit,
      tokens_reward: c.tokens_reward,
      difficulty: 'MEDIUM',
      is_active: true
    });
    console.log(`Desafío creado para ${c.date}: ${c.title}`);
  }
}

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión OK');

    console.log('Ejecutando migraciones...');
    await runMigrations();

    console.log('Seeding: desafíos diarios');
    await seedDailyChallenges();

    console.log('Seeding: rutinas plantilla');
    await seedTemplates();

    console.log('Seed de staging completado.');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed de staging:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}


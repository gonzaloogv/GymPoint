/**
 * Reset DB for MVP - TRUNCATE domain data while keeping core config
 *
 * WARNING: Destructive. Use only in dev/staging.
 *
 * Usage:
 *   NODE_ENV=development node scripts/reset-db-for-mvp.js --yes
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const sequelize = require('../config/database');

async function main() {
  const args = process.argv.slice(2);
  if (!args.includes('--yes')) {
    console.error('Refusing to run without --yes');
    process.exit(1);
  }

  const tablesToTruncate = [
    // User-related domain
    'assistance', 'frequency', 'frequency_history', 'progress', 'progress_exercise',
    'user_gym', 'user_routine', 'workout_session', 'workout_set', 'refresh_token',
    'notification', 'user_notification_settings', 'token_ledger',
    // Gyms and reviews
    'gym_amenity', 'gym_gym_amenity', 'gym_review', 'review_helpful', 'gym_rating_stats',
    'gym_payment', 'mercadopago_payment',
    // Routines and workouts
    'routine_exercise', 'routine_day', 'workout_session', 'workout_set',
    // Rewards
    'reward_code', 'claimed_reward', 'reward',
    // Media
    'media',
    // New features
    'daily_challenge', 'user_daily_challenge', 'gym_geofence'
  ];

  // Core we typically keep (but can be wiped if desired):
  // 'exercise', 'gym', 'routine', 'user_profiles', 'accounts', 'roles', 'account_roles', 'admin_profiles'

  const t = await sequelize.transaction();
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    for (const tbl of tablesToTruncate) {
      try { await sequelize.query(`TRUNCATE TABLE \`${tbl}\``); console.log(`✓ TRUNCATED ${tbl}`); } catch (e) { /* ignore */ }
    }
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    await t.commit();
    console.log('\n✓ Reset DB (domain tables truncated). Run your admin seed next.');
  } catch (e) {
    await t.rollback();
    console.error('✗ Reset failed:', e.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main();
}


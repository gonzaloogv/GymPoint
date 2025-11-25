/**
 * Script de prueba para WebSocket
 *
 * Uso:
 *   node websocket/test-client.js YOUR_JWT_TOKEN
 *
 * Para obtener un token:
 *   1. Hacer login en la API: POST /api/auth/login
 *   2. Copiar el token del response
 *   3. Ejecutar: node websocket/test-client.js eyJhbGc...
 */

const io = require('socket.io-client');

// Obtener token desde argumentos de línea de comandos
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: Token JWT requerido');
  console.log('\nUso:');
  console.log('  node websocket/test-client.js YOUR_JWT_TOKEN');
  console.log('\nPara obtener un token:');
  console.log('  1. POST /api/auth/login con credenciales válidas');
  console.log('  2. Copiar el token del response');
  console.log('  3. Ejecutar este script con el token\n');
  process.exit(1);
}

// Configuración
const SERVER_URL = process.env.WS_URL || 'http://localhost:3000';

console.log('🔌 Conectando a WebSocket...');
console.log(`📍 URL: ${SERVER_URL}`);
console.log(`🔑 Token: ${token.substring(0, 20)}...\n`);

// Crear conexión
const socket = io(SERVER_URL, {
  auth: {
    token: token
  },
  transports: ['websocket', 'polling']
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Conexión exitosa
socket.on('connect', () => {
  console.log('✅ Conectado al servidor WebSocket');
  console.log(`   Socket ID: ${socket.id}\n`);

  // Suscribirse a varios eventos automáticamente
  console.log('📡 Suscribiendo a eventos...\n');

  // Notificaciones
  socket.emit('notifications:subscribe');

  // Racha personal
  socket.emit('streak:subscribe');

  // Unirse a un gimnasio de ejemplo (cambiar ID según necesidad)
  // socket.emit('presence:join-gym', { gymId: 1 });
});

socket.on('connection:success', (data) => {
  console.log('🎉 Confirmación de conexión recibida:');
  console.log('   ', data);
  console.log('');
});

// Error de conexión
socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión:', error.message);
  if (error.message.includes('Authentication')) {
    console.log('\n💡 El token JWT puede ser inválido o expirado.');
    console.log('   Obtén un nuevo token haciendo login en /api/auth/login\n');
  }
});

// Desconexión
socket.on('disconnect', (reason) => {
  console.log('⚠️  Desconectado del servidor');
  console.log(`   Razón: ${reason}\n`);
});

// ============================================================================
// NOTIFICACIONES
// ============================================================================

socket.on('notifications:subscribed', (data) => {
  console.log('✅ Suscrito a notificaciones');
  console.log('   ', data);
  console.log('');
});

socket.on('notification:new', (notification) => {
  console.log('🔔 NUEVA NOTIFICACIÓN:');
  console.log('   ID:', notification.id);
  console.log('   Tipo:', notification.type);
  console.log('   Título:', notification.title);
  console.log('   Mensaje:', notification.message);
  console.log('   Timestamp:', notification.timestamp);
  console.log('');
});

socket.on('notifications:unread-count', (data) => {
  console.log('📊 Contador de notificaciones no leídas:', data.count);
  console.log('');
});

// ============================================================================
// PRESENCIA EN GIMNASIOS
// ============================================================================

socket.on('presence:joined-gym', (data) => {
  console.log('✅ Unido al gimnasio:', data.gymId);
  console.log('');
});

socket.on('presence:user-entered', (data) => {
  console.log('👋 Usuario entró al gimnasio:');
  console.log('   User ID:', data.userId);
  console.log('   Gym ID:', data.gymId);
  console.log('   Timestamp:', data.timestamp);
  console.log('');
});

socket.on('presence:user-left', (data) => {
  console.log('👋 Usuario salió del gimnasio:');
  console.log('   User ID:', data.userId);
  console.log('   Gym ID:', data.gymId);
  console.log('   Timestamp:', data.timestamp);
  console.log('');
});

socket.on('presence:updated', (data) => {
  console.log('📊 Presencia actualizada:');
  console.log('   Gym ID:', data.gymId);
  console.log('   Usuarios actuales:', data.currentCount);
  console.log('   Timestamp:', data.timestamp);
  console.log('');
});

// ============================================================================
// ASISTENCIAS Y RACHAS
// ============================================================================

socket.on('streak:subscribed', (data) => {
  console.log('✅ Suscrito a actualizaciones de racha');
  console.log('   ', data);
  console.log('');
});

socket.on('assistance:new', (data) => {
  console.log('✅ Nueva asistencia registrada:');
  console.log('   User ID:', data.userId);
  console.log('   Gym ID:', data.gymId);
  console.log('   Check-in:', data.checkInTime);
  console.log('');
});

socket.on('streak:updated', (data) => {
  console.log('🔥 Racha actualizada:');
  console.log('   Racha actual:', data.currentStreak, 'días');
  console.log('   Racha más larga:', data.longestStreak, 'días');
  console.log('   Timestamp:', data.timestamp);
  console.log('');
});

socket.on('streak:milestone', (data) => {
  console.log('🎉 ¡HITO DE RACHA ALCANZADO!');
  console.log('   Milestone:', data.milestone);
  console.log('   Racha actual:', data.currentStreak);
  console.log('   Mensaje:', data.message);
  console.log('');
});

socket.on('streak:lost', (data) => {
  console.log('😢 Racha perdida:');
  console.log('   Racha anterior:', data.previousStreak);
  console.log('   Mensaje:', data.message);
  console.log('');
});

// ============================================================================
// RESEÑAS Y RATINGS
// ============================================================================

socket.on('review:new', (data) => {
  console.log('⭐ Nueva reseña publicada:');
  console.log('   Review ID:', data.reviewId);
  console.log('   Gym ID:', data.gymId);
  console.log('   Rating:', data.rating);
  console.log('');
});

socket.on('gym:rating:updated', (data) => {
  console.log('📊 Rating de gimnasio actualizado:');
  console.log('   Gym ID:', data.gymId);
  console.log('   Promedio:', data.averageRating);
  console.log('   Total de reseñas:', data.totalReviews);
  console.log('');
});

// ============================================================================
// LOGROS Y RECOMPENSAS
// ============================================================================

socket.on('achievement:unlocked', (data) => {
  console.log('🏆 ¡LOGRO DESBLOQUEADO!');
  console.log('   Nombre:', data.name);
  console.log('   Descripción:', data.description);
  console.log('   Puntos:', data.points);
  console.log('');
});

socket.on('reward:earned', (data) => {
  console.log('🎁 Recompensa ganada:');
  console.log('   Nombre:', data.name);
  console.log('   Tipo:', data.type);
  console.log('');
});

// ============================================================================
// SISTEMA
// ============================================================================

socket.on('system:announcement', (data) => {
  console.log('📢 ANUNCIO DEL SISTEMA:');
  console.log('   Mensaje:', data.message);
  console.log('   Prioridad:', data.priority);
  console.log('   Timestamp:', data.timestamp);
  console.log('');
});

// ============================================================================
// COMANDOS INTERACTIVOS
// ============================================================================

console.log('═'.repeat(60));
console.log('Cliente WebSocket iniciado');
console.log('═'.repeat(60));
console.log('\n💡 Comandos disponibles:\n');
console.log('  - Ctrl+C: Cerrar conexión');
console.log('  - El cliente está escuchando todos los eventos automáticamente');
console.log('\n📝 Para probar eventos:');
console.log('  1. Crea una notificación desde la API REST');
console.log('  2. Registra una asistencia');
console.log('  3. Observa los eventos en tiempo real aquí\n');
console.log('═'.repeat(60));
console.log('');

// Manejo de cierre
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando conexión WebSocket...');
  socket.disconnect();
  process.exit(0);
});

// Mantener el script corriendo
process.stdin.resume();

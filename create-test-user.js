// Script para crear un usuario de prueba en el backend
const axios = require('axios');

const API_URL = 'http://localhost:3000';

const testUser = {
  name: 'Test',
  lastname: 'Usuario',
  email: 'test@gympoint.com',
  password: '123456',
  gender: 'M',
  locality: 'Buenos Aires',
  birth_date: '1990-01-01',
  frequency_goal: 3,
};

console.log('🔨 Creando usuario de prueba en el backend...\n');
console.log('Datos del usuario:');
console.log(JSON.stringify(testUser, null, 2));
console.log('\n' + '─'.repeat(50) + '\n');

axios.post(`${API_URL}/api/auth/register`, testUser)
  .then((response) => {
    console.log('✅ Usuario creado exitosamente!');
    console.log('\n📝 Credenciales de prueba:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log('\n' + '─'.repeat(50));
    console.log('\n🎯 Ahora puedes usar estas credenciales en la app móvil.\n');
  })
  .catch((error) => {
    if (error.response?.status === 409) {
      console.log('ℹ️  El usuario ya existe!');
      console.log('\n📝 Credenciales de prueba:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log('\n' + '─'.repeat(50));
      console.log('\n🎯 Puedes usar estas credenciales en la app móvil.\n');
    } else {
      console.log('❌ Error al crear usuario:');
      console.log(error.response?.data || error.message);
    }
  });

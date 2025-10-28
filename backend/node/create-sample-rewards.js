const axios = require('axios');

const sampleRewards = [
  {
    name: 'Entrada gratis por 1 día',
    description: 'Acceso completo a cualquier gimnasio por un día',
    token_cost: 100,
    reward_type: 'pase_gratis',
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    terms: 'Válido en cualquier gimnasio de la red. No incluye clases premium.',
    stock: 50
  },
  {
    name: 'Clase grupal gratis',
    description: 'Una clase grupal de tu elección',
    token_cost: 75,
    reward_type: 'servicio',
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    terms: 'Sujeto a disponibilidad. Reserva con anticipación.',
    stock: 30
  },
  {
    name: 'Descuento 20% en proteínas',
    description: 'Descuento en suplementos nutricionales',
    token_cost: 50,
    reward_type: 'descuento',
    discount_percentage: 20,
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    terms: 'Válido en tiendas participantes. No acumulable con otras ofertas.',
    stock: 100
  },
  {
    name: 'Consulta nutricional gratis',
    description: 'Sesión de 30min con nutricionista',
    token_cost: 150,
    reward_type: 'servicio',
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    terms: 'Solo disponible para usuarios Premium. Coordinar por WhatsApp.',
    stock: 10
  },
  {
    name: 'Masaje deportivo',
    description: 'Sesión de masaje de 30 minutos',
    token_cost: 200,
    reward_type: 'servicio',
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    terms: 'Solo disponible para usuarios Premium. Sujeto a disponibilidad.',
    stock: 5
  },
  {
    name: 'Plan semanal gratis',
    description: 'Acceso completo por 7 días',
    token_cost: 500,
    reward_type: 'pase_gratis',
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    terms: 'No acumulable. Solo una vez por usuario.',
    stock: 20
  }
];

async function createRewards() {
  console.log('🚀 Creando rewards de prueba...\n');
  
  for (const reward of sampleRewards) {
    try {
      const response = await axios.post('http://localhost:3000/api/rewards', reward, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Creada: ${reward.name} (${reward.token_cost} tokens)`);
    } catch (error) {
      console.error(`❌ Error creando ${reward.name}:`, error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n✨ Proceso completado!');
  console.log('\nPara verificar, ejecuta: curl http://localhost:3000/api/rewards');
}

createRewards();

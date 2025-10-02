import { GeneratedCodeDTO, RewardDTO } from '../dto/RewardDTO';

export class RewardLocal {
  private mockRewards: RewardDTO[] = [
    {
      id: '1',
      title: 'Entrada gratis por 1 día',
      description: 'Acceso completo a cualquier gimnasio por un día',
      cost: 100,
      category: 'gym',
      icon: '🏋️',
      validDays: 90,
      terms: 'Válido en cualquier gimnasio de la red. No incluye clases premium.',
      available: true,
    },
    {
      id: '2',
      title: 'Clase grupal gratis',
      description: 'Una clase grupal de tu elección',
      cost: 75,
      category: 'gym',
      icon: '👥',
      validDays: 30,
      terms: 'Sujeto a disponibilidad. Reserva con anticipación.',
      available: true,
    },
    {
      id: '3',
      title: 'Descuento 20% en proteínas',
      description: 'Descuento en suplementos nutricionales',
      cost: 50,
      category: 'lifestyle',
      icon: '🥤',
      validDays: 60,
      terms: 'Válido en tiendas participantes. No acumulable con otras ofertas.',
      available: true,
    },
    {
      id: '4',
      title: 'Consulta nutricional gratis',
      description: 'Sesión de 30min con nutricionista',
      cost: 150,
      category: 'premium',
      icon: '🍎',
      validDays: 60,
      terms: 'Solo disponible para usuarios Premium. Coordinar por WhatsApp.',
      available: false, // will be set based on isPremium
    },
    {
      id: '5',
      title: 'Masaje deportivo',
      description: 'Sesión de masaje de 30 minutos',
      cost: 200,
      category: 'premium',
      icon: '💆',
      validDays: 45,
      terms: 'Solo disponible para usuarios Premium. Sujeto a disponibilidad.',
      available: false, // will be set based on isPremium
    },
    {
      id: '6',
      title: 'Plan semanal gratis',
      description: 'Acceso completo por 7 días',
      cost: 500,
      category: 'gym',
      icon: '🎯',
      validDays: 30,
      terms: 'No acumulable. Solo una vez por usuario.',
      available: true,
    },
  ];

  private initialCodes: GeneratedCodeDTO[] = [
    {
      id: '1',
      rewardId: '1',
      code: 'GP-ABC12345',
      title: 'Entrada gratis por 1 día',
      used: false,
      generatedAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 89),
    },
    {
      id: '2',
      rewardId: '3',
      code: 'GP-XYZ67890',
      title: 'Descuento 20% en proteínas',
      used: true,
      generatedAt: new Date(Date.now() - 86400000 * 3),
      expiresAt: new Date(Date.now() + 86400000 * 87),
      usedAt: new Date(Date.now() - 86400000),
    },
  ];

  async getAllRewards(isPremium: boolean): Promise<RewardDTO[]> {
    return this.mockRewards.map((reward) => ({
      ...reward,
      available: reward.category === 'premium' ? isPremium : reward.available,
    }));
  }

  async getInitialCodes(): Promise<GeneratedCodeDTO[]> {
    return [...this.initialCodes];
  }
}


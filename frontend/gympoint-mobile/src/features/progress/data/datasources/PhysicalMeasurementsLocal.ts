import { PhysicalMeasurements } from '../../domain/entities/PhysicalMeasurement';

export class PhysicalMeasurementsLocal {
  async getPhysicalMeasurements(userId: string): Promise<PhysicalMeasurements> {
    // Mock data - simula mediciones de los últimos 90 días
    const generateHistory = (start: number, end: number, days: number) => {
      const history = [];
      const step = (end - start) / days;

      for (let i = 0; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        history.push({
          date: date.toISOString(),
          value: Number((start + step * i).toFixed(1)),
        });
      }

      return history;
    };

    return {
      weight: {
        current: 72.5,
        change: 0.8,
        changePercentage: 1.2,
        unit: 'kg',
        history: generateHistory(73.3, 72.5, 90),
      },
      bodyFat: {
        current: 18.2,
        change: -1.2,
        changePercentage: -6.2,
        unit: '%',
        history: generateHistory(19.4, 18.2, 90),
      },
      imc: {
        current: 22.1,
        change: 0.3,
        changePercentage: 1.4,
        unit: '',
        history: generateHistory(21.8, 22.1, 90),
      },
      streak: {
        days: 14,
        change: 7,
      },
    };
  }
}

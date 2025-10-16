export interface MeasurementPoint {
  date: string;
  value: number;
}

export interface PhysicalMetric {
  current: number;
  change: number;
  changePercentage: number;
  unit: string;
  history: MeasurementPoint[];
}

export interface PhysicalMeasurements {
  weight: PhysicalMetric;
  bodyFat: PhysicalMetric;
  imc: PhysicalMetric;
  streak: {
    days: number;
    change: number;
  };
}

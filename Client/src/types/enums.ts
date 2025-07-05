export enum Size {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

export enum CategoryEnum {
  // Cars = 'cars',
  Equipment = 'equipment',
  Services = 'services',
  Trucks = 'trucks',
  LowDuty = 'low duty',
  HeavyDuty = 'heavy duty',
  Travel = 'travel',
  Busses = 'busses',
}

export interface Category {
  name: string,
  description: string
}
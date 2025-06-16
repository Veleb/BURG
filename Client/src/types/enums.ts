export enum Size {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

export enum CategoryEnum {
  // Equipment = 'equipment',
  // Cars = 'cars',
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
export type HousingType = 'bungalow' | 'upstairs' | 'duplex';
export type FridgeType = 'none' | 'mini' | 'single-door' | 'double-door' | 'side-by-side' | 'chest-freezer';
export type AcType = 'none' | '1hp' | '1.5hp' | '2hp';
export type WashingMachineType = 'none' | 'semi-automatic' | 'fully-automatic' | 'front-loader' | 'top-loader';
export type WashingMachineSize = 'none' | 'small' | 'medium' | 'large';

export interface QuoteSelectionInput {
  bedroomCount: number;
  housingType: HousingType;
  fans: number;
  tvs: number;
  fridges: number;
  fridgeType: FridgeType;
  acCount: number;
  acType: AcType;
  washingMachineCount: number;
  washingMachineType: WashingMachineType;
  washingMachineSize: WashingMachineSize;
  additionalAppliances: string[];
}

export interface SolarQuote {
  id: string;
  title: string;
  tagline: string;
  inverter: string;
  battery: string;
  panels: string;
  loadText: string;
  recommendedProperty: string;
  price: number;
  maxBedrooms: number;
  allowedHousing: HousingType[];
  maxFans: number;
  maxTVs: number;
  maxFridges: number;
  supportedFridgeTypes: FridgeType[];
  maxAc: number;
  maxWashingMachines: number;
  supportsHeavyWashingMachine: boolean;
  supportsEvCharging: boolean;
  supportedExtras: string[];
}

export interface QuoteRecommendation {
  quote: SolarQuote;
  score: number;
  isStrongMatch: boolean;
  notes: string[];
}

export const EXTRA_APPLIANCE_OPTIONS = [
  'EV charging (car charging)',
  'Pumping machine',
  'Microwave',
  'Electric cooker',
  'Deep freezer',
  'Water heater',
  'Dishwasher',
  'Home theatre',
];

const QUOTES: SolarQuote[] = [
  {
    id: 'power-tank-student',
    title: 'Power Tank Student Package',
    tagline: '500W / 1kWh',
    inverter: '500W',
    battery: '1kWh',
    panels: '1 panel',
    loadText: 'Light, TV, fan, laptop',
    recommendedProperty: 'One room',
    price: 550000,
    maxBedrooms: 1,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 1,
    maxTVs: 1,
    maxFridges: 0,
    supportedFridgeTypes: ['none'],
    maxAc: 0,
    maxWashingMachines: 0,
    supportsHeavyWashingMachine: false,
    supportsEvCharging: false,
    supportedExtras: [],
  },
  {
    id: 'economy-1kva-12v',
    title: '1kVA 12V Economy',
    tagline: 'Entry one-room solution',
    inverter: '1kVA',
    battery: '1 battery',
    panels: '3 panels',
    loadText: 'Light, TV, fan',
    recommendedProperty: 'One room',
    price: 1350000,
    maxBedrooms: 1,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 2,
    maxTVs: 1,
    maxFridges: 0,
    supportedFridgeTypes: ['none'],
    maxAc: 0,
    maxWashingMachines: 0,
    supportsHeavyWashingMachine: false,
    supportsEvCharging: false,
    supportedExtras: [],
  },
  {
    id: 'basic-1_5kva-12v',
    title: '1.5kVA 12V Basic',
    tagline: 'Room and parlour starter',
    inverter: '1.5kVA',
    battery: '2 batteries',
    panels: '4 panels',
    loadText: 'Bedside fridge, TV, fan, light, laptop',
    recommendedProperty: 'Room and parlour',
    price: 1700000,
    maxBedrooms: 1,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 2,
    maxTVs: 1,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door'],
    maxAc: 0,
    maxWashingMachines: 0,
    supportsHeavyWashingMachine: false,
    supportsEvCharging: false,
    supportedExtras: [],
  },
  {
    id: 'classic-2kva-12v',
    title: '2kVA 12V Classic',
    tagline: 'Compact family mix',
    inverter: '2kVA',
    battery: '2 batteries',
    panels: '4 panels',
    loadText: 'Fridge, washing machine, fan, TV, light',
    recommendedProperty: 'Room and parlour',
    price: 1750000,
    maxBedrooms: 2,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 3,
    maxTVs: 1,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door'],
    maxAc: 0,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: false,
    supportsEvCharging: false,
    supportedExtras: [],
  },
  {
    id: 'pro-3kva-24v',
    title: '3kVA 24V Pro',
    tagline: 'Apartment-ready lithium setup',
    inverter: '3kVA',
    battery: '2.5kWh lithium',
    panels: '4 panels',
    loadText: 'Fridge, TV, light, 2 fans',
    recommendedProperty: 'One or two-room apartment',
    price: 2000000,
    maxBedrooms: 2,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 3,
    maxTVs: 2,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door'],
    maxAc: 0,
    maxWashingMachines: 0,
    supportsHeavyWashingMachine: false,
    supportsEvCharging: false,
    supportedExtras: [],
  },
  {
    id: 'pro-max-3kva-24v',
    title: '3kVA 24V Pro Max',
    tagline: 'Higher panel coverage for apartments',
    inverter: '3kVA',
    battery: '2.5kWh lithium',
    panels: '6 panels',
    loadText: 'Fridge, TV, light, fan',
    recommendedProperty: 'One or two-room apartment',
    price: 2200000,
    maxBedrooms: 2,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 4,
    maxTVs: 2,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door'],
    maxAc: 0,
    maxWashingMachines: 0,
    supportsHeavyWashingMachine: false,
    supportsEvCharging: false,
    supportedExtras: [],
  },
  {
    id: 'advanced-4kva-24v',
    title: '4kVA 24V Advanced',
    tagline: 'Balanced 2-3 bedroom package',
    inverter: '4kVA',
    battery: '5kWh lithium',
    panels: '6 panels',
    loadText: 'Light, TV, fridge, fan, washing machine, microwave',
    recommendedProperty: '2 or 3 bedroom apartment',
    price: 2800000,
    maxBedrooms: 3,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 5,
    maxTVs: 2,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door'],
    maxAc: 0,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Microwave'],
  },
  {
    id: 'advanced-pro-4kva-24v',
    title: '4kVA 24V Advanced Pro',
    tagline: 'Adds pumping machine support',
    inverter: '4kVA',
    battery: '5kWh lithium',
    panels: '8 panels',
    loadText: 'Light, TV, fridge, 1.5HP pumping machine',
    recommendedProperty: '2 or 3 bedroom apartment',
    price: 3000000,
    maxBedrooms: 3,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 5,
    maxTVs: 2,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door'],
    maxAc: 0,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Pumping machine'],
  },
  {
    id: 'golden-6kva-48v-5kwh',
    title: '6kVA 48V Golden',
    tagline: '3-bedroom AC-ready starter',
    inverter: '6kVA',
    battery: '5kWh lithium',
    panels: '8 panels',
    loadText: 'Light, TV, fridge, AC, pumping machine',
    recommendedProperty: '3 bedroom apartment',
    price: 3100000,
    maxBedrooms: 3,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 6,
    maxTVs: 2,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door'],
    maxAc: 1,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Pumping machine'],
  },
  {
    id: 'ultra-6kva-48v-10kwh',
    title: '6kVA 48V Ultra',
    tagline: 'More storage for longer runtime',
    inverter: '6kVA',
    battery: '10kWh lithium',
    panels: '8 panels',
    loadText: 'Light, TV, fridge, AC, pumping machine',
    recommendedProperty: '3 bedroom apartment',
    price: 4200000,
    maxBedrooms: 3,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 7,
    maxTVs: 3,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door', 'side-by-side'],
    maxAc: 1,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Pumping machine', 'Microwave'],
  },
  {
    id: 'ultra-pro-max-6kva-48v',
    title: '6kVA 48V Ultra Pro-Max',
    tagline: 'Expanded panel set',
    inverter: '6kVA',
    battery: '10kWh lithium',
    panels: '10 panels',
    loadText: 'Light, TV, fridge, AC, pumping machine',
    recommendedProperty: '3 bedroom apartment',
    price: 4500000,
    maxBedrooms: 3,
    allowedHousing: ['bungalow', 'upstairs'],
    maxFans: 8,
    maxTVs: 3,
    maxFridges: 1,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door', 'side-by-side'],
    maxAc: 1,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Pumping machine', 'Microwave'],
  },
  {
    id: 'golden-6kva-48v-15kwh',
    title: '6kVA 48V Golden (15kWh)',
    tagline: 'Heavy-duty 3-4 bedroom option',
    inverter: '6kVA',
    battery: '15kWh lithium',
    panels: '12 panels (610W)',
    loadText: '1 AC, pumping machine, light, TV, fridge',
    recommendedProperty: '3 or 4 bedroom apartment',
    price: 5200000,
    maxBedrooms: 4,
    allowedHousing: ['bungalow', 'upstairs', 'duplex'],
    maxFans: 9,
    maxTVs: 3,
    maxFridges: 2,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door', 'side-by-side', 'chest-freezer'],
    maxAc: 1,
    maxWashingMachines: 1,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Pumping machine', 'Microwave'],
  },
  {
    id: 'air-12kva-48v',
    title: '12kVA 48V Air',
    tagline: 'Duplex-ready high load package',
    inverter: '12kVA',
    battery: '16kWh lithium',
    panels: '14 panels',
    loadText: '1 AC, pumping machine, light, TV, fridge',
    recommendedProperty: '3 or 4 bedroom apartment, duplex',
    price: 6400000,
    maxBedrooms: 4,
    allowedHousing: ['bungalow', 'upstairs', 'duplex'],
    maxFans: 10,
    maxTVs: 4,
    maxFridges: 2,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door', 'side-by-side', 'chest-freezer'],
    maxAc: 1,
    maxWashingMachines: 2,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: false,
    supportedExtras: ['Pumping machine', 'Microwave', 'Deep freezer'],
  },
  {
    id: 'air-pro-12kva-48v',
    title: '12kVA 48V Air Pro',
    tagline: 'Large family and high-load homes',
    inverter: '12kVA',
    battery: '32kWh lithium',
    panels: '24 panels',
    loadText: '2 AC, pumping machine, light, TV, fridge',
    recommendedProperty: '3 to 5 bedroom apartment, duplex',
    price: 12000000,
    maxBedrooms: 5,
    allowedHousing: ['bungalow', 'upstairs', 'duplex'],
    maxFans: 12,
    maxTVs: 5,
    maxFridges: 2,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door', 'side-by-side', 'chest-freezer'],
    maxAc: 2,
    maxWashingMachines: 2,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: true,
    supportedExtras: ['Pumping machine', 'Microwave', 'Deep freezer', 'EV charging (car charging)'],
  },
  {
    id: 'air-pro-max-12kva-48v',
    title: '12kVA 48V Air Pro-Max',
    tagline: 'Maximum capacity package',
    inverter: '12kVA',
    battery: '48kWh lithium',
    panels: '28 panels',
    loadText: '3 AC, pumping machine, light, TV, fridge',
    recommendedProperty: '3 to 5 bedroom apartment, duplex',
    price: 15000000,
    maxBedrooms: 5,
    allowedHousing: ['bungalow', 'upstairs', 'duplex'],
    maxFans: 14,
    maxTVs: 6,
    maxFridges: 3,
    supportedFridgeTypes: ['none', 'mini', 'single-door', 'double-door', 'side-by-side', 'chest-freezer'],
    maxAc: 3,
    maxWashingMachines: 3,
    supportsHeavyWashingMachine: true,
    supportsEvCharging: true,
    supportedExtras: ['Pumping machine', 'Microwave', 'Deep freezer', 'EV charging (car charging)', 'Electric cooker'],
  },
];

const hasHeavyFridge = (type: FridgeType) => type === 'side-by-side' || type === 'chest-freezer';
const hasHeavyWashingMachine = (size: WashingMachineSize) => size === 'large';

export const consultationQuotes = QUOTES;

export function getQuoteRecommendations(input: QuoteSelectionInput): QuoteRecommendation[] {
  const scored = QUOTES.map((quote) => {
    let score = 0;
    const notes: string[] = [];
    let blockers = 0;

    if (input.bedroomCount <= quote.maxBedrooms) {
      score += 16;
    } else {
      blockers += 1;
      notes.push(`Bedroom load may exceed ${quote.maxBedrooms} bedroom recommendation.`);
    }

    if (quote.allowedHousing.includes(input.housingType)) {
      score += 10;
    } else {
      blockers += 1;
      notes.push(`Not ideal for ${input.housingType} housing profile.`);
    }

    if (input.fans <= quote.maxFans) {
      score += 10;
    } else {
      blockers += 1;
      notes.push(`Supports up to ${quote.maxFans} fan(s).`);
    }

    if (input.tvs <= quote.maxTVs) {
      score += 8;
    } else {
      blockers += 1;
      notes.push(`Supports up to ${quote.maxTVs} TV unit(s).`);
    }

    if (input.fridges <= quote.maxFridges) {
      score += 10;
    } else {
      blockers += 1;
      notes.push(`Supports up to ${quote.maxFridges} fridge unit(s).`);
    }

    if (input.fridges === 0 || quote.supportedFridgeTypes.includes(input.fridgeType)) {
      score += 8;
      if (hasHeavyFridge(input.fridgeType) && !quote.supportedFridgeTypes.includes(input.fridgeType)) {
        blockers += 1;
        notes.push('Heavy fridge type may require a higher package.');
      }
    } else {
      blockers += 1;
      notes.push('Selected fridge type is above this package profile.');
    }

    if (input.acCount <= quote.maxAc) {
      score += 12;
    } else {
      blockers += 1;
      notes.push(`Supports up to ${quote.maxAc} AC unit(s).`);
    }

    if (input.washingMachineCount <= quote.maxWashingMachines) {
      score += 8;
    } else {
      blockers += 1;
      notes.push(`Supports up to ${quote.maxWashingMachines} washing machine(s).`);
    }

    if (input.washingMachineCount > 0 && hasHeavyWashingMachine(input.washingMachineSize) && !quote.supportsHeavyWashingMachine) {
      blockers += 1;
      notes.push('Large washing machine load may require a higher package.');
    } else {
      score += 4;
    }

    if (input.additionalAppliances.length > 0) {
      const unsupported = input.additionalAppliances.filter((item) => {
        if (item === 'EV charging (car charging)') return !quote.supportsEvCharging;
        return !quote.supportedExtras.includes(item);
      });

      if (unsupported.length === 0) {
        score += 10;
      } else if (unsupported.length <= 1) {
        score += 4;
        notes.push(`Check upgrade for: ${unsupported.join(', ')}.`);
      } else {
        blockers += 1;
        notes.push(`May not cover: ${unsupported.join(', ')}.`);
      }
    } else {
      score += 6;
    }

    return {
      quote,
      score,
      isStrongMatch: blockers === 0,
      notes,
    };
  });

  const strong = scored
    .filter((item) => item.isStrongMatch)
    .sort((a, b) => b.score - a.score || a.quote.price - b.quote.price);

  if (strong.length > 0) {
    return strong.slice(0, 6);
  }

  return scored.sort((a, b) => b.score - a.score || a.quote.price - b.quote.price).slice(0, 6);
}


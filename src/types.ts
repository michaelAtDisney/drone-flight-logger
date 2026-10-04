export type UnitSystem = 'imperial' | 'metric';

export interface AircraftItem {
  id: string;
  make: string;
  model: string;
  registration: string;
  serialNumber: string;
}

export interface BatteryItem {
  id: string;
  batteryCode: string;
  makeModel: string;
  totalCycles: number;
  healthPct: number;
  notes?: string;
}

export interface FlightLogData {
  // Mission & Time
  flightDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  location: string;
  coordinates: string;
  purpose: 'Commercial' | 'Training' | 'Mapping' | 'Recreational' | 'Inspection' | 'Search & Rescue';
  dayTakeoffs: number;
  dayLandings: number;
  nightTakeoffs: number;
  nightLandings: number;

  // Equipment
  aircraftMake: string;
  aircraftModel: string;
  aircraftRegistration: string;
  aircraftSerial: string;
  batteryIds: string[];
  batteryStartPct: number;
  batteryEndPct: number;
  maxAltitude: number; // ft or m based on unitSystem
  maxDistance: number; // ft or m based on unitSystem

  // Personnel & Environment
  pic: string;
  visualObservers: string[];
  wind: string;
  visibility: string;
  temperature: string;
  lighting: string;
  weatherNotes: string;

  // Events & Notes
  anomalies: string;
  notes: string;
}

export interface DronePluginSettings {
  defaultPic: string;
  unitSystem: UnitSystem;
  logFolderPath: string;
  filenameFormat: string;
  autoOpenNote: boolean;
  fleet: AircraftItem[];
  batteries: BatteryItem[];
}

export const DEFAULT_SETTINGS: DronePluginSettings = {
  defaultPic: 'Remote Pilot',
  unitSystem: 'imperial',
  logFolderPath: 'Drone Logs',
  filenameFormat: 'YYYY-MM-DD - Flight - {{aircraft}} - {{location}}',
  autoOpenNote: true,
  fleet: [
    {
      id: 'aircraft-1',
      make: 'DJI',
      model: 'Mavic 3 Enterprise',
      registration: 'FA3X99001',
      serialNumber: '1581F4EKD22001'
    },
    {
      id: 'aircraft-2',
      make: 'Autel',
      model: 'EVO II Pro 6K',
      registration: 'FA3X99002',
      serialNumber: 'AUTEL8899201'
    }
  ],
  batteries: [
    {
      id: 'bat-1',
      batteryCode: 'BAT-M3E-01',
      makeModel: 'DJI Mavic 3 Intelligent Battery',
      totalCycles: 14,
      healthPct: 98
    },
    {
      id: 'bat-2',
      batteryCode: 'BAT-M3E-02',
      makeModel: 'DJI Mavic 3 Intelligent Battery',
      totalCycles: 22,
      healthPct: 95
    },
    {
      id: 'bat-3',
      batteryCode: 'BAT-EVO-01',
      makeModel: 'Autel EVO II Battery',
      totalCycles: 8,
      healthPct: 99
    }
  ]
};

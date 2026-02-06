export interface SearchResponse {
  Succeeded: boolean;
  Buildings: string[];
}

export interface BinType {
  Size: number;
  Unit: string;
}

export interface RhService {
  NextWastePickup: string;
  WasteType: string;
  WastePickupFrequency: string;
  BinType: BinType;
}

export interface ScheduleResponse {
  RhServices: RhService[];
}

export interface WasteScheduleItem {
  wasteType: string;
  nextPickup: Date;
  daysRemaining: number;
  frequency: string;
  binSize: string;
  color: string;
  icon: string;
}

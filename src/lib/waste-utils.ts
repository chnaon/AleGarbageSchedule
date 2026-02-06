import { RhService, WasteScheduleItem } from "@/types/waste";

const WASTE_TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  Restavfall: { color: "#1a1a1a", icon: "🗑️" },
  Matavfall: { color: "#16a34a", icon: "🥬" },
  "Plast/Papp": { color: "#2563eb", icon: "📦" },
  "Plast- och pappersförpackningar": { color: "#2563eb", icon: "📦" },
  Trädgårdsavfall: { color: "#65a30d", icon: "🌿" },
  Tidningar: { color: "#7c3aed", icon: "📰" },
  Glas: { color: "#0891b2", icon: "🫙" },
  "Glasförpackningar ofärgade": { color: "#06b6d4", icon: "🫙" },
  "Glasförpackningar färgade": { color: "#0d9488", icon: "🫙" },
  Metall: { color: "#d97706", icon: "🥫" },
  Metallförpackningar: { color: "#d97706", icon: "🥫" },
  Elavfall: { color: "#dc2626", icon: "🔌" },
  Textil: { color: "#ec4899", icon: "👕" },
};

const DEFAULT_CONFIG = { color: "#6b7280", icon: "♻️" };

export function getWasteConfig(wasteType: string): {
  color: string;
  icon: string;
} {
  for (const [key, config] of Object.entries(WASTE_TYPE_CONFIG)) {
    if (wasteType.toLowerCase().includes(key.toLowerCase())) {
      return config;
    }
  }
  return DEFAULT_CONFIG;
}

export function getDaysRemaining(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function getDaysRemainingText(days: number): string {
  if (days < 0) return "Passerad";
  if (days === 0) return "Idag";
  if (days === 1) return "Imorgon";
  return `${days} dagar`;
}

export function parseSchedule(services: RhService[]): WasteScheduleItem[] {
  return services
    .map((service) => {
      const config = getWasteConfig(service.WasteType);
      const nextPickup = new Date(service.NextWastePickup);
      return {
        wasteType: service.WasteType,
        nextPickup,
        daysRemaining: getDaysRemaining(nextPickup),
        frequency: service.WastePickupFrequency,
        binSize: service.BinType
          ? `${service.BinType.Size} ${service.BinType.Unit}`
          : "",
        color: config.color,
        icon: config.icon,
      };
    })
    .sort((a, b) => a.nextPickup.getTime() - b.nextPickup.getTime());
}

export interface GroupedSchedule {
  date: Date;
  dateString: string;
  daysRemaining: number;
  items: WasteScheduleItem[];
}

export function groupByDate(items: WasteScheduleItem[]): GroupedSchedule[] {
  const groups = new Map<string, WasteScheduleItem[]>();

  for (const item of items) {
    const key = item.nextPickup.toISOString().split("T")[0];
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries())
    .map(([dateStr, groupItems]) => ({
      date: new Date(dateStr),
      dateString: dateStr,
      daysRemaining: groupItems[0].daysRemaining,
      items: groupItems,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

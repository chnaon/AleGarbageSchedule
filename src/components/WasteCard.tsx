"use client";

import { WasteScheduleItem } from "@/types/waste";
import { formatShortDate, getDaysRemainingText } from "@/lib/waste-utils";

interface WasteCardProps {
  item: WasteScheduleItem;
}

export default function WasteCard({ item }: WasteCardProps) {
  const daysText = getDaysRemainingText(item.daysRemaining);
  const isToday = item.daysRemaining === 0;
  const isTomorrow = item.daysRemaining === 1;
  const isPast = item.daysRemaining < 0;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        isToday
          ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          : isTomorrow
            ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
            : isPast
              ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      }`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: `${item.color}15` }}
      >
        {item.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-white text-sm">
          {item.wasteType}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatShortDate(item.nextPickup)}
          {item.binSize && ` · ${item.binSize}`}
        </div>
        {item.frequency && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {item.frequency}
          </div>
        )}
      </div>

      <div className="text-right shrink-0">
        <div
          className={`text-sm font-semibold ${
            isToday
              ? "text-amber-600 dark:text-amber-400"
              : isTomorrow
                ? "text-orange-600 dark:text-orange-400"
                : isPast
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-white"
          }`}
        >
          {daysText}
        </div>
      </div>
    </div>
  );
}

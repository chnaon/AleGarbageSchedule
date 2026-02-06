"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { formatDate, getDaysRemainingText } from "@/lib/waste-utils";
import WasteCard from "./WasteCard";

interface ScheduleViewProps {
  address: string;
  onChangeAddress: () => void;
}

export default function ScheduleView({
  address,
  onChangeAddress,
}: ScheduleViewProps) {
  const { grouped, loading, error, refresh } = useSchedule(address);

  const displayAddress = address.replace(/\s*\(.*\)/, "");
  const nearest = grouped[0];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Sophämtning
          </h1>
          <button
            onClick={onChangeAddress}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-1 mt-0.5"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {displayAddress}
          </button>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Uppdatera"
        >
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Loading state */}
      {loading && grouped.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Hämtar schema...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Nearest collection hero */}
      {nearest && (
        <div className="mb-6 p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white">
          <div className="text-sm font-medium text-green-100 mb-1">
            Nästa hämtning
          </div>
          <div className="text-3xl font-bold mb-1">
            {getDaysRemainingText(nearest.daysRemaining)}
          </div>
          <div className="text-green-100 text-sm">
            {formatDate(nearest.date)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {nearest.items.map((item, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium"
              >
                {item.icon} {item.wasteType}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule list */}
      {grouped.length > 0 && (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.dateString}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {formatDate(group.date)}
                </div>
              </div>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <WasteCard key={i} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification setup prompt */}
      <NotificationPrompt />
    </div>
  );
}

function NotificationPrompt() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  if (Notification.permission === "granted") {
    return null;
  }

  if (Notification.permission === "denied") {
    return null;
  }

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Register for notifications
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({ type: "SCHEDULE_NOTIFICATIONS" });
      }
    }
  };

  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-xl">🔔</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Aktivera påminnelser
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Få en påminnelse kvällen innan och på morgonen för sophämtning
          </p>
          <button
            onClick={requestPermission}
            className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Aktivera
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { ScheduleResponse, WasteScheduleItem } from "@/types/waste";
import { GroupedSchedule, parseSchedule, groupByDate } from "@/lib/waste-utils";

const CACHE_KEY = "ale-waste-schedule-cache";

interface CachedSchedule {
  address: string;
  data: ScheduleResponse;
  timestamp: number;
}

export function useSchedule(address: string | null) {
  const [items, setItems] = useState<WasteScheduleItem[]>([]);
  const [grouped, setGrouped] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/schedule?address=${encodeURIComponent(addr)}`
      );

      if (!response.ok) {
        throw new Error("Kunde inte hämta sophämtningsschema");
      }

      const data: ScheduleResponse = await response.json();

      // Cache the response
      const cached: CachedSchedule = {
        address: addr,
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));

      const parsed = parseSchedule(data.RhServices || []);
      setItems(parsed);
      setGrouped(groupByDate(parsed));
    } catch (err) {
      // Try to use cached data
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached: CachedSchedule = JSON.parse(cachedStr);
          if (cached.address === addr) {
            const parsed = parseSchedule(cached.data.RhServices || []);
            setItems(parsed);
            setGrouped(groupByDate(parsed));
            setError("Visar cachad data - kunde inte uppdatera");
            setLoading(false);
            return;
          }
        } catch {
          // Cache parse failed
        }
      }
      setError(
        err instanceof Error ? err.message : "Ett oväntat fel uppstod"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchSchedule(address);
    }
  }, [address, fetchSchedule]);

  const refresh = useCallback(() => {
    if (address) {
      fetchSchedule(address);
    }
  }, [address, fetchSchedule]);

  return { items, grouped, loading, error, refresh };
}

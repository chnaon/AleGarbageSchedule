"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ale-waste-address";

export function useAddress() {
  const [address, setAddressState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setAddressState(saved);
    setIsLoaded(true);
  }, []);

  const setAddress = useCallback((newAddress: string) => {
    localStorage.setItem(STORAGE_KEY, newAddress);
    setAddressState(newAddress);
  }, []);

  const clearAddress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAddressState(null);
  }, []);

  return { address, isLoaded, setAddress, clearAddress };
}

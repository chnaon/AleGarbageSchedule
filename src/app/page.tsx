"use client";

import { useState } from "react";
import { useAddress } from "@/hooks/useAddress";
import AddressSearch from "@/components/AddressSearch";
import ScheduleView from "@/components/ScheduleView";

export default function Home() {
  const { address, isLoaded, setAddress } = useAddress();
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!address || isChangingAddress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AddressSearch
          onSelect={(selected) => {
            setAddress(selected);
            setIsChangingAddress(false);
          }}
          currentAddress={isChangingAddress ? address : null}
          onCancel={
            isChangingAddress ? () => setIsChangingAddress(false) : undefined
          }
        />
      </div>
    );
  }

  return (
    <ScheduleView
      address={address}
      onChangeAddress={() => setIsChangingAddress(true)}
    />
  );
}

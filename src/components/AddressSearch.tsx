"use client";

import { useAddressSearch } from "@/hooks/useAddressSearch";

interface AddressSearchProps {
  onSelect: (address: string) => void;
  currentAddress?: string | null;
  onCancel?: () => void;
}

export default function AddressSearch({
  onSelect,
  currentAddress,
  onCancel,
}: AddressSearchProps) {
  const { query, results, loading, error, handleQueryChange, clear } =
    useAddressSearch();

  const handleSelect = (building: string) => {
    onSelect(building);
    clear();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🗑️</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sophämtning Ale
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentAddress
            ? "Byt adress för sophämtningsschema"
            : "Sök efter din adress för att se sophämtningsschema"}
        </p>
      </div>

      {currentAddress && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Nuvarande adress:{" "}
          </span>
          <span className="text-gray-900 dark:text-white font-medium">
            {currentAddress.replace(/\s*\(.*\)/, "")}
          </span>
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Sök adress..."
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            autoFocus
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            {results.map((building, index) => {
              const displayName = building.replace(/\s*\(.*\)/, "");
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(building)}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 shrink-0"
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
                    <span className="text-gray-900 dark:text-white text-sm">
                      {displayName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && !error && (
          <div className="mt-2 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Inga adresser hittades
          </div>
        )}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
        >
          Avbryt
        </button>
      )}
    </div>
  );
}

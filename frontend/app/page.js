"use client";

import { useCallback } from "react";
import { getDevices } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import DeviceCard from "@/components/DeviceCard";

export default function Overview() {
  const fetchDevices = useCallback(() => getDevices(), []);
  const { data: devices, error, loading } = usePolling(fetchDevices, 3000);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Device status at a glance — refreshing every 3s
          </p>
        </div>

        {loading && !devices && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">Could not reach backend.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {devices && devices.map((d) => <DeviceCard key={d.id} device={d} />)}
        </div>
      </div>
    </main>
  );
}
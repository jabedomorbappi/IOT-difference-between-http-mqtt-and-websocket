"use client";

import { useCallback } from "react";
import { getDevices } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import LEDToggle from "@/components/LEDToggle";

export default function Control() {
  const fetchDevices = useCallback(() => getDevices(), []);
  const { data: devices, loading } = usePolling(fetchDevices, 3000);

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Control</h1>
          <p className="text-sm text-gray-500 mt-1">Toggle outputs on your device</p>
        </div>

        {loading && !devices && <p className="text-gray-500">Loading...</p>}

        <div className="space-y-5">
          {devices &&
            devices.map((device) => (
              <div key={device.id} className="card p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  {device.name}
                </h2>
                <div className="space-y-3">
                  {device.leds.map((led) => (
                    <LEDToggle key={led.id} deviceId={device.device_id} led={led} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
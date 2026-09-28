"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getDevices } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { Wifi, WifiOff, Cpu, ArrowRight } from "lucide-react";

export default function Home() {
  const fetchDevices = useCallback(() => getDevices(), []);
  const { data: devices, error, loading } = usePolling(fetchDevices, 3000);

  const onlineCount = devices ? devices.filter((d) => d.is_online).length : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={22} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            IoT Control Platform
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Manage every device, from anywhere
        </h1>
        <p className="text-gray-500 mb-10 max-w-xl">
          Monitor sensors and control outputs across your home, farm, and
          facility devices in real time.
        </p>

        {loading && !devices && <p className="text-gray-500">Loading devices...</p>}
        {error && <p className="text-red-600">Could not reach backend.</p>}

        {devices && (
          <div className="flex items-center gap-6 mb-8 text-sm">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900">{devices.length}</span> devices
            </span>
            <span className="text-gray-500">
              <span className="font-semibold text-green-600">{onlineCount}</span> online
            </span>
          </div>
        )}

        {devices && devices.length === 0 && (
          <p className="text-gray-500">No devices yet. Add one in Django admin.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {devices &&
            devices.map((device) => {
              const outputs = device.channels.filter((c) => c.direction === "output").length;
              const inputs = device.channels.filter((c) => c.direction === "input").length;

              return (
                <Link
                  key={device.id}
                  href={`/devices/${device.device_id}`}
                  className="card p-6 group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{device.name}</h2>
                      <p className="text-sm text-gray-500">{device.device_id}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50">
                      {device.is_online ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                          <Wifi size={14} className="text-green-600" />
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <WifiOff size={14} className="text-red-600" />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{outputs} outputs</span>
                      <span>{inputs} sensors</span>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </main>
  );
}
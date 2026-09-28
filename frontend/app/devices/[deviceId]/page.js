"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { getDevices, getDevice } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { Wifi, WifiOff } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DigitalOutputToggle from "@/components/DigitalOutputToggle";
import AnalogOutputSlider from "@/components/AnalogOutputSlider";
import ChannelReadingCard from "@/components/ChannelReadingCard";

export default function DeviceDetail() {
  const { deviceId } = useParams();

  const fetchAllDevices = useCallback(() => getDevices(), []);
  const { data: allDevices } = usePolling(fetchAllDevices, 5000);

  const fetchDevice = useCallback(() => getDevice(deviceId), [deviceId]);
  const { data: device, error, loading } = usePolling(fetchDevice, 3000);

  return (
    <div className="flex">
      <Sidebar devices={allDevices || []} />

      <main className="flex-1 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {loading && !device && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-600">Could not reach backend.</p>}

          {device && (
            <>
              <div className="card p-6 flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{device.name}</h1>
                  <p className="text-sm text-gray-500">{device.device_id}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50">
                  {device.is_online ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                      <Wifi size={14} className="text-green-600" />
                      <span className="text-xs font-medium text-green-700">Online</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <WifiOff size={14} className="text-red-600" />
                      <span className="text-xs font-medium text-red-700">Offline</span>
                    </>
                  )}
                </div>
              </div>

              {device.channels.filter((c) => c.direction === "output").length > 0 && (
                <div className="card p-6 mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Outputs
                  </h3>
                  <div className="space-y-3">
                    {device.channels
                      .filter((c) => c.direction === "output")
                      .map((ch) =>
                        ch.signal_type === "digital" ? (
                          <DigitalOutputToggle
                            key={ch.id}
                            deviceId={device.device_id}
                            channel={ch}
                          />
                        ) : (
                          <AnalogOutputSlider
                            key={ch.id}
                            deviceId={device.device_id}
                            channel={ch}
                          />
                        )
                      )}
                  </div>
                </div>
              )}

              {device.channels.filter((c) => c.direction === "input").length > 0 && (
                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Sensors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {device.channels
                      .filter((c) => c.direction === "input")
                      .map((ch) => (
                        <ChannelReadingCard key={ch.id} channel={ch} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
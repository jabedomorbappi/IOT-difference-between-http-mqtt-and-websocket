
"use client";

import { useCallback } from "react";
import { getDevices } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { Wifi, WifiOff, Thermometer } from "lucide-react";
import LEDToggle from "@/components/LEDToggle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const fetchDevices = useCallback(() => getDevices(), []);
  const { data: devices, error, loading } = usePolling(fetchDevices, 3000);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">IoT Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live device monitoring &amp; control — refreshing every 3s
          </p>
        </div>

        {loading && !devices && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">Could not reach backend.</p>}
        {devices && devices.length === 0 && (
          <p className="text-gray-500">No devices yet. Add one in Django admin.</p>
        )}

        {devices &&
          devices.map((device) => {
            const readings = [...device.latest_readings].reverse();
            const latest = readings[readings.length - 1];
            const chartData = readings.map((r) => ({
              time: new Date(r.timestamp).toLocaleTimeString(),
              value: r.value,
            }));

            return (
              <div key={device.id} className="space-y-5 mb-10">
                <div className="card p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{device.name}</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Outputs
                    </h3>
                    <div className="space-y-3">
                      {device.leds.map((led) => (
                        <LEDToggle key={led.id} deviceId={device.device_id} led={led} />
                      ))}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Latest Reading
                    </h3>
                    {latest ? (
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                          <Thermometer size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {latest.value}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {latest.unit}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {latest.sensor_type} · {readings.length} readings
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 py-6 text-center">
                        No sensor data yet. Send a test reading from your phone.
                      </p>
                    )}
                  </div>
                </div>

                {readings.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Sensor Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </main>
  );
}

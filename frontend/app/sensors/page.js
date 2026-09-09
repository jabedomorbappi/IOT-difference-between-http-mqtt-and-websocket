"use client";

import { useCallback } from "react";
import { getDevices } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Sensors() {
  const fetchDevices = useCallback(() => getDevices(), []);
  const { data: devices, loading } = usePolling(fetchDevices, 3000);

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sensors</h1>
          <p className="text-sm text-gray-500 mt-1">Incoming readings from your device</p>
        </div>

        {loading && !devices && <p className="text-gray-500">Loading...</p>}

        {devices &&
          devices.map((device) => {
            const readings = [...device.latest_readings].reverse();
            const chartData = readings.map((r) => ({
              time: new Date(r.timestamp).toLocaleTimeString(),
              value: r.value,
            }));

            return (
              <div key={device.id} className="card p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  {device.name}
                </h2>

                {readings.length === 0 ? (
                  <p className="text-sm text-gray-400 py-10 text-center">
                    No sensor data yet. Send a test reading from your phone.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gray-50">
                        <p className="text-xs text-gray-500">Latest</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {readings[readings.length - 1].value}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            {readings[readings.length - 1].unit}
                          </span>
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize mt-1">
                          {readings[readings.length - 1].sensor_type}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <p className="text-xs text-gray-500">Total Readings</p>
                        <p className="text-2xl font-bold text-gray-900">{readings.length}</p>
                      </div>
                    </div>

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
                  </>
                )}
              </div>
            );
          })}
      </div>
    </main>
  );
}
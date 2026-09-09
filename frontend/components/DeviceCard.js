"use client";

import { Wifi, WifiOff } from "lucide-react";

export default function DeviceCard({ device }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Outputs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{device.leds.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Readings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {device.latest_readings.length}
          </p>
        </div>
      </div>
    </div>
  );
}
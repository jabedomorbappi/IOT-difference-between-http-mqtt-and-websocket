"use client";

import { useState, useEffect, useRef } from "react";
import { Sliders } from "lucide-react";
import { setChannelState } from "@/lib/api";

export default function AnalogOutputSlider({ deviceId, channel }) {
  const [value, setValue] = useState(channel.state ?? 0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setValue(channel.state ?? 0);
  }, [channel.state]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue); // update UI instantly

    // Debounce network calls so dragging the slider doesn't spam requests
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        await setChannelState(deviceId, channel.id, newValue);
      } catch (err) {
        console.error("Set analog value failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="py-3 px-4 rounded-xl bg-gray-50">
      <div className="flex items-center gap-3 mb-3">
        <Sliders size={20} className="text-blue-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{channel.label}</p>
          <p className="text-xs text-gray-500">GPIO {channel.pin}</p>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {value}
          {channel.unit && <span className="text-xs text-gray-500 ml-0.5">{channel.unit}</span>}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="255"
        value={value}
        onChange={handleChange}
        disabled={loading}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { toggleLed } from "@/lib/api";

export default function LEDToggle({ deviceId, led }) {
  const [state, setState] = useState(led.state);
  const [loading, setLoading] = useState(false);

  useEffect(() => setState(led.state), [led.state]);

  const handleToggle = async () => {
    setLoading(true);
    const newState = !state;
    setState(newState); // optimistic
    try {
      await toggleLed(deviceId, led.id, newState);
    } catch (err) {
      setState(!newState); // revert on failure
      console.error("Toggle failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
      <div className="flex items-center gap-3">
        <Lightbulb
          size={20}
          className={state ? "text-amber-500" : "text-gray-400"}
          fill={state ? "currentColor" : "none"}
        />
          <div>
            <p className="text-sm font-medium text-gray-900">{led.label}</p>
            <p className="text-xs text-gray-500">GPIO {led.pin}</p>
          </div>


            <div>
                <p className="text-sm font-medium text-gray-900">{led.label}</p>
                <p className="text-xs text-gray-500">
                  GPIO {led.pin}
                  {led.latency_ms != null && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {led.latency_ms}ms latency
                    </span>
                  )}
                </p>
          </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          state ? "bg-blue-600" : "bg-gray-300"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            state ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
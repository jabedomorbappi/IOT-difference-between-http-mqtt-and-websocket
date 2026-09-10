"use client";

import { useState, useEffect, useRef } from "react";
import { Lightbulb } from "lucide-react";
import { toggleLed } from "@/lib/api";

export default function LEDToggle({ deviceId, led }) {
  const [state, setState] = useState(led.state);
  const [loading, setLoading] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [frozenLatency, setFrozenLatency] = useState(null);

  const lastLatencyIdRef = useRef(null); // tracks which latency value we've already "consumed"

  useEffect(() => {
    setState(led.state);
  }, [led.state]);

  // When a genuinely NEW latency value arrives from backend, freeze it and stop measuring
  useEffect(() => {
    if (led.latency_ms != null && led.latency_ms !== lastLatencyIdRef.current) {
      lastLatencyIdRef.current = led.latency_ms;
      setFrozenLatency(led.latency_ms);
      setMeasuring(false);
    }
  }, [led.latency_ms]);

  const handleToggle = async () => {
    setLoading(true);
    setFrozenLatency(null);
    setMeasuring(true); // start "measuring..." until backend confirms

    const newState = !state;
    setState(newState);
    try {
      await toggleLed(deviceId, led.id, newState);
    } catch (err) {
      setState(!newState);
      setMeasuring(false);
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
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span>GPIO {led.pin}</span>
            {measuring && (
              <span className="text-gray-400 italic">measuring...</span>
            )}
            {!measuring && frozenLatency != null && (
              <span className="text-blue-600 font-medium">{frozenLatency}ms</span>
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
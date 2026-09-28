"use client";

import { useState, useEffect, useRef } from "react";
import { Lightbulb } from "lucide-react";
import { setChannelState } from "@/lib/api";

export default function DigitalOutputToggle({ deviceId, channel }) {
  const [state, setState] = useState(!!channel.state);
  const [loading, setLoading] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [frozenLatency, setFrozenLatency] = useState(null);
  const lastLatencyRef = useRef(null);

  useEffect(() => {
    setState(!!channel.state);
  }, [channel.state]);

  useEffect(() => {
    if (channel.latency_ms != null && channel.latency_ms !== lastLatencyRef.current) {
      lastLatencyRef.current = channel.latency_ms;
      setFrozenLatency(channel.latency_ms);
      setMeasuring(false);
    }
  }, [channel.latency_ms]);

  const handleToggle = async () => {
    setLoading(true);
    setFrozenLatency(null);
    setMeasuring(true);

    const newState = !state;
    setState(newState);
    try {
      await setChannelState(deviceId, channel.id, newState ? 1 : 0);
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
          <p className="text-sm font-medium text-gray-900">{channel.label}</p>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span>GPIO {channel.pin}</span>
            {measuring && <span className="text-gray-400 italic">measuring...</span>}
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
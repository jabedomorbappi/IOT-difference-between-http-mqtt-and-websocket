import { Activity, CircleDot, Circle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ChannelReadingCard({ channel }) {
  const readings = [...(channel.recent_readings || [])].reverse();
  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    value: r.value,
  }));

  const isDigital = channel.signal_type === "digital";
  const isActive = Number(channel.state) === 1;

  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isDigital && isActive ? "bg-green-50" : "bg-blue-50"}`}>
          {isDigital ? (
            isActive ? (
              <CircleDot size={18} className="text-green-600" />
            ) : (
              <Circle size={18} className="text-gray-400" />
            )
          ) : (
            <Activity size={18} className="text-blue-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{channel.label}</p>
          <p className="text-xs text-gray-500">GPIO {channel.pin}</p>
        </div>
        <div className="ml-auto text-right">
          {isDigital ? (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {isActive ? "Detected" : "Clear"}
            </span>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              {channel.state}
              <span className="text-xs font-normal text-gray-500 ml-1">{channel.unit}</span>
            </p>
          )}
        </div>
      </div>

      {!isDigital && readings.length > 0 && (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!isDigital && readings.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">No readings yet</p>
      )}
    </div>
  );
}
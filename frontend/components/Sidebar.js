"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, WifiOff, Cpu } from "lucide-react";

export default function Sidebar({ devices }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white min-h-screen p-4">
      <Link href="/" className="flex items-center gap-2 px-2 mb-6">
        <Cpu size={20} className="text-blue-600" />
        <span className="font-bold text-gray-900">IoT Control</span>
      </Link>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">
        Devices
      </p>

      <div className="space-y-1">
        {devices.map((d) => {
          const href = `/devices/${d.device_id}`;
          const active = pathname === href;
          return (
            <Link
              key={d.id}
              href={href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{d.name}</span>
              {d.is_online ? (
                <Wifi size={14} className="text-green-600" />
              ) : (
                <WifiOff size={14} className="text-gray-300" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
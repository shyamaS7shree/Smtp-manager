"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";

export default function OverviewChart({ data = [] }: { data: any[] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Campaign Overview</h2>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-[120px] h-9 text-xs font-semibold bg-white border-gray-200 rounded-lg">
            <SelectValue placeholder="Last 7 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-6 text-xs font-bold text-gray-600 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
          <span>Emails Sent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
          <span>Opens</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          <span>Clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span>Bounces</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} dx={-10} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px", fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="sent" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
            <Area type="monotone" dataKey="opens" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorOpens)" />
            <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
            <Area type="monotone" dataKey="bounces" stroke="#22c55e" strokeWidth={3} fill="none" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

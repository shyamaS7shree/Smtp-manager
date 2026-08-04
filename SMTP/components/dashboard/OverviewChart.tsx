"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const labels: Record<string, string> = {
      sent: "Emails sent",
      opens: "Opens",
      clicks: "Clicks",
      bounces: "Bounces"
    };
    
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-4 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] min-w-[160px]">
        <p className="text-gray-400 text-xs font-semibold mb-3 pb-2 border-b border-gray-50">{label}</p>
        <div className="flex flex-col gap-2.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">
                  {labels[entry.dataKey] || entry.name}
                </span>
              </div>
              <span className="text-gray-900 font-bold ml-4">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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
          <SelectTrigger className="w-[120px] h-9 text-xs font-semibold bg-white border-gray-200 rounded-lg focus:ring-0">
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

      <div className="flex-1 w-full min-h-[250px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} 
              dx={-10} 
              domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.2))]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area 
              type="monotone" 
              dataKey="sent" 
              stroke="#f97316" 
              strokeWidth={2} 
              fill="none" 
              dot={{ r: 4, strokeWidth: 1.5, fill: "#fff" }} 
              activeDot={{ r: 5, strokeWidth: 0, fill: "#f97316" }} 
            />
            <Area 
              type="monotone" 
              dataKey="opens" 
              stroke="#a855f7" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorOpens)" 
              dot={{ r: 4, strokeWidth: 1.5, fill: "#fff" }} 
              activeDot={{ r: 5, strokeWidth: 0, fill: "#a855f7" }} 
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              fill="none" 
              dot={{ r: 4, strokeWidth: 1.5, fill: "#fff" }} 
              activeDot={{ r: 5, strokeWidth: 0, fill: "#3b82f6" }} 
            />
            <Area 
              type="monotone" 
              dataKey="bounces" 
              stroke="#22c55e" 
              strokeWidth={2} 
              fill="none" 
              dot={{ r: 4, strokeWidth: 1.5, fill: "#fff" }} 
              activeDot={{ r: 5, strokeWidth: 0, fill: "#22c55e" }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { Mail, List, Users, FileText } from "lucide-react"

interface MetricCardProps {
  icon: string
  title: string
  value: number
  subtitle: string
  delay?: number
}

export default function MetricCard({ icon, title, value, subtitle, delay = 0 }: MetricCardProps) {
  const getConfig = () => {
    switch (icon) {
      case "Campaigns":
        return { icon: <Mail className="h-5 w-5 text-orange-500" />, bg: "bg-orange-100", stroke: "#f97316" }
      case "List":
        return { icon: <List className="h-5 w-5 text-fuchsia-500" />, bg: "bg-fuchsia-100", stroke: "#d946ef" }
      case "Subscribers":
        return { icon: <Users className="h-5 w-5 text-green-500" />, bg: "bg-green-100", stroke: "#22c55e" }
      case "Templates":
        return { icon: <FileText className="h-5 w-5 text-blue-500" />, bg: "bg-blue-100", stroke: "#3b82f6" }
      default:
        return { icon: <Mail className="h-5 w-5 text-gray-500" />, bg: "bg-gray-100", stroke: "#6b7280" }
    }
  }
  
  const config = getConfig()

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${config.bg}`}>
          {config.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          <span className="text-3xl font-extrabold text-gray-900 mt-1">{value}</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-4">
        <span className="text-[11px] font-semibold text-gray-400">{subtitle}</span>
        
        {/* Little sparkline graph */}
        <div className="w-16 h-8">
           <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
             <path 
               d="M0,35 Q10,30 20,32 T40,25 T60,20 T80,10 L100,5" 
               fill="none" 
               stroke={config.stroke} 
               strokeWidth="3" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
             />
           </svg>
        </div>
      </div>
    </div>
  )
}

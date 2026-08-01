"use client";

import { Target, ArrowUp, Mail } from "lucide-react";

export default function DeliverabilityCard({ rate = "99.8" }: { rate?: string }) {
  return (
    <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-2xl p-6 shadow-md h-full flex items-center justify-between text-white relative overflow-hidden">
      
      {/* Decorative background confetti and shapes */}
      <div className="absolute top-2 right-1/4 w-3 h-3 bg-yellow-300 transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-4 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
      <div className="absolute top-4 left-1/2 w-2 h-2 bg-white rounded-full opacity-60"></div>

      <div className="relative z-10 flex flex-col justify-center gap-1">
        <p className="text-[11px] text-white/90">Deliverability Rate</p>
        <div className="flex items-center gap-3 mt-1">
          <Target className="w-8 h-8 text-white" />
          <span className="text-3xl font-bold tracking-tighter">{rate}%</span>
          <div className="flex items-center gap-0.5 bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-500/30">
            <ArrowUp className="w-3 h-3" />
            2.4%
          </div>
        </div>
        <p className="text-[10px] text-white/60 mt-1">vs last 7 days</p>
      </div>

      <div className="relative z-10 hidden sm:block">
         <div className="w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 flex items-center justify-center transform rotate-12">
            <Mail className="w-8 h-8 text-white drop-shadow-md" />
         </div>
      </div>
    </div>
  );
}

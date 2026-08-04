"use client";

import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WelcomeBannerProps {
  name?: string;
  date?: DateRange | undefined;
  onDateChange?: (date: DateRange | undefined) => void;
}

export default function WelcomeBanner({ name = "Shyamashree", date, onDateChange }: WelcomeBannerProps) {
  // Format the name: "shyamashree24das" -> "Shyamashree"
  const formattedName = name.replace(/[0-9].*$/, '').trim();
  const displayName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start justify-between border border-orange-100 shadow-sm overflow-hidden mb-6">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-[20%] w-64 h-full pointer-events-none opacity-40 hidden lg:block">
        <svg viewBox="0 0 200 100" className="w-full h-full text-orange-200 fill-current">
          <path d="M0,50 Q50,0 100,50 T200,50" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          <polygon points="190,45 200,50 190,55" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, <br />
          <span className="text-orange-500">{displayName}!</span> 👋
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1 max-w-sm">
          Here's what's happening with your email platform today.
        </p>
      </div>

      <div className="relative z-10 mt-6 md:mt-0 flex items-center h-full">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            {currentTime ? (
              <>
                <span className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                  {format(currentTime, "hh:mm a")}
                </span>
                <span className="text-sm font-semibold text-gray-500 leading-tight">
                  {format(currentTime, "EEEE, MMMM do, yyyy")}
                </span>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="h-5 w-20 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

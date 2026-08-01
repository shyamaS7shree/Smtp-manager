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
          <span className="text-orange-500">{name}!</span> 👋
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1 max-w-sm">
          Here's what's happening with your email platform today.
        </p>
      </div>

      <div className="relative z-10 mt-6 md:mt-0">
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm rounded-xl py-5",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

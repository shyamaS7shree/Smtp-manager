"use client"
import React from "react"
import { Skeleton } from "./skeleton"

export default function SidebarNavSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  // Compact skeleton used while theme / client mount completes
  if (isMobile) {
    // For mobile we can return a slim vertical placeholder
    return (
      <div className="p-3 w-20">
        <div className="mb-3">
          <Skeleton className="h-8 w-12 rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-center px-4 py-3 mt-3 h-16">
        <Skeleton className="h-8 w-32 rounded" />
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-3 w-3 rounded" />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-4 ">
        <div className="rounded-md bg-orange-500 p-6 text-white">
          <Skeleton  className="h-3 w-20 mx-auto rounded mb-2" />
          <Skeleton  className="h-5 w-16 mx-auto rounded mb-2" />
          <Skeleton  className="h-3 w-14  rounded mb-2" />
          <Skeleton  className="h-4 w-full  rounded mb-2" />
          <Skeleton  className="h-3 w-8 mx-[80%] rounded mb-2" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>

      

    </div>
  )
}

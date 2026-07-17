"use client"
import React from "react"
import { Skeleton } from "./skeleton"

export default function ListsTableSkeleton() {
  const columns = [
    "Unique ID",
    "Name",
    "Display name",
    "Subscribers",
    "Opt in",
    "Opt out",
    "Date added",
    "Last updated",
    "Action",
  ]

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6">
              <Skeleton className="w-6 h-6 rounded" />
            </div>
            <div className="w-48">
              <Skeleton className="h-6 w-full rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>

        {/* Filters row */}
        <div className="mb-4 rounded-md border dark:border-gray-700  border-gray-200  shadow-sm">
          <div className="border-b dark:border-gray-700  border-gray-200 dark:bg-gray-950 bg-gray-50 p-2">
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-[600px]">
                {Array.from({ length: Math.min(columns.length, 6) }).map((_, i) => (
                  <div key={i} className="flex-1 min-w-[120px]">
                    <Skeleton className="h-8 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table skeleton */}
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b dark:border-gray-700  border-gray-200 dark:bg-gray-950 bg-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700"
                    >
                      <Skeleton className="h-4 w-24 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b dark:border-gray-700  border-gray-200">
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-700">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

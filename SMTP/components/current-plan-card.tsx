"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CurrentPlanCardProps {
  planName?: string
  storageUsed?: number
  storageTotal?: number
  className?: string
}

export default function CurrentPlanCard({
  planName = "BASIC",
  storageUsed = 40,
  storageTotal = 100,
  className = "",
}: CurrentPlanCardProps) {
  const storagePercentage = Math.min(Math.round((storageUsed / storageTotal) * 100), 100)

  return (
    <Card className={`border-0 bg-orange-500 text-white shadow-md ${className}`}>
      <CardHeader className="pb-2 pt-4">
        <h3 className="text-center text-xs font-medium text-orange-100">an</h3>
        <h2 className="text-center text-2xl font-bold tracking-wide">{planName}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-orange-100">STORAGE</span>
            <span className="text-xs font-medium text-orange-100">{storagePercentage}%</span>
          </div>
          <Progress
            value={storagePercentage}
            className="h-2 bg-orange-400 [&>div]:bg-white"
          />
        </div>

        {/* ✅ Upgrade button — disabled for now, link will be added later */}
        <button
          disabled
          className="w-full rounded-md bg-white py-2 text-sm font-medium text-orange-500 opacity-80 cursor-not-allowed"
        >
          Upgrade Plan
        </button>
      </CardContent>
    </Card>
  )
}
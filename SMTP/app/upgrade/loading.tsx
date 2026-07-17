import { Skeleton } from "@/components/ui/skeleton"

export default function UpgradeLoading() { 
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-8" />

          {/* Payment Methods Skeleton */}
          <div className="flex justify-center items-center gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>

        {/* Pricing Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-lg">
              <Skeleton className="h-8 w-32 mx-auto mb-4" />
              <Skeleton className="h-12 w-24 mx-auto mb-6" />
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>

        {/* View More Button Skeleton */}
        <div className="text-center mt-12">
          <Skeleton className="h-12 w-40 mx-auto" />
        </div>
      </div>
    </div>
  )
}

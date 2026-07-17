import { Skeleton } from "@/components/ui/skeleton"
import SidebarNav from "@/components/sidebar-nav"

export default function CreateSegmentLoading() {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mx-auto max-w-4xl">
              {/* Header Skeleton */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>

              {/* Form Skeleton */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="space-y-8">
                  {/* Name and Operator Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  {/* Custom Fields Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-80" />
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Campaign Conditions Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-96" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6">
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

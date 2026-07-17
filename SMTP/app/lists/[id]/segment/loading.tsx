import SidebarNav from "@/components/sidebar-nav"

export default function SegmentsLoading() {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
